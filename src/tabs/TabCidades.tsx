import React, { useState } from "react";
import CityResultCard from "../components/CityResultCard";
import {
  cityEnvironmentOptions,
  citySizeOptions,
  cityThemeOptions,
  CityEnvironmentOption,
  CitySizeOption,
  CityThemeOption,
  generateCity,
  GeneratedCity,
} from "../utils/cities/generateCity";

const labelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "12px",
  gap: "12px",
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: "8px",
  borderRadius: "8px",
  fontSize: "16px",
  boxSizing: "border-box",
  backgroundColor: "#111",
  color: "#fff",
  border: "1px solid #555",
};

function TabCidades() {
  const [porte, setPorte] = useState<CitySizeOption>("Aleatório");
  const [ambiente, setAmbiente] = useState<CityEnvironmentOption>("Aleatório");
  const [estilo, setEstilo] = useState<CityThemeOption>("Aleatório");
  const [cidade, setCidade] = useState<GeneratedCity | null>(null);

  const handleGenerate = () => {
    setCidade(generateCity({ size: porte, environment: ambiente, theme: estilo }));
  };

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "12px" }}>
      <h2 style={{ fontSize: "22px", marginBottom: "8px", color: "#fff", textAlign: "center" }}>
        Gerador de Cidades
      </h2>
      <p style={{ color: "#bbb", fontSize: "16px", textAlign: "center", margin: "0 0 22px" }}>
        Gere uma cidade com locais, personagens, facções e conflitos prontos para uma aventura.
      </p>

      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={labelStyle}>
          <label htmlFor="porte-cidade" style={{ width: "120px", color: "#fff" }}>Porte:</label>
          <select id="porte-cidade" value={porte} onChange={(event) => setPorte(event.target.value as CitySizeOption)} style={inputStyle}>
            {citySizeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>

        <div style={labelStyle}>
          <label htmlFor="ambiente-cidade" style={{ width: "120px", color: "#fff" }}>Ambiente:</label>
          <select id="ambiente-cidade" value={ambiente} onChange={(event) => setAmbiente(event.target.value as CityEnvironmentOption)} style={inputStyle}>
            {cityEnvironmentOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>

        <div style={labelStyle}>
          <label htmlFor="estilo-cidade" style={{ width: "120px", color: "#fff" }}>Estilo:</label>
          <select id="estilo-cidade" value={estilo} onChange={(event) => setEstilo(event.target.value as CityThemeOption)} style={inputStyle}>
            {cityThemeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>

        <button className="btn-generate" type="button" onClick={handleGenerate} style={{ marginTop: "10px" }}>
          GERAR CIDADE
        </button>
      </div>

      {cidade && <CityResultCard city={cidade} onGenerateAgain={handleGenerate} />}
    </div>
  );
}

export default TabCidades;
