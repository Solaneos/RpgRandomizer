import React, { useState } from 'react';
import { gerarNomeAleatorio } from '../utils/nomeGenerator.ts';

const TabNomes: React.FC = () => {
  const [estilo, setEstilo] = useState('comum');
  const [genero, setGenero] = useState('masculino');
  const [incluirSobrenome, setIncluirSobrenome] = useState(true);
  const [nomeGerado, setNomeGerado] = useState('');

  const gerarNome = () => {
    const nome = gerarNomeAleatorio(estilo, genero, incluirSobrenome);
    setNomeGerado(nome);
  };

  const labelStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    marginBottom: '16px',
    fontSize: '16px',
    color: 'white',
  };

  const inputStyle = {
    marginTop: '4px',
    padding: '10px',
    fontSize: '15px',
    borderRadius: '8px',
    border: '1px solid #555',
    backgroundColor: '#000',
    color: '#fff',
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '24px' }}>
      <h2 style={{ color: '#fff', textAlign: 'center' }}>Gerador de Nomes</h2>

      <div style={labelStyle}>
        <label>Estilo:</label>
        <select value={estilo} onChange={(e) => setEstilo(e.target.value)} style={inputStyle}>
          <option value="comum">Comum</option>
          <option value="medieval">Medieval</option>
        </select>
      </div>

      <div style={labelStyle}>
        <label>Gênero:</label>
        <select value={genero} onChange={(e) => setGenero(e.target.value)} style={inputStyle}>
          <option value="masculino">Masculino</option>
          <option value="feminino">Feminino</option>
          <option value="neutro">Neutro</option>
        </select>
      </div>

      <div
        style={{
          ...labelStyle,
          flexDirection: 'row',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <input
          type="checkbox"
          checked={incluirSobrenome}
          onChange={(e) => setIncluirSobrenome(e.target.checked)}
        />
        <label style={{ margin: 0 }}>Gerar sobrenome</label>
      </div>

      <button style={styles.botao} onClick={gerarNome}>
        GERAR NOME
      </button>

      {nomeGerado && (
        <div style={{ marginTop: '24px', fontSize: '20px', color: 'white', textAlign: 'center' }}>
          <strong>{nomeGerado}</strong>
        </div>
      )}
    </div>
  );
};

const styles = {
  botao: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    backgroundColor: '#5a00b1',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'Times New Roman, serif',
  },
};

export default TabNomes;