import React, { useEffect, useState } from "react";
import { MonstersAPI, MonsterBasic, MonsterDetails } from "../api/monstersApi";
import { translations, translate } from "../utils/general/translations";
import { monsterNames } from "../utils/monsters/monsterNames";
import { monsterEnvironments } from "../utils/monsters/monsterEnviroments";
import { environments, Environment, monsterImages, monsterTypes } from "../utils/monsters/list";
import { ApiPost } from "../utils/general/apiPost";

interface TabProps {
  apiKey?: string;
  useOpenAI: boolean;
}

const labelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "12px",
  gap: "12px",
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: "8px",
  borderRadius: "8px",
  fontSize: "16px",
  boxSizing: "border-box",
  backgroundColor: "#111",
  color: "#fff",
  border: "1px solid #555",
};

const TabMonstros: React.FC<TabProps> = ({ useOpenAI, apiKey }) => {
  const [monstersList, setMonstersList] = useState<MonsterBasic[]>([]);
  const [randomMonster, setRandomMonster] = useState<MonsterDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [promptInput, setPromptInput] = useState("");
  const [flavorText, setFlavorText] = useState<string | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment>("todos");

  const [hideHumans, setHideHumans] = useState(false);
  const [hideAnimals, setHideAnimals] = useState(false);
  const [hideDragons, setHideDragons] = useState(false);

  useEffect(() => {
    MonstersAPI.fetchMonsterList().then(setMonstersList);
  }, []);

  const getRandomMonster = async () => {
    if (monstersList.length === 0) return;
    setLoading(true);
    setFlavorText(null);

    const filteredMonsters = monstersList.filter((monster) => {
      const environmentsForMonster = monsterEnvironments[monster.index] || [];
      const monsterType = monsterTypes[monster.index] || 'outro';

      const environmentMatches =
        selectedEnvironment === 'todos' || environmentsForMonster.includes(selectedEnvironment);

      const typeMatches =
        (!hideHumans || monsterType !== 'humano') &&
        (!hideAnimals || monsterType !== 'animal') &&
        (!hideDragons || monsterType !== 'dragao');

      return environmentMatches && typeMatches;
    });

    if (filteredMonsters.length === 0) {
      setFlavorText(`Nenhum monstro encontrado para o ambiente "${selectedEnvironment}" com esses filtros.`);
      setLoading(false);
      return;
    }

    const randomIndex = Math.floor(Math.random() * filteredMonsters.length);
    const monster = filteredMonsters[randomIndex];
    const details = await MonstersAPI.fetchMonsterDetails(monster.index);

    setRandomMonster(details);

    if (promptInput.trim()) {
      const apiPost = new ApiPost(apiKey, useOpenAI);
      const generatedText = await apiPost.generate({
        monsterName: translate(monsterNames, details.name),
        environment: selectedEnvironment,
        prompt: promptInput,
      });

      setFlavorText(generatedText);
    } else {
      setFlavorText(null);
    }

    setLoading(false);
  };

  const hasLocalImage = (index: string) => !monsterImages.includes(index);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '12px' }}>
      <h2
        style={{
          fontSize: "22px",
          marginBottom: "20px",
          color: "#fff",
          textAlign: "center",
        }}
      >
        Encontro Aleatório de Monstro
      </h2>

      <div style={labelStyle}>
        <label htmlFor="ambiente" style={{ width: '140px', color: '#fff' }}>
          Ambiente:
        </label>
        <select
          id="ambiente"
          value={selectedEnvironment}
          onChange={(e) => setSelectedEnvironment(e.target.value as Environment)}
          style={inputStyle}
        >
          {environments.map((env) => (
            <option key={env} value={env}>
              {env.charAt(0).toUpperCase() + env.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "12px" }}>
        <input
          type="text"
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          placeholder="Contexto do encontro para a IA"
          style={{ ...inputStyle, width: '100%' }}
        />
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px', 
        marginBottom: '16px',
        alignItems: 'flex-start'
      }}>
        <label style={{ color: '#fff' }}>
          <input
            type="checkbox"
            checked={hideHumans}
            onChange={(e) => setHideHumans(e.target.checked)}
          />{' '}
          Esconder Humanos
        </label>
        <label style={{ color: '#fff' }}>
          <input
            type="checkbox"
            checked={hideAnimals}
            onChange={(e) => setHideAnimals(e.target.checked)}
          />{' '}
          Esconder Animais
        </label>
        <label style={{ color: '#fff' }}>
          <input
            type="checkbox"
            checked={hideDragons}
            onChange={(e) => setHideDragons(e.target.checked)}
          />{' '}
          Esconder Dragões
        </label>
      </div>

      <div style={{ marginTop: '24px' }}>
        <button
          onClick={getRandomMonster}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            backgroundColor: '#5a00b1',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
          }}
        >
          {loading ? "CARREGANDO..." : "GERAR MONSTRO"}
        </button>
      </div>

      {randomMonster && (
        <div style={styles.monsterCard}>
          <h2>{translate(monsterNames, randomMonster.name)}</h2>
          <p><strong>Tamanho:</strong> {translate(translations.size, randomMonster.size)}</p>
          <p><strong>Tipo:</strong> {translate(translations.type, randomMonster.type)}</p>
          <p><strong>Alinhamento:</strong> {translate(translations.alignment, randomMonster.alignment)}</p>
          <p><strong>CA:</strong> {Array.isArray(randomMonster.armor_class)
              ? randomMonster.armor_class.map((ac) => `${ac.value} (${ac.type})`).join(", ")
              : randomMonster.armor_class}</p>
          <p><strong>HP:</strong> {randomMonster.hit_points} ({randomMonster.hit_dice})</p>
          <p><strong>Desafio:</strong> {randomMonster.challenge_rating}</p>
          <p><strong>Força:</strong> {randomMonster.strength}</p>
          <p><strong>Perícia:</strong> {randomMonster.dexterity * 4}</p>

          <div>
            <strong>Velocidade:</strong>
            {Object.entries(randomMonster.speed).map(([type, value]) => {
              const label = translate(translations.speed, type);
              const numberMatch = typeof value === "string"
                ? value.match(/\d+/)
                : String(value).match(/\d+/);
              const feet = numberMatch ? parseFloat(numberMatch[0]) : null;
              const meters = feet ? (feet * 0.3048).toFixed(1) + "m" : value;
              return (
                <div key={type}>
                  {label}: {meters}
                </div>
              );
            })}
          </div>

          {flavorText && (
            <div style={{ marginTop: '16px' }}>
              <h4>Descrição IA:</h4>
              <p>{flavorText}</p>
            </div>
          )}

          {randomMonster.image || hasLocalImage(randomMonster.index) ? (
            <img
              src={randomMonster.image
                ? `https://www.dnd5eapi.co${randomMonster.image}`
                : `/monsters/${randomMonster.index}.png`}
              alt={randomMonster.name}
              style={{
                maxWidth: '500px',
                maxHeight: '350px',
                width: '100%',
                height: 'auto',
                display: 'block',
                margin: '16px auto 0 auto',
                objectFit: 'contain',
              }}
            />
          ) : null}

          <button
            onClick={getRandomMonster}
            style={{
              marginTop: '5px',
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              backgroundColor: '#5a00b1',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
            }}
          >
            GERAR OUTRO MONSTRO
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  monsterCard: {
    backgroundImage: 'url("/papel-textura.jpg")',
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 0 20px rgba(0,0,0,0.3)",
    maxWidth: "600px",
    margin: "24px auto",
    fontFamily: "Morris Roman",
    color: "#2b2b2b",
    lineHeight: 1.6,
    overflow: "hidden",
  },
};

export default TabMonstros;
