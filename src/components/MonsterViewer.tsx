import React, { useEffect, useState } from 'react';
import { MonstersAPI, MonsterBasic, MonsterDetails } from '../api/monstersApi';
import { translations, translate } from '../utils/translations';
import { monsterNames } from '../utils/monsterNames';

const MonsterViewer: React.FC = () => {
  const [monstersList, setMonstersList] = useState<MonsterBasic[]>([]);
  const [randomMonster, setRandomMonster] = useState<MonsterDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    MonstersAPI.fetchMonsterList().then(setMonstersList);
  }, []);

  const getRandomMonster = async () => {
    if (monstersList.length === 0) return;
    setLoading(true);

    const randomIndex = Math.floor(Math.random() * monstersList.length);
    const monster = monstersList[randomIndex];
    const details = await MonstersAPI.fetchMonsterDetails(monster.index);

    setRandomMonster(details);
    setLoading(false);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>Encontro Aleatório de Monstro</h2>

        <button onClick={getRandomMonster} style={styles.button}>
          {loading ? 'Carregando...' : 'Gerar Monstro'}
        </button>

        {randomMonster && (
          <div style={styles.card}>
            <h3>{translate(monsterNames, randomMonster.name)}</h3>
            <p><strong>Tamanho:</strong> {translate(translations.size, randomMonster.size)}</p>
            <p><strong>Tipo:</strong> {translate(translations.type, randomMonster.type)}</p>
            <p><strong>Alinhamento:</strong> {translate(translations.alignment, randomMonster.alignment)}</p>

            <p>
              <strong>CA:</strong>{' '}
              {Array.isArray(randomMonster.armor_class)
                ? randomMonster.armor_class.map((ac) => `${ac.value} (${ac.type})`).join(', ')
                : randomMonster.armor_class}
            </p>
            <p><strong>HP:</strong> {randomMonster.hit_points} ({randomMonster.hit_dice})</p>
            <p><strong>Desafio:</strong> {randomMonster.challenge_rating}</p>

            <p><strong>Força:</strong> {randomMonster.strength}</p>
            <p><strong>Skill:</strong> {randomMonster.dexterity * 4}</p>

            <p>
              <strong>Velocidade:</strong>{' '}
              {Object.entries(randomMonster.speed).map(([type, value]) => {
                const label = translate(translations.speed, type);
                const numberMatch = value.match(/\d+/);
                const feet = numberMatch ? parseFloat(numberMatch[0]) : null;
                const meters = feet ? (feet * 0.3048).toFixed(1) + ' m' : value;
                return (
                  <span key={type}>
                    {label}: {meters}{' '}
                  </span>
                );
              })}
            </p>

            {randomMonster.actions && randomMonster.actions.length > 0 && (
              <div>
                <h4 style={styles.sectionTitle}>Ações</h4>
                {randomMonster.actions.map((action, index) => (
                  <div key={index}>
                    <strong>{action.name}:</strong> {action.desc}
                  </div>
                ))}
              </div>
            )}

            {randomMonster.special_abilities && randomMonster.special_abilities.length > 0 && (
              <div>
                <h4 style={styles.sectionTitle}>Habilidades Especiais</h4>
                {randomMonster.special_abilities.map((ability, index) => (
                  <div key={index}>
                    <strong>{ability.name}:</strong> {ability.desc}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    backgroundColor: '#f0f0f0',
    minHeight: '100vh',
    padding: '32px 16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  container: {
    maxWidth: '400px',
    width: '100%',
    fontFamily: 'sans-serif',
  },
  title: {
    textAlign: 'center' as const,
    fontSize: '22px',
    marginBottom: '16px',
    color: '#111',
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
    marginBottom: '16px',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    color: '#333',
  },
  monsterName: {
    fontSize: '18px',
    fontWeight: 'bold' as const,
    marginBottom: '10px',
  },
  sectionTitle: {
    marginTop: '12px',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    color: '#4b0082',
  },
};

export default MonsterViewer;
