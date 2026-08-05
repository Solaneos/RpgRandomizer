import React, { useState } from "react";
import { generateCityWithAI } from "../api/geminiAI";
import { saveHistoryInBackground } from "../api/history";
import CityResultCard from "../components/CityResultCard";
import {
  cityEnvironmentOptions,
  citySizeOptions,
  cityThemeOptions,
  CityEnvironmentOption,
  CitySizeOption,
  CityThemeOption,
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

function TabCidadesIA() {
  const [porte, setPorte] = useState<CitySizeOption>("Aleatório");
  const [ambiente, setAmbiente] = useState<CityEnvironmentOption>("Aleatório");
  const [estilo, setEstilo] = useState<CityThemeOption>("Aleatório");
  const [detalhes, setDetalhes] = useState("");
  const [cidade, setCidade] = useState<GeneratedCity | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const handleGenerate = async () => {
    setCarregando(true);
    setErro("");
    setCidade(null);

    try {
      const generatedCity = await generateCityWithAI({
        size: porte,
        environment: ambiente,
        theme: estilo,
        details: detalhes,
      });
      setCidade(generatedCity);
      saveHistoryInBackground({
        type: "city-ai",
        title: generatedCity.nome,
        input: { size: porte, environment: ambiente, theme: estilo, details: detalhes },
        result: { ...generatedCity },
      });
    } catch (error: unknown) {
      setErro(error instanceof Error ? error.message : "Não foi possível gerar a cidade com o Gemini.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "12px" }}>
      <h2 style={{ fontSize: "22px", marginBottom: "8px", color: "#fff", textAlign: "center" }}>
        Gerador de Cidades com IA
      </h2>
      <p style={{ color: "#bbb", fontSize: "16px", textAlign: "center", margin: "0 0 22px" }}>
        Escolha as opções e descreva qualquer detalhe que deve fazer parte da cidade.
      </p>

      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={labelStyle}>
          <label htmlFor="porte-cidade-ia" style={{ width: "120px", color: "#fff" }}>Porte:</label>
          <select id="porte-cidade-ia" value={porte} onChange={(event) => setPorte(event.target.value as CitySizeOption)} style={inputStyle}>
            {citySizeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>

        <div style={labelStyle}>
          <label htmlFor="ambiente-cidade-ia" style={{ width: "120px", color: "#fff" }}>Ambiente:</label>
          <select id="ambiente-cidade-ia" value={ambiente} onChange={(event) => setAmbiente(event.target.value as CityEnvironmentOption)} style={inputStyle}>
            {cityEnvironmentOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>

        <div style={labelStyle}>
          <label htmlFor="estilo-cidade-ia" style={{ width: "120px", color: "#fff" }}>Estilo:</label>
          <select id="estilo-cidade-ia" value={estilo} onChange={(event) => setEstilo(event.target.value as CityThemeOption)} style={inputStyle}>
            {cityThemeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label htmlFor="detalhes-cidade-ia" style={{ display: "block", marginBottom: "8px", color: "#fff" }}>
            Detalhes adicionais:
          </label>
          <textarea
            id="detalhes-cidade-ia"
            value={detalhes}
            onChange={(event) => setDetalhes(event.target.value)}
            placeholder="Ex.: cidade construída ao redor de um dragão adormecido, governada por comerciantes e ameaçada por uma guerra"
            maxLength={3000}
            rows={5}
            style={{ ...inputStyle, width: "100%", resize: "vertical" }}
          />
        </div>

        <button className="btn-generate" type="button" disabled={carregando} onClick={handleGenerate}>
          {carregando ? "GERANDO CIDADE..." : "GERAR CIDADE COM IA"}
        </button>

        {erro && <p role="alert" style={{ color: "#ff6b6b", marginTop: "12px" }}>{erro}</p>}
      </div>

      {cidade && (
        <CityResultCard
          city={cidade}
          onGenerateAgain={handleGenerate}
          generateAgainLabel="GERAR OUTRA CIDADE COM IA"
        />
      )}
    </div>
  );
}

export default TabCidadesIA;
