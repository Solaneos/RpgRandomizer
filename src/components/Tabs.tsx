import React, { useState } from 'react';
import TabMonstros from '../tabs/TabMonstros';
import TabHumanos from '../tabs/TabHumanos';
import TabHumanosIA from '../tabs/TabHumanosIA';
import TabCidades from '../tabs/TabCidades';
import TabCidadesIA from '../tabs/TabCidadesIA';
import TabNomes from '../tabs/TabNomes';

type TabId = 'monstros' | 'humanos' | 'ia' | 'cidades' | 'cidades-ia' | 'nomes';

const Tabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('monstros');

  const tabStyle = (tab: TabId) => ({
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

  const panelStyle = (tab: TabId): React.CSSProperties => ({
    display: activeTab === tab ? 'block' : 'none',
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
        <div style={panelStyle('monstros')} aria-hidden={activeTab !== 'monstros'}>
          <TabMonstros useOpenAI={false} />
        </div>
        <div style={panelStyle('humanos')} aria-hidden={activeTab !== 'humanos'}>
          <TabHumanos useOpenAI={false} />
        </div>
        <div style={panelStyle('ia')} aria-hidden={activeTab !== 'ia'}>
          <TabHumanosIA />
        </div>
        <div style={panelStyle('cidades')} aria-hidden={activeTab !== 'cidades'}>
          <TabCidades />
        </div>
        <div style={panelStyle('cidades-ia')} aria-hidden={activeTab !== 'cidades-ia'}>
          <TabCidadesIA />
        </div>
        <div style={panelStyle('nomes')} aria-hidden={activeTab !== 'nomes'}>
          <TabNomes />
        </div>
      </div>
    </div>
  );
};

export default Tabs;
