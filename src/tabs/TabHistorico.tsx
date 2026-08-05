import { useCallback, useEffect, useState } from "react";
import {
  deleteHistoryEntry,
  getHistory,
  HISTORY_UPDATED_EVENT,
  HistoryEntry,
  HistoryType,
} from "../api/history";
import CityResultCard from "../components/CityResultCard";
import { GeneratedHumanEnemyGroup } from "../api/geminiAI";
import { GeneratedCity } from "../utils/cities/generateCity";

interface TabHistoricoProps {
  active: boolean;
}

const typeLabels: Record<HistoryType, string> = {
  monster: "Monstro",
  "human-group": "Grupo de humanos",
  "human-group-ai": "Grupo de humanos IA",
  city: "Cidade",
  "city-ai": "Cidade IA",
  name: "Nome",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function HumanGroupResult({ group }: { group: GeneratedHumanEnemyGroup }) {
  return (
    <section style={{ marginTop: "20px", padding: "20px", borderRadius: "12px", backgroundImage: 'url("/papel-textura.jpg")', backgroundSize: "cover", color: "#2b2b2b", fontFamily: "Morris Roman" }}>
      <h2>{group.nomeDoGrupo}</h2>
      <p>{group.descricao}</p>
      <p><strong>Estratégia:</strong> {group.estrategia}</p>
      {group.inimigos.map((enemy, index) => (
        <article key={`${enemy.nome}-${index}`} style={{ marginTop: "12px", padding: "12px", border: "1px solid rgba(43, 43, 43, 0.4)", borderRadius: "8px" }}>
          <strong>{enemy.nome}</strong> — {enemy.funcao}
          <div>{enemy.aparencia}</div>
          <div>Ataque: {enemy.ataque} | Defesa: {enemy.defesa}</div>
          <div>Armas: {enemy.armas.join(", ")}</div>
          {enemy.magias.length > 0 && <div>Magias: {enemy.magias.join(", ")}</div>}
        </article>
      ))}
    </section>
  );
}

function HistoryResult({ entry }: { entry: HistoryEntry }) {
  if ((entry.type === "city" || entry.type === "city-ai") && isRecord(entry.result) && Array.isArray(entry.result.distritos)) {
    return (
      <CityResultCard
        city={entry.result as unknown as GeneratedCity}
        onGenerateAgain={() => undefined}
        showGenerateAgain={false}
      />
    );
  }

  if (
    entry.type === "human-group-ai" &&
    isRecord(entry.result) &&
    typeof entry.result.nomeDoGrupo === "string" &&
    Array.isArray(entry.result.inimigos)
  ) {
    return <HumanGroupResult group={entry.result as unknown as GeneratedHumanEnemyGroup} />;
  }

  if (entry.type === "human-group" && Array.isArray(entry.result)) {
    return (
      <section style={{ marginTop: "20px", color: "#fff" }}>
        {entry.result.map((value, index) => {
          if (!isRecord(value)) return null;
          const weapons = Array.isArray(value.armas) ? value.armas.join(", ") : "—";
          const spells = Array.isArray(value.magias) ? value.magias.join(", ") : "";
          return (
            <article key={`${String(value.nome)}-${index}`} style={{ marginBottom: "12px", padding: "12px", border: "1px solid #555", borderRadius: "8px" }}>
              <strong>{String(value.nome ?? "Inimigo")}</strong>
              <div>Ataque: {String(value.ataque ?? "—")} | Defesa: {String(value.defesa ?? "—")}</div>
              <div>Armas: {weapons}</div>
              {spells && <div>Magias: {spells}</div>}
            </article>
          );
        })}
      </section>
    );
  }

  if (entry.type === "monster" && isRecord(entry.result)) {
    const monster = isRecord(entry.result.monster) ? entry.result.monster : {};
    return (
      <section style={{ marginTop: "20px", padding: "20px", borderRadius: "12px", backgroundImage: 'url("/papel-textura.jpg")', backgroundSize: "cover", color: "#2b2b2b", fontFamily: "Morris Roman" }}>
        <h2>{String(monster.name ?? entry.title)}</h2>
        <p><strong>Tamanho:</strong> {String(monster.size ?? "—")}</p>
        <p><strong>Tipo:</strong> {String(monster.type ?? "—")}</p>
        <p><strong>Alinhamento:</strong> {String(monster.alignment ?? "—")}</p>
        <p><strong>HP:</strong> {String(monster.hitPoints ?? "—")} | <strong>Desafio:</strong> {String(monster.challengeRating ?? "—")}</p>
        {typeof entry.result.description === "string" && entry.result.description && (
          <div><strong>Descrição IA:</strong><p>{entry.result.description}</p></div>
        )}
      </section>
    );
  }

  if (entry.type === "name" && isRecord(entry.result)) {
    return <div style={{ marginTop: "24px", color: "#fff", textAlign: "center", fontSize: "26px" }}><strong>{String(entry.result.nome ?? entry.title)}</strong></div>;
  }

  return <pre style={{ marginTop: "20px", padding: "12px", overflowX: "auto", color: "#fff", background: "#111", borderRadius: "8px", fontSize: "14px" }}>{JSON.stringify(entry.result, null, 2)}</pre>;
}

function TabHistorico({ active }: TabHistoricoProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setEntries(await getHistory());
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar o histórico.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (active) void loadEntries();
  }, [active, loadEntries]);

  useEffect(() => {
    const handleHistoryUpdate = () => {
      if (active) void loadEntries();
    };
    window.addEventListener(HISTORY_UPDATED_EVENT, handleHistoryUpdate);
    return () => window.removeEventListener(HISTORY_UPDATED_EVENT, handleHistoryUpdate);
  }, [active, loadEntries]);

  const handleDelete = async (entry: HistoryEntry) => {
    if (!window.confirm(`Excluir "${entry.title}" do histórico?`)) return;

    setError("");
    try {
      await deleteHistoryEntry(entry.id);
      setEntries((currentEntries) => currentEntries.filter((item) => item.id !== entry.id));
      if (selectedEntry?.id === entry.id) setSelectedEntry(null);
    } catch (deleteError: unknown) {
      setError(deleteError instanceof Error ? deleteError.message : "Não foi possível excluir o registro.");
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "12px" }}>
      <h2 style={{ fontSize: "22px", marginBottom: "8px", color: "#fff", textAlign: "center" }}>Histórico</h2>
      <p style={{ color: "#bbb", fontSize: "16px", textAlign: "center", margin: "0 0 20px" }}>
        As últimas 100 gerações feitas neste navegador.
      </p>

      <button className="btn-generate" type="button" onClick={() => void loadEntries()} disabled={loading}>
        {loading ? "ATUALIZANDO..." : "ATUALIZAR HISTÓRICO"}
      </button>

      {error && <p role="alert" style={{ color: "#ff6b6b" }}>{error}</p>}
      {!loading && !error && entries.length === 0 && <p style={{ color: "#fff", textAlign: "center" }}>Nenhuma geração salva ainda.</p>}

      <div style={{ marginTop: "20px", display: "grid", gap: "10px" }}>
        {entries.map((entry) => (
          <article key={entry.id} style={{ padding: "14px", border: "1px solid #555", borderRadius: "8px", color: "#fff", background: "#1a1a1a" }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "10px" }}>
              <div>
                <strong>{entry.title}</strong>
                <div style={{ color: "#bbb", fontSize: "14px" }}>
                  {typeLabels[entry.type]} — {new Date(entry.createdAt).toLocaleString("pt-BR")}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button type="button" onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}>
                  {selectedEntry?.id === entry.id ? "FECHAR" : "VER"}
                </button>
                <button type="button" onClick={() => void handleDelete(entry)} style={{ color: "#ff8c8c" }}>EXCLUIR</button>
              </div>
            </div>

            {selectedEntry?.id === entry.id && (
              <div>
                <details style={{ marginTop: "12px" }}>
                  <summary style={{ cursor: "pointer" }}>Opções utilizadas</summary>
                  <pre style={{ padding: "10px", overflowX: "auto", background: "#111", borderRadius: "8px", fontSize: "13px" }}>{JSON.stringify(entry.input, null, 2)}</pre>
                </details>
                <HistoryResult entry={entry} />
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

export default TabHistorico;
