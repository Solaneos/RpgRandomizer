import React, { useState } from 'react';
import {
  nomesMasculinosComuns,
  nomesFemininosComuns,
  nomesNeutrosComuns,
  nomesMasculinosMedievais,
  nomesFemininosMedievais,
  nomesNeutrosMedievais,
  sobrenomesComuns,
  sobrenomesMedievais
} from '../utils/nomeListas';

function gerarNomeAleatorio(estilo: string, genero: string, comSobrenome: boolean): string {
  let listaNomes: string[] = [];
  let listaSobrenomes: string[] = [];

  if (estilo === 'Comum') {
    if (genero === 'Masculino') listaNomes = nomesMasculinosComuns;
    else if (genero === 'Feminino') listaNomes = nomesFemininosComuns;
    else listaNomes = nomesNeutrosComuns;

    listaSobrenomes = sobrenomesComuns;
  } else {
    if (genero === 'Masculino') listaNomes = nomesMasculinosMedievais;
    else if (genero === 'Feminino') listaNomes = nomesFemininosMedievais;
    else listaNomes = nomesNeutrosMedievais;

    listaSobrenomes = sobrenomesMedievais;
  }

  const nome = listaNomes[Math.floor(Math.random() * listaNomes.length)];
  const sobrenome = comSobrenome
    ? listaSobrenomes[Math.floor(Math.random() * listaSobrenomes.length)]
    : '';

  return sobrenome ? `${nome} ${sobrenome}` : nome;
}

const TabNomes: React.FC = () => {
  const [estilo, setEstilo] = useState<'Medieval' | 'Comum'>('Comum');
  const [genero, setGenero] = useState<'Masculino' | 'Feminino' | 'Neutro'>('Masculino');
  const [comSobrenome, setComSobrenome] = useState(true);
  const [nomeGerado, setNomeGerado] = useState('');

  const handleGerar = () => {
    const nome = gerarNomeAleatorio(estilo, genero, comSobrenome);
    setNomeGerado(nome);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Gerador de Nomes</h2>

      <div style={styles.field}>
        <label>Estilo:</label>
        <select value={estilo} onChange={(e) => setEstilo(e.target.value as any)} style={styles.select}>
          <option value="Comum">Comum</option>
          <option value="Medieval">Medieval</option>
        </select>
      </div>

      <div style={styles.field}>
        <label>Gênero:</label>
        <select value={genero} onChange={(e) => setGenero(e.target.value as any)} style={styles.select}>
          <option value="Masculino">Masculino</option>
          <option value="Feminino">Feminino</option>
          <option value="Neutro">Neutro</option>
        </select>
      </div>

      <div style={{ ...styles.field, flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
        <input
          type="checkbox"
          checked={comSobrenome}
          onChange={(e) => setComSobrenome(e.target.checked)}
        />
        <label>Gerar sobrenome</label>
      </div>

      <button onClick={handleGerar} style={styles.button}>GERAR NOME</button>

      {nomeGerado && (
        <div style={styles.resultado}>
          <strong>Nome gerado:</strong> {nomeGerado}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '360px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: 'sans-serif',
    color: '#fff',
  },
  title: {
    fontSize: '20px',
    marginBottom: '16px',
    textAlign: 'center' as const,
  },
  field: {
    marginBottom: '12px',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  select: {
    padding: '6px',
    borderRadius: '6px',
    fontSize: '14px',
    width: '180px',
    backgroundColor: '#111',
    color: '#fff',
    border: '1px solid #555',
    marginTop: '4px',
  },
  button: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    backgroundColor: '#5a00b1',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'Times New Roman, serif',
    marginTop: '16px',
  },
  resultado: {
    marginTop: '24px',
    fontSize: '18px',
    textAlign: 'center' as const,
  }
};

export default TabNomes;
