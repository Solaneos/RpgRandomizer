import React, { useState } from 'react';
import TabMonstros from '../tabs/TabMonstros';
import TabHumanos from '../tabs/TabHumanos';
import TabHumanosIA from '../tabs/TabHumanosIA';
import TabNomes from '../tabs/TabNomes';

const Tabs: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [activeTab, setActiveTab] = useState<'monstros' | 'humanos' | 'ia' | 'nomes'>('monstros');
  const [useOpenAI, setUseOpenAI] = useState<boolean>(false);

  const tabStyle = (tab: string) => ({
    padding: '6px 12px',
    marginRight: '6px',
    borderRadius: '6px',
    border: activeTab === tab ? '1px solid white' : 'none',
    fontWeight: activeTab === tab ? 'bold' : 'normal',
    backgroundColor: activeTab === tab ? '#1a1a1a' : 'transparent',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '20px',
    whiteSpace: 'nowrap',
  });

  return (
    <div>
      <div style={{ display: 'flex', padding: '12px', borderBottom: '1px solid white', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        <button style={tabStyle('monstros')} onClick={() => setActiveTab('monstros')}>Monstros</button>
        <button style={tabStyle('humanos')} onClick={() => setActiveTab('humanos')}>Humanos</button>
        <button style={tabStyle('ia')} onClick={() => setActiveTab('ia')}>Humanos IA</button>
        <button style={tabStyle('nomes')} onClick={() => setActiveTab('nomes')}>Nomes</button>
      </div>

      <div style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label
          htmlFor="useOpenAICheckbox"
          style={{
            color: '#fff',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', // Fonte mais moderna
            fontWeight: 'normal',
          }}
        >
          <input
            type="checkbox"
            id="useOpenAICheckbox"
            checked={useOpenAI}
            onChange={(e) => setUseOpenAI(e.target.checked)}
            style={{
              // Estilos para o checkbox customizado (compatibilidade pode variar entre navegadores)
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              width: '24px',
              height: '24px',
              borderRadius: '6px', // Bordas mais arredondadas
              border: '2px solid #555',
              backgroundColor: useOpenAI ? '#4CAF50' : '#222', // Fundo verde quando marcado
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s, border-color 0.2s',
            }}
          />
          Usar OpenAI
        </label>
      </div>

      <div style={{ padding: '0 12px 12px 12px' }}>
        <input
          type="text"
          placeholder="Cole sua API Key da OpenAI"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          disabled={!useOpenAI} // O input é desabilitado se useOpenAI for false
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '8px',
            fontSize: '16px',
            borderRadius: '8px',
            backgroundColor: '#000',
            color: '#fff',
            border: '1px solid #555',
            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', // Fonte mais moderna
            opacity: useOpenAI ? 1 : 0.6, // Diminui a opacidade quando desabilitado
            cursor: useOpenAI ? 'text' : 'not-allowed', // Muda o cursor
            transition: 'opacity 0.3s',
          }}
        />
      </div>

      <div style={{ padding: '24px' }}>
        <div style={{ display: activeTab === 'monstros' ? 'block' : 'none' }}>
          <TabMonstros useOpenAI={useOpenAI} apiKey={apiKey} />
        </div>
        <div style={{ display: activeTab === 'humanos' ? 'block' : 'none' }}>
          <TabHumanos useOpenAI={useOpenAI} apiKey={apiKey} />
        </div>
        <div style={{ display: activeTab === 'ia' ? 'block' : 'none' }}>
          <TabHumanosIA useOpenAI={useOpenAI} apiKey={apiKey} />
        </div>
        <div style={{ display: activeTab === 'nomes' ? 'block' : 'none' }}>
          <TabNomes />
        </div>
      </div>
    </div>
  );
};

export default Tabs;