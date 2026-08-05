import React, { useState } from "react";
import {
  generateHumanEnemyGroup,
  GeneratedHumanEnemyGroup,
} from "../api/geminiAI";
import { saveHistoryInBackground } from "../api/history";
import {
  Grupo,
  NivelMagico,
  NivelTecnologico,
} from "../utils/humans/generateHumans";

const grupos: Grupo[] = ["Bandidos", "Piratas", "Piratas Espaciais", "Guardas", "Soldados", "Gangues"];
const niveisTecnologicos: NivelTecnologico[] = ["Baixo", "Medio", "Alto", "Muito Alto"];
const niveisMagicos: NivelMagico[] = ["Nenhum", "Baixo", "Medio", "Alto"];
const niveis = [0, 1, 2, 3, 4, 5];
const MAX_AI_ENEMIES = 12;

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

const resultCardStyle: React.CSSProperties = {
  marginTop: "24px",
  padding: "20px",
  borderRadius: "12px",
  backgroundImage: 'url("/papel-textura.jpg")',
  backgroundSize: "cover",
  color: "#2b2b2b",
  fontFamily: "Morris Roman",
  lineHeight: 1.5,
};

const TabHumanosIA: React.FC = () => {
  const [grupo, setGrupo] = useState<Grupo>("Bandidos");
  const [nivelTecnologico, setNivelTecnologico] = useState<NivelTecnologico>("Baixo");
  const [nivelMagico, setNivelMagico] = useState<NivelMagico>("Nenhum");
  const [quantidade, setQuantidade] = useState(3);
  const [nivel, setNivel] = useState(0);
  const [contexto, setContexto] = useState("");
  const [resultado, setResultado] = useState<GeneratedHumanEnemyGroup | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const handleGerarGrupo = async () => {
    setCarregando(true);
    setErro("");
    setResultado(null);

    try {
      const grupoGerado = await generateHumanEnemyGroup({
        groupType: grupo,
        technologyLevel: nivelTecnologico,
        magicLevel: nivelMagico,
        quantity: quantidade,
        difficulty: nivel,
        context: contexto,
      });
      setResultado(grupoGerado);
      saveHistoryInBackground({
        type: "human-group-ai",
        title: grupoGerado.nomeDoGrupo,
        input: {
          groupType: grupo,
          technologyLevel: nivelTecnologico,
          magicLevel: nivelMagico,
          quantity: quantidade,
          difficulty: nivel,
          context: contexto,
        },
        result: { ...grupoGerado },
      });
    } catch (error: unknown) {
      setErro(error instanceof Error ? error.message : "Não foi possível gerar o grupo com o Gemini.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "12px" }}>
      <h2 style={{ fontSize: "22px", marginBottom: "20px", color: "#fff", textAlign: "center" }}>
        Gerador de Humanos com IA
      </h2>

      <div style={labelStyle}>
        <label htmlFor="grupo-ia" style={{ width: "140px", color: "#fff" }}>Grupo:</label>
        <select id="grupo-ia" value={grupo} onChange={(event) => setGrupo(event.target.value as Grupo)} style={inputStyle}>
          {grupos.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      <div style={labelStyle}>
        <label htmlFor="tecnologia-ia" style={{ width: "140px", color: "#fff" }}>Tecnologia:</label>
        <select
          id="tecnologia-ia"
          value={nivelTecnologico}
          onChange={(event) => setNivelTecnologico(event.target.value as NivelTecnologico)}
          style={inputStyle}
        >
          {niveisTecnologicos.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      <div style={labelStyle}>
        <label htmlFor="magia-ia" style={{ width: "140px", color: "#fff" }}>Magia:</label>
        <select id="magia-ia" value={nivelMagico} onChange={(event) => setNivelMagico(event.target.value as NivelMagico)} style={inputStyle}>
          {niveisMagicos.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      <div style={labelStyle}>
        <label htmlFor="quantidade-ia" style={{ width: "140px", color: "#fff" }}>Quantidade:</label>
        <input
          id="quantidade-ia"
          type="number"
          value={quantidade}
          onChange={(event) => setQuantidade(Math.max(1, Math.min(MAX_AI_ENEMIES, Number(event.target.value))))}
          min={1}
          max={MAX_AI_ENEMIES}
          style={inputStyle}
        />
      </div>

      <div style={labelStyle}>
        <label htmlFor="dificuldade-ia" style={{ width: "140px", color: "#fff" }}>Dificuldade:</label>
        <select id="dificuldade-ia" value={nivel} onChange={(event) => setNivel(Number(event.target.value))} style={inputStyle}>
          {niveis.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label htmlFor="contexto-ia" style={{ display: "block", marginBottom: "8px", color: "#fff" }}>
          Contexto do encontro:
        </label>
        <textarea
          id="contexto-ia"
          value={contexto}
          onChange={(event) => setContexto(event.target.value)}
          placeholder="Ex.: mercenários protegendo uma ponte durante uma tempestade"
          maxLength={2000}
          rows={4}
          style={{ ...inputStyle, width: "100%", resize: "vertical" }}
        />
      </div>

      <button className="btn-generate" type="button" disabled={carregando} onClick={handleGerarGrupo}>
        {carregando ? "GERANDO GRUPO..." : "GERAR GRUPO COM IA"}
      </button>

      {erro && (
        <p role="alert" style={{ color: "#ff6b6b", marginTop: "12px" }}>
          {erro}
        </p>
      )}

      {resultado && (
        <section style={resultCardStyle} aria-live="polite">
          <h2 style={{ fontSize: "26px" }}>{resultado.nomeDoGrupo}</h2>
          <p>{resultado.descricao}</p>
          <p><strong>Estratégia:</strong> {resultado.estrategia}</p>

          {resultado.inimigos.map((inimigo, index) => (
            <article
              key={`${inimigo.nome}-${index}`}
              style={{ marginTop: "16px", padding: "14px", border: "1px solid rgba(43, 43, 43, 0.45)", borderRadius: "8px" }}
            >
              <h3 style={{ margin: "0 0 8px" }}>{inimigo.nome}</h3>
              <div><strong>Função:</strong> {inimigo.funcao}</div>
              <div><strong>Aparência:</strong> {inimigo.aparencia}</div>
              <div><strong>Ataque:</strong> {inimigo.ataque} | <strong>Defesa:</strong> {inimigo.defesa}</div>
              <div><strong>Armas:</strong> {inimigo.armas.join(", ")}</div>
              {inimigo.magias.length > 0 && (
                <div><strong>Magias:</strong> {inimigo.magias.join(", ")}</div>
              )}
            </article>
          ))}
        </section>
      )}
    </div>
  );
};

export default TabHumanosIA;
