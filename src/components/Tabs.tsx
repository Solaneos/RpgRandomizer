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
    width: '132px',
    padding: '8px 16px',
    marginRight: '8px',
    borderRadius: '8px',
    border: activeTab === tab ? '1px solid white' : 'none',
    fontWeight: activeTab === tab ? 'bold' : 'normal',
    backgroundColor: activeTab === tab ? '#1a1a1a' : 'transparent',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '18px',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  });

  return (
    <div>
      <div
        style={{
          display: 'flex',
          padding: '12px',
          borderBottom: '1px solid white',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          justifyContent: 'end',
        }}
      >
        <button style={tabStyle('monstros')} onClick={() => setActiveTab('monstros')}>Monstros</button>
        <button style={tabStyle('humanos')} onClick={() => setActiveTab('humanos')}>Humanos</button>
        <button style={tabStyle('ia')} onClick={() => setActiveTab('ia')}>Humanos IA</button>
        <button style={tabStyle('nomes')} onClick={() => setActiveTab('nomes')}>Nomes</button>
      </div>

      <div
        style={{
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexDirection:'column', justifyContent:'start',}}>
          <h2 style = {{
          fontSize: '24px',
          fontFamily: 'fontFamily',
          justifyContent:'start',
          display:'flex',
          fontWeight:'normal',
          }}>
            OpenAI API Key(Opcional)
          </h2>
          <input
            type="text"
            placeholder="Cole sua API Key da OpenAI"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={useOpenAI}
            style={{
              width: '100%',
              maxWidth: '600px',
              padding: '8px',
              fontSize: '16px',
              borderRadius: '8px',
              backgroundColor: '#000',
              color: '#fff',
              border: '1px solid #555',
              transition: 'opacity 0.3s',
            }}
          />
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        {activeTab === 'monstros' && <TabMonstros useOpenAI={useOpenAI} apiKey={apiKey} />}
        {activeTab === 'humanos' && <TabHumanos useOpenAI={useOpenAI} apiKey={apiKey} />}
        {activeTab === 'ia' && <TabHumanosIA useOpenAI={useOpenAI} apiKey={apiKey} />}
        {activeTab === 'nomes' && <TabNomes />}
      </div>
    </div>
  );
};

export default Tabs;
