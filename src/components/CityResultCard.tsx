import React from "react";
import { GeneratedCity } from "../utils/cities/generateCity";

interface CityResultCardProps {
  city: GeneratedCity;
  onGenerateAgain: () => void;
  generateAgainLabel?: string;
}

const sectionStyle: React.CSSProperties = {
  marginTop: "22px",
  paddingTop: "14px",
  borderTop: "1px solid rgba(43, 43, 43, 0.35)",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 style={{ margin: "0 0 10px", fontSize: "22px" }}>{children}</h3>;
}

function CityResultCard({
  city,
  onGenerateAgain,
  generateAgainLabel = "GERAR OUTRA CIDADE",
}: CityResultCardProps) {
  return (
    <article
      style={{
        marginTop: "26px",
        padding: "24px",
        borderRadius: "12px",
        backgroundImage: 'url("/papel-textura.jpg")',
        backgroundSize: "cover",
        color: "#2b2b2b",
        fontFamily: "Morris Roman",
        lineHeight: 1.5,
        boxShadow: "0 0 20px rgba(0, 0, 0, 0.3)",
      }}
      aria-live="polite"
    >
      <header style={{ textAlign: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0, fontSize: "34px" }}>{city.nome}</h2>
        <div style={{ fontSize: "19px", fontStyle: "italic" }}>{city.alcunha}</div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "8px 20px" }}>
        <div><strong>Porte:</strong> {city.porte}</div>
        <div><strong>População:</strong> {city.populacao.toLocaleString("pt-BR")}</div>
        <div><strong>Ambiente:</strong> {city.ambiente}</div>
        <div><strong>Estilo:</strong> {city.estilo}</div>
        <div><strong>Idade:</strong> {city.idade}</div>
        <div><strong>Riqueza:</strong> {city.riqueza}</div>
      </div>

      <section style={sectionStyle}>
        <SectionTitle>Identidade e governo</SectionTitle>
        <p><strong>Governo:</strong> {city.governo}</p>
        <p><strong>Governante:</strong> {city.governante}</p>
        <p><strong>Habitantes:</strong> {city.povo}</p>
        <p><strong>Atmosfera:</strong> {city.atmosfera}</p>
        <p><strong>Arquitetura:</strong> {city.arquitetura}</p>
        <p><strong>Presença mágica:</strong> {city.presencaMagica}</p>
      </section>

      <section style={sectionStyle}>
        <SectionTitle>Economia</SectionTitle>
        <p><strong>Atividade principal:</strong> {city.atividadePrincipal}</p>
        <p><strong>Exporta:</strong> {city.exportacoes.join(", ")}</p>
        <p><strong>Importa:</strong> {city.importacoes.join(", ")}</p>
        <p><strong>Mercado:</strong> {city.mercado}</p>
      </section>

      <section style={sectionStyle}>
        <SectionTitle>Defesa, leis e costumes</SectionTitle>
        <p><strong>Defesas:</strong> {city.defesa}</p>
        <p><strong>Guarda:</strong> {city.guarda}</p>
        <p><strong>Lei incomum:</strong> {city.leiIncomum}</p>
        <p><strong>Costume local:</strong> {city.costumeLocal}</p>
        <p><strong>Próximo evento:</strong> {city.eventoProximo}</p>
      </section>

      <section style={sectionStyle}>
        <SectionTitle>Distritos</SectionTitle>
        {city.distritos.map((district, index) => (
          <div key={`${district.nome}-${index}`} style={{ marginBottom: "10px" }}>
            <strong>{district.nome}:</strong> {district.descricao}
          </div>
        ))}
      </section>

      <section style={sectionStyle}>
        <SectionTitle>Locais importantes</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px" }}>
          {city.pontosDeInteresse.map((location, index) => (
            <div key={`${location.tipo}-${location.nome}-${index}`} style={{ padding: "10px", border: "1px solid rgba(43, 43, 43, 0.35)", borderRadius: "8px" }}>
              <strong>{location.nome}</strong>
              <div style={{ fontStyle: "italic" }}>{location.tipo}</div>
              <div>{location.detalhe}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={sectionStyle}>
        <SectionTitle>Facções</SectionTitle>
        {city.faccoes.map((faction, index) => (
          <div key={`${faction.nome}-${index}`} style={{ marginBottom: "13px" }}>
            <strong>{faction.nome}</strong>
            <div><strong>Objetivo:</strong> {faction.objetivo}</div>
            <div><strong>Método:</strong> {faction.metodo}</div>
          </div>
        ))}
      </section>

      <section style={sectionStyle}>
        <SectionTitle>NPCs importantes</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px" }}>
          {city.npcs.map((npc, index) => (
            <div key={`${npc.nome}-${index}`} style={{ padding: "10px", border: "1px solid rgba(43, 43, 43, 0.35)", borderRadius: "8px" }}>
              <strong>{npc.nome}</strong> — {npc.funcao}
              <div><strong>Traço:</strong> {npc.traco}</div>
              <div><strong>Segredo:</strong> {npc.segredo}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={sectionStyle}>
        <SectionTitle>Problemas atuais</SectionTitle>
        <ul>{city.problemas.map((problem, index) => <li key={`${problem}-${index}`}>{problem}</li>)}</ul>
      </section>

      <section style={sectionStyle}>
        <SectionTitle>Rumores</SectionTitle>
        <ul>{city.rumores.map((rumor, index) => <li key={`${rumor}-${index}`}>{rumor}</li>)}</ul>
      </section>

      <section style={sectionStyle}>
        <SectionTitle>Ganchos de aventura</SectionTitle>
        <ol>{city.ganchos.map((hook, index) => <li key={`${hook}-${index}`}>{hook}</li>)}</ol>
      </section>

      <button className="btn-generate" type="button" onClick={onGenerateAgain} style={{ marginTop: "24px" }}>
        {generateAgainLabel}
      </button>
    </article>
  );
}

export default CityResultCard;
