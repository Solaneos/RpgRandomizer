import React, { useState } from 'react';
import { gerarNomeAleatorio } from '../utils/humans/nomeGenerator.ts';

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
  backgroundColor: '#111',
  color: '#fff',
  border: '1px solid #555',
};

const TabNomes: React.FC = () => {
  const [estilo, setEstilo] = useState('comum');
  const [genero, setGenero] = useState('masculino');
  const [incluirSobrenome, setIncluirSobrenome] = useState(true);
  const [nomeGerado, setNomeGerado] = useState('');

  const gerarNome = () => {
    const nome = gerarNomeAleatorio(estilo, genero, incluirSobrenome);
    setNomeGerado(nome);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '12px' }}>
      <h2
        style={{
          fontSize: '22px',
          marginBottom: '20px',
          color: '#fff',
          textAlign: 'center',
        }}
      >
        Gerador de Nomes
      </h2>

      <div style={labelStyle}>
        <label htmlFor="estilo" style={{ width: '140px', color: '#fff' }}>
          Estilo:
        </label>
        <select
          id="estilo"
          value={estilo}
          onChange={(e) => setEstilo(e.target.value)}
          style={inputStyle}
        >
          <option value="comum">Comum</option>
          <option value="medieval">Medieval</option>
        </select>
      </div>

      <div style={labelStyle}>
        <label htmlFor="genero" style={{ width: '140px', color: '#fff' }}>
          Gênero:
        </label>
        <select
          id="genero"
          value={genero}
          onChange={(e) => setGenero(e.target.value)}
          style={inputStyle}
        >
          <option value="masculino">Masculino</option>
          <option value="feminino">Feminino</option>
          <option value="neutro">Neutro</option>
        </select>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
      <label className='checkboxContainer'>
        <input
          id="sobrenome"
          type="checkbox"
          checked={incluirSobrenome}
          onChange={(e) => setIncluirSobrenome(e.target.checked)}
        />
          <span className='checkmark'></span>
          Gerar sobrenome
        </label>
      </div>

      <div style={{ marginTop: '24px' }}>
        <button
          className="btn-generate"
          onClick={gerarNome}

        >
          GERAR NOME
        </button>
      </div>

      {nomeGerado && (
        <div
          style={{
            marginTop: '24px',
            fontSize: '20px',
            color: '#fff',
            textAlign: 'center',
          }}
        >
          <strong>{nomeGerado}</strong>
        </div>
      )}
    </div>
  );
};

export default TabNomes;
