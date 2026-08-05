export type HistoryType = "monster" | "human-group" | "human-group-ai" | "city" | "city-ai" | "name";

export interface HistoryEntry {
  id: string;
  type: HistoryType;
  title: string;
  input: Record<string, unknown>;
  result: unknown;
  createdAt: string;
}

export interface SaveHistoryRequest {
  type: HistoryType;
  title: string;
  input: Record<string, unknown>;
  result: Record<string, unknown> | unknown[];
}

interface HistoryErrorResponse {
  error?: string;
}

const VISITOR_ID_KEY = "rpg-randomizer-history-id";
export const HISTORY_UPDATED_EVENT = "rpg-history-updated";

function getVisitorId(): string {
  const savedId = localStorage.getItem(VISITOR_ID_KEY);
  if (savedId) return savedId;

  const newId = typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(VISITOR_ID_KEY, newId);
  return newId;
}

async function readResponse<TResponse>(response: Response): Promise<TResponse> {
  const responseText = await response.text();
  let data: (TResponse & HistoryErrorResponse) | null = null;
  if (responseText) {
    try {
      data = JSON.parse(responseText) as TResponse & HistoryErrorResponse;
    } catch {
      throw new Error(`O histórico retornou uma resposta inválida (HTTP ${response.status}).`);
    }
  }

  if (!response.ok) {
    throw new Error(data?.error || `Não foi possível acessar o histórico (HTTP ${response.status}).`);
  }
  if (!data) throw new Error("O histórico retornou uma resposta vazia.");
  return data;
}

export async function saveHistory(request: SaveHistoryRequest): Promise<HistoryEntry> {
  const response = await fetch("/api/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visitorId: getVisitorId(), ...request }),
  });
  const data = await readResponse<{ entry: HistoryEntry }>(response);
  return data.entry;
}

export function saveHistoryInBackground(request: SaveHistoryRequest): void {
  void saveHistory(request)
    .then(() => window.dispatchEvent(new Event(HISTORY_UPDATED_EVENT)))
    .catch((error: unknown) => {
      console.warn("Não foi possível salvar a geração no histórico:", error instanceof Error ? error.message : error);
    });
}

export async function getHistory(): Promise<HistoryEntry[]> {
  const visitorId = encodeURIComponent(getVisitorId());
  const response = await fetch(`/api/history?visitorId=${visitorId}`, { cache: "no-store" });
  const data = await readResponse<{ entries: HistoryEntry[] }>(response);
  return data.entries;
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  const visitorId = encodeURIComponent(getVisitorId());
  const response = await fetch(`/api/history?visitorId=${visitorId}&id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  await readResponse<{ deleted: boolean }>(response);
}
