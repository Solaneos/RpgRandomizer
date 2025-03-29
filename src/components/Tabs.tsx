import React, { useState } from 'react';
import TabMonstros from '../tabs/TabMonstros';
import TabHumanos from '../tabs/TabHumanos';
import TabHumanosIA from '../tabs/TabHumanosIA';

const Tabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('monstro');

  const renderTab = () => {
    switch (activeTab) {
      case 'monstros':
        return <TabMonstros />;
      case 'humanos':
        return <TabHumanos />;
      case 'ia':
        return <TabHumanosIA />;
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
    background: activeTab === tab ? '#1a1a1a' : 'transparent',
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

      <div style={{ padding: '24px' }}>
        {renderTab()}
      </div>
    </div>
  );
};

export default Tabs;
