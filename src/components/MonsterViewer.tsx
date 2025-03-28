import React, { useEffect, useState } from "react";
import { MonstersAPI, MonsterBasic, MonsterDetails } from "../api/monstersApi";
import { translations, translate } from "../utils/translations";
import { monsterNames } from "../utils/monsterNames";
import { getMonsterFlavorText } from "../api/openAi";

const MonsterViewer: React.FC = () => {
  const [monstersList, setMonstersList] = useState<MonsterBasic[]>([]);
  const [randomMonster, setRandomMonster] = useState<MonsterDetails | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [promptInput, setPromptInput] = useState("");
  const [flavorText, setFlavorText] = useState<string | null>(null);
  const customPrompt = randomMonster
    ? promptInput ||
      `Me dê uma descrição de um monstro chamado "${randomMonster.name}".`
    : "";

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

  useEffect(() => {
    if (randomMonster?.name) {
      getMonsterFlavorText(customPrompt).then(setFlavorText);
    }
  }, [randomMonster]);

  const hasLocalImage = (index: string) => {
    const withoutImage = [ 'bat', 'cat', 'crab', 'deer', 'dire-wolf', 'draft-horse', 'giant-goat', 'druid', 'eagle', 'elephant', 'elk', 'frog', 'giant-ape', 'giant-badger',
      'giant-bat', 'giant-boar', 'giant-centipede', 'giant-constrictor-snake', 'giant-crab', 'giant-crocodile', 'giant-eagle', 'giant-elk', 'giant-fire-beetle', 'giant-frog',
      'giant-goat', 'giant-hyena', 'giant-lizard', 'giant-octopus', 'giant-owl', 'giant-poisonous-snake', 'giant-rat', 'giant-rat-diseased', 'giant-scorpion', 'giant-sea-horse', 'giant-shark',
      'giant-spider', 'giant-toad', 'giant-vulture', 'giant-wasp', 'giant-weasel', 'giant-wolf-spider', 'goat', 'guard', 'hawk', 'hunter-shark', 'hyena', 'killer-whale', 'jackal', 'knight', 'lemure',
      'lion', 'lizard', 'mage', 'mammoth', 'mule', 'octopus', 'owl', 'panther', 'poisonous-snake', 'polar-bear', 'pony', 'priest', 'quipper', 'rat', 'raven', 'reef-shark', 'rhinoceros',
      'riding-horse', 'scorpion', 'sea-horse', 'spider', 'spy', 'succubus-incubus', 'swarm-of-bats', 'swarm-of-beetles', 'swarm-of-centipedes', 'swarm-of-insects', 'swarm-of-poisonous-snakes',
      'swarm-of-quippers', 'swarm-of-rats', 'swarm-of-ravens', 'swarm-of-spiders', 'swarm-of-wasps', 'tiger', 'vulture', 'werebear-human', 'werebear-hybrid', 'wereboar-human', 'wereboar-hybrid',
      'wererat-human', 'wererat-hybrid', 'weretiger-human', 'weretiger-hybrid', 'werewolf-human', 'werewolf-hybrid'
    ];
    return !withoutImage.includes(index);
  };
  

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>Encontro Aleatório de Monstro</h2>

        <div style={{ marginBottom: "12px" }}>
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Contexto do encontro para a IA"
            style={{
              width: "95%",
              padding: "8px",
              fontSize: "16px",
              borderRadius: "8px",
            }}
          />
        </div>

        <button onClick={getRandomMonster} style={styles.button}>
          {loading ? "Carregando..." : "Gerar Monstro"}
        </button>

        {randomMonster && (
          <div
            style={{
              backgroundImage: 'url("/papel-textura.jpg")',
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 0 20px rgba(0,0,0,0.3)",
              maxWidth: "800px",
              margin: "24px auto",
              fontFamily: "Morris Roman",
              color: "#2b2b2b",
              lineHeight: 1.6,
            }}
          >
            <h2>{translate(monsterNames, randomMonster.name)}</h2>
            <p>
              <strong>Tamanho:</strong>{" "}
              {translate(translations.size, randomMonster.size)}
            </p>
            <p>
              <strong>Tipo:</strong>{" "}
              {translate(translations.type, randomMonster.type)}
            </p>
            <p>
              <strong>Alinhamento:</strong>{" "}
              {translate(translations.alignment, randomMonster.alignment)}
            </p>

            <p>
              <strong>CA:</strong>{" "}
              {Array.isArray(randomMonster.armor_class)
                ? randomMonster.armor_class
                    .map((ac) => `${ac.value} (${ac.type})`)
                    .join(", ")
                : randomMonster.armor_class}
            </p>
            <p>
              <strong>HP:</strong> {randomMonster.hit_points} (
              {randomMonster.hit_dice})
            </p>
            <p>
              <strong>Desafio:</strong> {randomMonster.challenge_rating}
            </p>

            <p>
              <strong>Força:</strong> {randomMonster.strength}
            </p>
            <p>
              <strong>Perícia:</strong> {randomMonster.dexterity * 4}
            </p>

            <p>
              <strong>Velocidade:</strong>
              {Object.entries(randomMonster.speed).map(([type, value]) => {
                const label = translate(translations.speed, type);
                const numberMatch =
                  typeof value === "string"
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
            </p>

            {flavorText && (
              <div style={{ marginTop: "16px" }}>
                <h4>Descrição IA:</h4>
                <p>{flavorText}</p>
              </div>
            )}

            {randomMonster.actions && randomMonster.actions.length > 0 && (
              <div>
                <h4 style={styles.sectionTitle}>Ações</h4>
                {randomMonster.actions.map((action, index) => (
                  <div key={index}>
                    <strong>{action.name}</strong>
                  </div>
                ))}
              </div>
            )}

            {randomMonster.special_abilities &&
              randomMonster.special_abilities.length > 0 && (
                <div>
                  <h4 style={styles.sectionTitle}>Habilidades Especiais</h4>
                  {randomMonster.special_abilities.map((ability, index) => (
                    <div key={index}>
                      <strong>{ability.name}:</strong> {ability.desc}
                    </div>
                  ))}
                </div>
              )}

            {randomMonster.image || hasLocalImage(randomMonster.index) ? (
              <img
                src={
                  randomMonster.image
                    ? `https://www.dnd5eapi.co${randomMonster.image}`
                    : `/monsters/${randomMonster.index}.png`
                }
                alt={randomMonster.name}
                style={{ maxWidth: "100%", height: "auto", marginTop: "16px" }}
              />
            ) : null}

          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    backgroundColor: "#f0f0f0",
    minHeight: "100vh",
    padding: "32px 16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  container: {
    maxWidth: "400px",
    width: "100%",
    fontFamily: "sans-serif",
  },
  title: {
    textAlign: "center" as const,
    fontSize: "22px",
    marginBottom: "16px",
    color: "#111",
  },
  button: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    backgroundColor: "#5a00b1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "16px",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "16px",
    borderRadius: "8px",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
    color: "#333",
  },
  monsterName: {
    fontSize: "18px",
    fontWeight: "bold" as const,
    marginBottom: "10px",
  },
  sectionTitle: {
    marginBottom: "4px",
    marginTop: "30px",
    fontSize: "1.5rem",
    fontWeight: "bold" as const,
    color: "#4b0082",
  },
};

export default MonsterViewer;
