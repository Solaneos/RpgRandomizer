import React, { useState } from 'react';
import TabMonstros from '../tabs/TabMonstros';
import TabHumanos from '../tabs/TabHumanos';
import TabHumanosIA from '../tabs/TabHumanosIA';


const Tabs: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [activeTab, setActiveTab] = useState<'monstros' | 'humanos' | 'ia'>('monstros');

  const renderTab = () => {
    switch (activeTab) {
      case 'monstros':
        return <TabMonstros apiKey={apiKey} />;
      case 'humanos':
        return <TabHumanos apiKey={apiKey} />;
      case 'ia':
        return <TabHumanosIA apiKey={apiKey} />;
      default:
        return null;
    }
  };

  const tabStyle = (tab: string) => ({
    padding: '8px 16px',
    marginRight: '8px',
    borderRadius: '6px',
    border: activeTab === tab ? '1px solid white' : 'none',
    fontWeight: activeTab === tab ? 'bold' : 'normal',
    backgroundColor: activeTab === tab ? '#1a1a1a' : 'transparent',
    color: '#fff',
    cursor: 'pointer'
  });  

  return (
    
    <div>
      <div style={{ display: 'flex', padding: '12px', borderBottom: '1px solid white' }}>
        <button style={tabStyle('monstros')} onClick={() => setActiveTab('monstros')}>
          Monstros
        </button>
        <button style={tabStyle('humanos')} onClick={() => setActiveTab('humanos')}>
          Humanos
        </button>
        <button style={tabStyle('ia')} onClick={() => setActiveTab('ia')}>
          Humanos IA
        </button>
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
      <div style={{ padding: '24px' }}>
        {renderTab()}
      </div>
      
    </div>
  );
};

export default Tabs;
