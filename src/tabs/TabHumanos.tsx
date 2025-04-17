import React, { useState } from 'react';
// import { gerarHumanos } from '../utils/generateHumans';
// import { Grupo, NivelTecnologico, NivelMagico } from '../utils/generateHumans';


interface TabProps {
  apiKey?: string;
}

const grupos = ['Bandidos', 'Piratas', 'Piratas Espaciais', 'Guardas', 'Soldados'];
const niveisTecnologicos = ['Baixo', 'Médio', 'Alto', 'Muito Alto'];
const niveisMagicos = ['Nenhum', 'Baixo', 'Médio', 'Alto'];
const niveis = [0, 1, 2, 3, 4, 5];
// const [grupoSelecionado, setGrupoSelecionado] = useState('Bandidos');
// const [nivelTecnologico, setNivelTecnologico] = useState('Baixo');
// const [nivelMagicoSelecionado, setNivelMagicoSelecionado] = useState('Nenhum');
// const [quantidade, setQuantidade] = useState(1);
// const [nivelPericia, setNivelPericia] = useState(0);


const labelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '12px',
  gap: '12px',
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px',
  borderRadius: '8px',
  fontSize: '16px',
  boxSizing: 'border-box',
};

const TabHumanos: React.FC<TabProps> = ({  }) => {
  const [grupo, setGrupo] = useState('Bandidos');
  const [nivelTecnologico, setNivelTecnologico] = useState('Baixo');
  const [nivelMagico, setNivelMagico] = useState('Nenhum');
  const [quantidade, setQuantidade] = useState(1);
  const [nivel, setNivel] = useState(0);

  // const handleGerarGrupo = () => {
  //   const grupo = grupoSelecionado as Grupo;
  //   const nivelTec = nivelTecnologico as NivelTecnologico;
  //   const nivelMagico = nivelMagicoSelecionado as NivelMagico;
  //   const qtd = Number(quantidade);
  //   const nivel = Number(nivelPericia);
  
  //   const humanosGerados = gerarHumanos(grupo, nivelTec, nivelMagico, qtd, nivel);
  
  //   console.log(humanosGerados);
  // };
  
  

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "12px" }}>
      <h2 style={{ fontSize: "22px", marginBottom: "20px" }}>
        Gerador de Humanos
      </h2>

      <div style={labelStyle}>
        <label htmlFor="grupo" style={{ width: "140px" }}>
          Grupo:
        </label>
        <select
          id="grupo"
          value={grupo}
          onChange={(e) => setGrupo(e.target.value)}
          style={inputStyle}
        >
          {grupos.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <div style={labelStyle}>
        <label htmlFor="tec" style={{ width: "140px" }}>
          Tecnologia:
        </label>
        <select
          id="tec"
          value={nivelTecnologico}
          onChange={(e) => setNivelTecnologico(e.target.value)}
          style={inputStyle}
        >
          {niveisTecnologicos.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div style={labelStyle}>
        <label htmlFor="magia" style={{ width: "140px" }}>
          Magia:
        </label>
        <select
          id="magia"
          value={nivelMagico}
          onChange={(e) => setNivelMagico(e.target.value)}
          style={inputStyle}
        >
          {niveisMagicos.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div style={labelStyle}>
        <label htmlFor="quant" style={{ width: "140px" }}>
          Quantidade:
        </label>
        <input
          id="quant"
          type="number"
          value={quantidade}
          onChange={(e) =>
            setQuantidade(Math.max(0, Math.min(20, Number(e.target.value))))
          }
          min={0}
          max={20}
          style={inputStyle}
        />
      </div>

      <div style={labelStyle}>
        <label htmlFor="nivel" style={{ width: "140px" }}>
          Dificuldade:
        </label>
        <select
          id="nivel"
          value={nivel}
          onChange={(e) => setNivel(Number(e.target.value))}
          style={inputStyle}
        >
          {niveis.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: "24px" }}>
        <button
          // onClick={handleGerarGrupo}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            backgroundColor: "#5a00b1",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontFamily: "Times New Roman, serif",
          }}
        >
          GERAR GRUPO
        </button>
      </div>
    </div>
  );
};

export default TabHumanos;
