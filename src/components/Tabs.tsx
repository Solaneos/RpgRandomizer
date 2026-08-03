import React, { useState } from 'react';
import TabMonstros from '../tabs/TabMonstros';
import TabHumanos from '../tabs/TabHumanos';
import TabHumanosIA from '../tabs/TabHumanosIA';
import TabCidades from '../tabs/TabCidades';
import TabCidadesIA from '../tabs/TabCidadesIA';
import TabNomes from '../tabs/TabNomes';

const Tabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monstros' | 'humanos' | 'ia' | 'cidades' | 'cidades-ia' | 'nomes'>('monstros');

  const tabStyle = (tab: string) => ({
    padding: '8px 16px',
    marginRight: '8px',
    borderRadius: '8px',
    border: activeTab === tab ? '1px solid white' : '1px solid transparent',
    fontWeight: 600,
    backgroundColor: activeTab === tab ? '#1a1a1a' : 'transparent',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '18px',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box' as const,
    transition: 'background-color 0.2s, border-color 0.2s',
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
        }}
      >
        <button className="tab-button" type="button" aria-pressed={activeTab === 'monstros'} style={tabStyle('monstros')} onClick={() => setActiveTab('monstros')}>Monstros</button>
        <button className="tab-button" type="button" aria-pressed={activeTab === 'humanos'} style={tabStyle('humanos')} onClick={() => setActiveTab('humanos')}>Humanos</button>
        <button className="tab-button" type="button" aria-pressed={activeTab === 'ia'} style={tabStyle('ia')} onClick={() => setActiveTab('ia')}>Humanos IA</button>
        <button className="tab-button" type="button" aria-pressed={activeTab === 'cidades'} style={tabStyle('cidades')} onClick={() => setActiveTab('cidades')}>Cidades</button>
        <button className="tab-button" type="button" aria-pressed={activeTab === 'cidades-ia'} style={tabStyle('cidades-ia')} onClick={() => setActiveTab('cidades-ia')}>Cidades IA</button>
        <button className="tab-button" type="button" aria-pressed={activeTab === 'nomes'} style={tabStyle('nomes')} onClick={() => setActiveTab('nomes')}>Nomes</button>
      </div>

      <div style={{ padding: '24px' }}>
        {activeTab === 'monstros' && <TabMonstros useOpenAI={false} />}
        {activeTab === 'humanos' && <TabHumanos useOpenAI={false} />}
        {activeTab === 'ia' && <TabHumanosIA />}
        {activeTab === 'cidades' && <TabCidades />}
        {activeTab === 'cidades-ia' && <TabCidadesIA />}
        {activeTab === 'nomes' && <TabNomes />}
      </div>
    </div>
  );
};

export default Tabs;
