import React, { useState } from 'react';
import { gerarHumanos, Grupo, NivelTecnologico, NivelMagico } from '../utils/generateHumans';

interface TabProps {
  apiKey?: string;
  useOpenAI: boolean;
}

const grupos: Grupo[] = ['Bandidos', 'Piratas', 'Piratas Espaciais', 'Guardas', 'Soldados', 'Gangues'];
const niveisTecnologicos: NivelTecnologico[] = ['Baixo', 'Medio', 'Alto', 'Muito Alto'];
const niveisMagicos: NivelMagico[] = ['Nenhum', 'Baixo', 'Medio', 'Alto'];
const niveis = [0, 1, 2, 3, 4, 5];

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

const TabHumanos: React.FC<TabProps> = () => {
  const [grupo, setGrupo] = useState<Grupo>('Bandidos');
  const [nivelTecnologico, setNivelTecnologico] = useState<NivelTecnologico>('Baixo');
  const [nivelMagico, setNivelMagico] = useState<NivelMagico>('Nenhum');
  const [quantidade, setQuantidade] = useState(1);
  const [nivel, setNivel] = useState(0);
  const [resultado, setResultado] = useState<ReturnType<typeof gerarHumanos>>([]);
  const [erro, setErro] = useState('');

  const handleGerarGrupo = () => {
    try {
      setErro('')
      const gerados = gerarHumanos(grupo, nivelTecnologico, nivelMagico, quantidade, nivel);
      setResultado(gerados);
    } catch (err: any){
      setErro(err.message);
      setResultado([]);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '12px' }}>
      <h2 style={{ fontSize: '22px', marginBottom: '20px', color: '#fff' }}>Gerador de Humanos</h2>

      <div style={labelStyle}>
        <label htmlFor="grupo" style={{ width: '140px', color: '#fff' }}>Grupo:</label>
        <select id="grupo" value={grupo} onChange={(e) => setGrupo(e.target.value as Grupo)} style={inputStyle}>
          {grupos.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <div style={labelStyle}>
        <label htmlFor="tec" style={{ width: '140px', color: '#fff' }}>Tecnologia:</label>
        <select id="tec" value={nivelTecnologico} onChange={(e) => setNivelTecnologico(e.target.value as NivelTecnologico)} style={inputStyle}>
          {niveisTecnologicos.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <div style={labelStyle}>
        <label htmlFor="magia" style={{ width: '140px', color: '#fff' }}>Magia:</label>
        <select id="magia" value={nivelMagico} onChange={(e) => setNivelMagico(e.target.value as NivelMagico)} style={inputStyle}>
          {niveisMagicos.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <div style={labelStyle}>
        <label htmlFor="quant" style={{ width: '140px', color: '#fff' }}>Quantidade:</label>
        <input
          id="quant"
          type="number"
          value={quantidade}
          onChange={(e) => setQuantidade(Math.max(0, Math.min(20, Number(e.target.value))))}
          min={0}
          max={20}
          style={inputStyle}
        />
      </div>

      <div style={labelStyle}>
        <label htmlFor="nivel" style={{ width: '140px', color: '#fff' }}>Dificuldade:</label>
        <select id="nivel" value={nivel} onChange={(e) => setNivel(Number(e.target.value))} style={inputStyle}>
          {niveis.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <div style={{ marginTop: '24px' }}>
        <button
          onClick={handleGerarGrupo}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            backgroundColor: '#5a00b1',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'Times New Roman, serif',
          }}
        >
          GERAR GRUPO
        </button>

        {erro && (
          <div style={{ color: 'red', marginTop: '12px' }}>
            {erro}
          </div>
        )}

      </div>

      {resultado.length > 0 && (
        <div style={{ marginTop: '24px', color: '#fff' }}>
          {resultado.map((h, idx) => (
            <div key={idx} style={{ marginBottom: '12px', padding: '12px', border: '1px solid #555', borderRadius: '8px' }}>
              <strong>{h.nome}</strong>
              <div>Ataque: {h.ataque} | Defesa: {h.defesa}</div>
              <div>Armas: {h.armas.join(', ')}</div>
              {h.magias && h.magias.length > 0 && (
                <div>Magias: {h.magias.join(', ')}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TabHumanos;
