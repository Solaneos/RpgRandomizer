import React, { useState } from 'react';
import TabMonstros from '../tabs/TabMonstros';
import TabHumanos from '../tabs/TabHumanos';
import TabHumanosIA from '../tabs/TabHumanosIA';
import TabNomes from '../tabs/TabNomes';

const Tabs: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [activeTab, setActiveTab] = useState<'monstros' | 'humanos' | 'ia' | 'nomes'>('monstros');

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

      <div style={{ padding: '12px' }}>
        <input
          type="text"
          placeholder="Cole sua API Key da OpenAI"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '8px',
            fontSize: '16px',
            borderRadius: '8px',
            backgroundColor: '#000',
            color: '#fff',
            border: '1px solid #555',
          }}
        />
      </div>

      {/* Conteúdo das abas - todas montadas */}
      <div style={{ padding: '24px' }}>
        <div style={{ display: activeTab === 'monstros' ? 'block' : 'none' }}>
          <TabMonstros apiKey={apiKey} />
        </div>
        <div style={{ display: activeTab === 'humanos' ? 'block' : 'none' }}>
          <TabHumanos apiKey={apiKey} />
        </div>
        <div style={{ display: activeTab === 'ia' ? 'block' : 'none' }}>
          <TabHumanosIA apiKey={apiKey} />
        </div>
        <div style={{ display: activeTab === 'nomes' ? 'block' : 'none' }}>
          <TabNomes />
        </div>
      </div>
    </div>
  );
};

export default Tabs;
