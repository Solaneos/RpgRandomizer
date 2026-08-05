import { neon } from "@neondatabase/serverless";

const HISTORY_TYPES = [
  "monster",
  "human-group",
  "human-group-ai",
  "city",
  "city-ai",
  "name",
] as const;
const MAX_TITLE_LENGTH = 200;
const MAX_HISTORY_PAYLOAD_LENGTH = 250_000;

type JsonRecord = Record<string, unknown>;
type HistoryType = (typeof HISTORY_TYPES)[number];

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function jsonResponse(body: JsonRecord, status: number): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function isValidVisitorId(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9-]{16,100}$/.test(value);
}

function isValidHistoryType(value: unknown): value is HistoryType {
  return typeof value === "string" && HISTORY_TYPES.includes(value as HistoryType);
}

function getDatabaseUrl(): string | null {
  return process.env.DATABASE_URL?.trim() || null;
}

async function parseBody(request: Request): Promise<JsonRecord | null> {
  try {
    const value: unknown = await request.json();
    return isRecord(value) ? value : null;
  } catch {
    return null;
  }
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (!isSameOriginRequest(request)) {
      return jsonResponse({ error: "Origem não permitida." }, 403);
    }

    const databaseUrl = getDatabaseUrl();
    if (!databaseUrl) {
      console.error("DATABASE_URL não está configurada na Vercel.");
      return jsonResponse({ error: "Histórico não configurado." }, 500);
    }

    const sql = neon(databaseUrl);
    const url = new URL(request.url);

    try {
      if (request.method === "GET") {
        const visitorId = url.searchParams.get("visitorId");
        if (!isValidVisitorId(visitorId)) {
          return jsonResponse({ error: "Identificador do histórico inválido." }, 400);
        }

        const entries = await sql`
          SELECT
            id,
            type,
            title,
            input,
            result,
            created_at AS "createdAt"
          FROM generation_history
          WHERE visitor_id = ${visitorId}
          ORDER BY created_at DESC
          LIMIT 100
        `;

        return jsonResponse({ entries }, 200);
      }

      if (request.method === "POST") {
        const body = await parseBody(request);
        if (!body) return jsonResponse({ error: "Corpo da requisição inválido." }, 400);

        const visitorId = body.visitorId;
        const type = body.type;
        const title = typeof body.title === "string" ? body.title.trim() : "";
        const input = body.input;
        const result = body.result;
        if (
          !isValidVisitorId(visitorId) ||
          !isValidHistoryType(type) ||
          !title ||
          title.length > MAX_TITLE_LENGTH ||
          !isRecord(input) ||
          (!isRecord(result) && !Array.isArray(result))
        ) {
          return jsonResponse({ error: "Dados do histórico inválidos." }, 400);
        }

        const serializedInput = JSON.stringify(input);
        const serializedResult = JSON.stringify(result);
        if (serializedInput.length + serializedResult.length > MAX_HISTORY_PAYLOAD_LENGTH) {
          return jsonResponse({ error: "O registro é grande demais para o histórico." }, 413);
        }

        const [entry] = await sql`
          INSERT INTO generation_history (visitor_id, type, title, input, result)
          VALUES (
            ${visitorId},
            ${type},
            ${title},
            ${serializedInput}::jsonb,
            ${serializedResult}::jsonb
          )
          RETURNING
            id,
            type,
            title,
            input,
            result,
            created_at AS "createdAt"
        `;

        return jsonResponse({ entry }, 201);
      }

      if (request.method === "DELETE") {
        const visitorId = url.searchParams.get("visitorId");
        const id = url.searchParams.get("id");
        if (!isValidVisitorId(visitorId) || !id || !/^[0-9a-f-]{36}$/i.test(id)) {
          return jsonResponse({ error: "Dados para exclusão inválidos." }, 400);
        }

        const deletedEntries = await sql`
          DELETE FROM generation_history
          WHERE id = ${id}::uuid AND visitor_id = ${visitorId}
          RETURNING id
        `;
        if (deletedEntries.length === 0) {
          return jsonResponse({ error: "Registro não encontrado." }, 404);
        }

        return jsonResponse({ deleted: true }, 200);
      }

      return new Response(JSON.stringify({ error: "Método não permitido." }), {
        status: 405,
        headers: {
          "Allow": "GET, POST, DELETE",
          "Cache-Control": "no-store",
          "Content-Type": "application/json",
        },
      });
    } catch (error: unknown) {
      console.error("Erro ao acessar o histórico:", error instanceof Error ? error.message : String(error));
      return jsonResponse({ error: "Não foi possível acessar o histórico." }, 500);
    }
  },
};
