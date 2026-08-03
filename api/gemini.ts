import { GoogleGenAI, Type } from "@google/genai";

const GEMINI_TEXT_MODEL = "gemini-2.5-flash";
const CLOUDFLARE_IMAGE_MODEL = "@cf/black-forest-labs/flux-1-schnell";
const GEMINI_TEXT_MAX_OUTPUT_TOKENS = 768;
const GEMINI_HUMAN_GROUP_MAX_OUTPUT_TOKENS = 2_048;
const GEMINI_CITY_MAX_OUTPUT_TOKENS = 8_192;
const MAX_MONSTER_NAME_LENGTH = 120;
const MAX_PROMPT_LENGTH = 4_000;
const MAX_HUMAN_GROUP_FIELD_LENGTH = 80;
const MAX_HUMAN_GROUP_CONTEXT_LENGTH = 2_000;
const MAX_CITY_DETAILS_LENGTH = 3_000;
const MIN_HUMAN_GROUP_QUANTITY = 1;
const MAX_HUMAN_GROUP_QUANTITY = 12;
const CLOUDFLARE_IMAGE_PROMPT_MAX_LENGTH = 2_048;
const CLOUDFLARE_IMAGE_STEPS = 4;
const HUMAN_SKILL_RANGES = [
  { minimum: 15, maximum: 24 },
  { minimum: 25, maximum: 39 },
  { minimum: 40, maximum: 59 },
  { minimum: 60, maximum: 84 },
  { minimum: 85, maximum: 114 },
  { minimum: 115, maximum: 125 },
] as const;
const CITY_SIZES = ["Aldeia", "Vila", "Cidade pequena", "Cidade grande", "Metrópole"] as const;
const CITY_ENVIRONMENTS = ["Planície", "Floresta", "Costa", "Montanha", "Deserto", "Pântano", "Subterrâneo", "Tundra"] as const;
const CITY_THEMES = ["Fantasia medieval", "Alta fantasia", "Fantasia sombria", "Steampunk", "Espadas e feitiçaria"] as const;

type CitySize = (typeof CITY_SIZES)[number];
type CityEnvironment = (typeof CITY_ENVIRONMENTS)[number];
type CityTheme = (typeof CITY_THEMES)[number];

const CITY_POPULATION_RANGES: Record<CitySize, readonly [number, number]> = {
  Aldeia: [80, 450],
  Vila: [451, 2_500],
  "Cidade pequena": [2_501, 12_000],
  "Cidade grande": [12_001, 60_000],
  Metrópole: [60_001, 250_000],
};

const CITY_CONTENT_QUANTITIES: Record<CitySize, { districts: number; locations: number; factions: number; npcs: number }> = {
  Aldeia: { districts: 2, locations: 3, factions: 2, npcs: 3 },
  Vila: { districts: 3, locations: 4, factions: 2, npcs: 4 },
  "Cidade pequena": { districts: 4, locations: 5, factions: 3, npcs: 4 },
  "Cidade grande": { districts: 5, locations: 6, factions: 4, npcs: 5 },
  Metrópole: { districts: 6, locations: 7, factions: 5, npcs: 6 },
};

type JsonRecord = Record<string, unknown>;

interface GeneratedHumanEnemy {
  nome: string;
  funcao: string;
  aparencia: string;
  armas: string[];
  magias: string[];
  ataque: number;
  defesa: number;
}

interface GeneratedHumanEnemyGroup {
  nomeDoGrupo: string;
  descricao: string;
  estrategia: string;
  inimigos: GeneratedHumanEnemy[];
}

interface GeneratedCity {
  nome: string;
  alcunha: string;
  porte: CitySize;
  ambiente: CityEnvironment;
  estilo: CityTheme;
  populacao: number;
  idade: string;
  governo: string;
  governante: string;
  povo: string;
  riqueza: string;
  atmosfera: string;
  arquitetura: string;
  presencaMagica: string;
  atividadePrincipal: string;
  exportacoes: string[];
  importacoes: string[];
  mercado: string;
  defesa: string;
  guarda: string;
  leiIncomum: string;
  costumeLocal: string;
  distritos: Array<{ nome: string; descricao: string }>;
  pontosDeInteresse: Array<{ nome: string; tipo: string; detalhe: string }>;
  faccoes: Array<{ nome: string; objetivo: string; metodo: string }>;
  npcs: Array<{ nome: string; funcao: string; traco: string; segredo: string }>;
  problemas: string[];
  rumores: string[];
  ganchos: string[];
  eventoProximo: string;
}

class ProviderRequestError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "ProviderRequestError";
    this.statusCode = statusCode;
  }
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readRequiredString(
  body: JsonRecord,
  field: string,
  maxLength: number,
): string | null {
  const value = body[field];
  if (typeof value !== "string") return null;

  const trimmedValue = value.trim();
  if (!trimmedValue || trimmedValue.length > maxLength) return null;

  return trimmedValue;
}

function readOptionalString(
  body: JsonRecord,
  field: string,
  maxLength: number,
): string | null {
  const value = body[field];
  if (value === undefined || value === null || value === "") return "";
  if (typeof value !== "string") return null;

  const trimmedValue = value.trim();
  return trimmedValue.length <= maxLength ? trimmedValue : null;
}

function readInteger(
  body: JsonRecord,
  field: string,
  minimum: number,
  maximum: number,
): number | null {
  const value = body[field];
  return typeof value === "number" && Number.isInteger(value) && value >= minimum && value <= maximum
    ? value
    : null;
}

function readGeneratedString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmedValue = value.trim();
  return trimmedValue || null;
}

function readGeneratedStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;

  const values = value.map(readGeneratedString);
  return values.every((item): item is string => item !== null) ? values : null;
}

function parseGeneratedHumanGroup(
  value: unknown,
  quantity: number,
  minimumSkill: number,
  maximumSkill: number,
): GeneratedHumanEnemyGroup | null {
  if (!isRecord(value) || !Array.isArray(value.inimigos) || value.inimigos.length !== quantity) {
    return null;
  }

  const nomeDoGrupo = readGeneratedString(value.nomeDoGrupo);
  const descricao = readGeneratedString(value.descricao);
  const estrategia = readGeneratedString(value.estrategia);
  if (!nomeDoGrupo || !descricao || !estrategia) return null;

  const inimigos: GeneratedHumanEnemy[] = [];
  for (const enemy of value.inimigos) {
    if (!isRecord(enemy)) return null;

    const nome = readGeneratedString(enemy.nome);
    const funcao = readGeneratedString(enemy.funcao);
    const aparencia = readGeneratedString(enemy.aparencia);
    const armas = readGeneratedStringArray(enemy.armas);
    const magias = readGeneratedStringArray(enemy.magias);
    const ataque = enemy.ataque;
    const defesa = enemy.defesa;

    if (
      !nome ||
      !funcao ||
      !aparencia ||
      !armas ||
      !magias ||
      typeof ataque !== "number" ||
      !Number.isInteger(ataque) ||
      ataque < minimumSkill ||
      ataque > maximumSkill ||
      typeof defesa !== "number" ||
      !Number.isInteger(defesa) ||
      defesa < minimumSkill ||
      defesa > maximumSkill
    ) {
      return null;
    }

    inimigos.push({ nome, funcao, aparencia, armas, magias, ataque, defesa });
  }

  return { nomeDoGrupo, descricao, estrategia, inimigos };
}

function randomValue<T>(values: readonly T[]): T {
  return values[Math.floor(Math.random() * values.length)];
}

function readCityOption<T extends string>(
  body: JsonRecord,
  field: string,
  values: readonly T[],
): T | null {
  const value = readRequiredString(body, field, MAX_HUMAN_GROUP_FIELD_LENGTH);
  if (!value) return null;
  if (value === "Aleatório") return randomValue(values);
  return values.includes(value as T) ? value as T : null;
}

function readGeneratedObjects(
  value: unknown,
  quantity: number,
  fields: readonly string[],
): Array<Record<string, string>> | null {
  if (!Array.isArray(value) || value.length !== quantity) return null;

  const objects: Array<Record<string, string>> = [];
  for (const item of value) {
    if (!isRecord(item)) return null;

    const parsedItem: Record<string, string> = {};
    for (const field of fields) {
      const fieldValue = readGeneratedString(item[field]);
      if (!fieldValue) return null;
      parsedItem[field] = fieldValue;
    }
    objects.push(parsedItem);
  }

  return objects;
}

function parseGeneratedCity(
  value: unknown,
  porte: CitySize,
  ambiente: CityEnvironment,
  estilo: CityTheme,
): GeneratedCity | null {
  if (!isRecord(value) || value.porte !== porte || value.ambiente !== ambiente || value.estilo !== estilo) {
    return null;
  }

  const stringFields = [
    "nome",
    "alcunha",
    "idade",
    "governo",
    "governante",
    "povo",
    "riqueza",
    "atmosfera",
    "arquitetura",
    "presencaMagica",
    "atividadePrincipal",
    "mercado",
    "defesa",
    "guarda",
    "leiIncomum",
    "costumeLocal",
    "eventoProximo",
  ] as const;
  const strings: Record<string, string> = {};
  for (const field of stringFields) {
    const fieldValue = readGeneratedString(value[field]);
    if (!fieldValue) return null;
    strings[field] = fieldValue;
  }

  const populationRange = CITY_POPULATION_RANGES[porte];
  const populacao = value.populacao;
  if (
    typeof populacao !== "number" ||
    !Number.isInteger(populacao) ||
    populacao < populationRange[0] ||
    populacao > populationRange[1]
  ) {
    return null;
  }

  const exportacoes = readGeneratedStringArray(value.exportacoes);
  const importacoes = readGeneratedStringArray(value.importacoes);
  const problemas = readGeneratedStringArray(value.problemas);
  const rumores = readGeneratedStringArray(value.rumores);
  const ganchos = readGeneratedStringArray(value.ganchos);
  if (
    !exportacoes || exportacoes.length !== 2 ||
    !importacoes || importacoes.length !== 3 ||
    !problemas || problemas.length !== 2 ||
    !rumores || rumores.length !== 2 ||
    !ganchos || ganchos.length !== 3
  ) {
    return null;
  }

  const quantities = CITY_CONTENT_QUANTITIES[porte];
  const districts = readGeneratedObjects(value.distritos, quantities.districts, ["nome", "descricao"]);
  const locations = readGeneratedObjects(value.pontosDeInteresse, quantities.locations, ["nome", "tipo", "detalhe"]);
  const factions = readGeneratedObjects(value.faccoes, quantities.factions, ["nome", "objetivo", "metodo"]);
  const npcs = readGeneratedObjects(value.npcs, quantities.npcs, ["nome", "funcao", "traco", "segredo"]);
  if (!districts || !locations || !factions || !npcs) return null;

  return {
    nome: strings.nome,
    alcunha: strings.alcunha,
    porte,
    ambiente,
    estilo,
    populacao,
    idade: strings.idade,
    governo: strings.governo,
    governante: strings.governante,
    povo: strings.povo,
    riqueza: strings.riqueza,
    atmosfera: strings.atmosfera,
    arquitetura: strings.arquitetura,
    presencaMagica: strings.presencaMagica,
    atividadePrincipal: strings.atividadePrincipal,
    exportacoes,
    importacoes,
    mercado: strings.mercado,
    defesa: strings.defesa,
    guarda: strings.guarda,
    leiIncomum: strings.leiIncomum,
    costumeLocal: strings.costumeLocal,
    distritos: districts.map((item) => ({ nome: item.nome, descricao: item.descricao })),
    pontosDeInteresse: locations.map((item) => ({ nome: item.nome, tipo: item.tipo, detalhe: item.detalhe })),
    faccoes: factions.map((item) => ({ nome: item.nome, objetivo: item.objetivo, metodo: item.metodo })),
    npcs: npcs.map((item) => ({ nome: item.nome, funcao: item.funcao, traco: item.traco, segredo: item.segredo })),
    problemas,
    rumores,
    ganchos,
    eventoProximo: strings.eventoProximo,
  };
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

async function parseBody(request: Request): Promise<JsonRecord | null> {
  try {
    const parsedBody: unknown = await request.json();
    return isRecord(parsedBody) ? parsedBody : null;
  } catch {
    return null;
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

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (isRecord(error) && typeof error.message === "string") return error.message;
  return String(error);
}

function getErrorStatus(error: unknown, message: string): number | null {
  if (isRecord(error)) {
    const status = error.statusCode ?? error.status ?? error.code;
    if (typeof status === "number") return status;
    if (typeof status === "string" && /^\d{3}$/.test(status)) return Number(status);
  }

  const statusMatch = message.match(/(?:^|\D)(400|401|403|404|429|500|502|503)(?:\D|$)/);
  return statusMatch ? Number(statusMatch[1]) : null;
}

function getPublicGenerationError(
  error: unknown,
  isImageRequest: boolean,
): { code: string; message: string; status: number } {
  const errorMessage = getErrorMessage(error);
  const normalizedMessage = errorMessage.toUpperCase();
  const providerStatus = getErrorStatus(error, errorMessage);

  if (
    providerStatus === 429 ||
    normalizedMessage.includes("RESOURCE_EXHAUSTED") ||
    normalizedMessage.includes("QUOTA")
  ) {
    return {
      code: isImageRequest ? "CLOUDFLARE_DAILY_LIMIT" : "GEMINI_QUOTA_EXCEEDED",
      message: isImageRequest
        ? "A cota gratuita diária de imagens da Cloudflare foi atingida."
        : "A cota do Gemini foi excedida. Tente novamente mais tarde.",
      status: 429,
    };
  }

  if (
    providerStatus === 401 ||
    providerStatus === 403 ||
    normalizedMessage.includes("PERMISSION_DENIED")
  ) {
    return {
      code: isImageRequest ? "CLOUDFLARE_AUTH_FAILED" : "GEMINI_PERMISSION_DENIED",
      message: isImageRequest
        ? "O token da Cloudflare é inválido ou não tem permissão para Workers AI."
        : "A chave do Gemini não tem permissão para usar este modelo.",
      status: 403,
    };
  }

  if (providerStatus === 404 || normalizedMessage.includes("NOT_FOUND")) {
    return {
      code: isImageRequest ? "CLOUDFLARE_MODEL_NOT_FOUND" : "GEMINI_MODEL_NOT_FOUND",
      message: isImageRequest
        ? "O modelo de imagem da Cloudflare não está disponível."
        : "O modelo solicitado não está disponível para este projeto.",
      status: 502,
    };
  }

  if (providerStatus === 400 || normalizedMessage.includes("INVALID_ARGUMENT")) {
    return {
      code: isImageRequest ? "CLOUDFLARE_INVALID_REQUEST" : "GEMINI_INVALID_REQUEST",
      message: isImageRequest
        ? "A Cloudflare recusou os dados enviados para geração da imagem."
        : "O Gemini recusou os dados enviados para geração.",
      status: 400,
    };
  }

  return {
    code: isImageRequest ? "CLOUDFLARE_GENERATION_FAILED" : "GEMINI_GENERATION_FAILED",
    message: isImageRequest
      ? "Não foi possível gerar a imagem com a Cloudflare."
      : "Não foi possível gerar o conteúdo com o Gemini.",
    status: 502,
  };
}

function getCloudflareErrorMessage(payload: unknown): string | null {
  if (!isRecord(payload) || !Array.isArray(payload.errors)) return null;

  const messages = payload.errors
    .map((error) => isRecord(error) && typeof error.message === "string" ? error.message : null)
    .filter((message): message is string => Boolean(message));

  return messages.length > 0 ? messages.join("; ") : null;
}

async function generateText(ai: GoogleGenAI, body: JsonRecord): Promise<string | null> {
  const monsterName = readRequiredString(body, "monsterName", MAX_MONSTER_NAME_LENGTH);
  const userPrompt = readRequiredString(body, "userPrompt", MAX_PROMPT_LENGTH);
  if (!monsterName || !userPrompt) return null;

  const fullPrompt = `Descreva o monstro "${monsterName}" durante um encontro de RPG de mesa.

Contexto adicional do usuário: ${userPrompt}

Concentre a descrição no próprio monstro: aparência, anatomia, tamanho, pele ou revestimento, olhos, membros, postura, movimentos, sons, cheiro, comportamento e detalhes marcantes. Mostre como ele observa, reage ou ameaça os personagens. Use o ambiente apenas em uma ou duas frases para situar a criatura, sem transformar o cenário no foco principal.

Escreva somente dois parágrafos curtos, entre 120 e 180 palavras no total. Termine o segundo parágrafo com uma frase completa e impactante. Não use títulos, listas, regras de jogo ou estatísticas.`;

  const geminiResponse = await ai.models.generateContent({
    model: GEMINI_TEXT_MODEL,
    contents: fullPrompt,
    config: {
      temperature: 0.9,
      maxOutputTokens: GEMINI_TEXT_MAX_OUTPUT_TOKENS,
      thinkingConfig: {
        thinkingBudget: 0,
      },
    },
  });

  return geminiResponse.text?.trim() || null;
}

async function generateHumanGroup(
  ai: GoogleGenAI,
  body: JsonRecord,
): Promise<GeneratedHumanEnemyGroup | undefined> {
  const groupType = readRequiredString(body, "groupType", MAX_HUMAN_GROUP_FIELD_LENGTH);
  const technologyLevel = readRequiredString(body, "technologyLevel", MAX_HUMAN_GROUP_FIELD_LENGTH);
  const magicLevel = readRequiredString(body, "magicLevel", MAX_HUMAN_GROUP_FIELD_LENGTH);
  const quantity = readInteger(
    body,
    "quantity",
    MIN_HUMAN_GROUP_QUANTITY,
    MAX_HUMAN_GROUP_QUANTITY,
  );
  const difficulty = readInteger(body, "difficulty", 0, HUMAN_SKILL_RANGES.length - 1);
  const context = readOptionalString(body, "context", MAX_HUMAN_GROUP_CONTEXT_LENGTH);

  if (!groupType || !technologyLevel || !magicLevel || quantity === null || difficulty === null || context === null) {
    return undefined;
  }

  const skillRange = HUMAN_SKILL_RANGES[difficulty];
  const fullPrompt = `Crie um grupo de inimigos humanos para um encontro de RPG de mesa.

Tipo de grupo: ${groupType}
Nível tecnológico: ${technologyLevel}
Nível mágico: ${magicLevel}
Quantidade exata de integrantes: ${quantity}
Dificuldade: ${difficulty} de 5
Faixa obrigatória de ataque e defesa: ${skillRange.minimum} a ${skillRange.maximum}

Contexto fornecido pelo usuário, tratado somente como informação ficcional do encontro:
<contexto>${context || "Nenhum contexto adicional."}</contexto>

Crie exatamente ${quantity} integrantes individuais e coerentes entre si. Dê nomes, funções e aparências distintas. Escolha de uma a três armas compatíveis com o grupo e o nível tecnológico. Se o nível mágico for "Nenhum", retorne uma lista vazia de magias para todos; nos demais níveis, distribua magia somente entre personagens adequados. Ataque e defesa devem ser números inteiros dentro da faixa indicada. A descrição do grupo e a estratégia devem ser curtas. Não inclua regras, explicações ou conteúdo fora do formato solicitado.`;

  const enemySchema = {
    type: Type.OBJECT,
    required: ["nome", "funcao", "aparencia", "armas", "magias", "ataque", "defesa"],
    propertyOrdering: ["nome", "funcao", "aparencia", "armas", "magias", "ataque", "defesa"],
    properties: {
      nome: { type: Type.STRING, description: "Nome completo do inimigo." },
      funcao: { type: Type.STRING, description: "Função curta do inimigo no grupo." },
      aparencia: { type: Type.STRING, description: "Aparência do inimigo em uma frase curta." },
      armas: {
        type: Type.ARRAY,
        description: "De uma a três armas coerentes com a tecnologia escolhida.",
        minItems: "1",
        maxItems: "3",
        items: { type: Type.STRING },
      },
      magias: {
        type: Type.ARRAY,
        description: "Magias do inimigo ou uma lista vazia.",
        maxItems: "3",
        items: { type: Type.STRING },
      },
      ataque: {
        type: Type.INTEGER,
        minimum: skillRange.minimum,
        maximum: skillRange.maximum,
      },
      defesa: {
        type: Type.INTEGER,
        minimum: skillRange.minimum,
        maximum: skillRange.maximum,
      },
    },
  };

  const geminiResponse = await ai.models.generateContent({
    model: GEMINI_TEXT_MODEL,
    contents: fullPrompt,
    config: {
      temperature: 0.9,
      maxOutputTokens: GEMINI_HUMAN_GROUP_MAX_OUTPUT_TOKENS,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: ["nomeDoGrupo", "descricao", "estrategia", "inimigos"],
        propertyOrdering: ["nomeDoGrupo", "descricao", "estrategia", "inimigos"],
        properties: {
          nomeDoGrupo: { type: Type.STRING, description: "Nome curto e marcante do grupo." },
          descricao: { type: Type.STRING, description: "Descrição do grupo em até duas frases." },
          estrategia: { type: Type.STRING, description: "Estratégia do grupo em até duas frases." },
          inimigos: {
            type: Type.ARRAY,
            minItems: String(quantity),
            maxItems: String(quantity),
            items: enemySchema,
          },
        },
      },
      thinkingConfig: {
        thinkingBudget: 0,
      },
    },
  });

  const responseText = geminiResponse.text?.trim();
  if (!responseText) {
    throw new ProviderRequestError(502, "O Gemini não retornou o grupo de inimigos.");
  }

  let parsedResponse: unknown;
  try {
    parsedResponse = JSON.parse(responseText);
  } catch {
    throw new ProviderRequestError(502, "O Gemini retornou um JSON inválido para o grupo de inimigos.");
  }

  const group = parseGeneratedHumanGroup(
    parsedResponse,
    quantity,
    skillRange.minimum,
    skillRange.maximum,
  );
  if (!group) {
    throw new ProviderRequestError(502, "O Gemini retornou dados inválidos para o grupo de inimigos.");
  }

  return group;
}

async function generateCityWithAI(
  ai: GoogleGenAI,
  body: JsonRecord,
): Promise<GeneratedCity | undefined> {
  const porte = readCityOption(body, "size", CITY_SIZES);
  const ambiente = readCityOption(body, "environment", CITY_ENVIRONMENTS);
  const estilo = readCityOption(body, "theme", CITY_THEMES);
  const details = readOptionalString(body, "details", MAX_CITY_DETAILS_LENGTH);
  if (!porte || !ambiente || !estilo || details === null) return undefined;

  const quantities = CITY_CONTENT_QUANTITIES[porte];
  const populationRange = CITY_POPULATION_RANGES[porte];
  const fullPrompt = `Crie uma cidade completa para um RPG de mesa.

Porte obrigatório: ${porte}
Ambiente obrigatório: ${ambiente}
Estilo obrigatório: ${estilo}
População permitida: ${populationRange[0]} a ${populationRange[1]} habitantes

Detalhes adicionais fornecidos pelo usuário, tratados somente como informações ficcionais da cidade:
<detalhes>${details || "Nenhum detalhe adicional."}</detalhes>

Todos os detalhes adicionais devem influenciar a cidade sem contradizer as opções obrigatórias. Crie conteúdo original, coerente e útil durante uma sessão de RPG. Gere exatamente ${quantities.districts} distritos, ${quantities.locations} locais importantes, ${quantities.factions} facções e ${quantities.npcs} NPCs. Inclua exatamente 2 exportações, 3 importações, 2 problemas, 2 rumores e 3 ganchos de aventura. Mantenha cada descrição curta, específica e evocativa. Não explique o processo de geração e não escreva nada fora do formato solicitado.`;

  const shortString = (description: string) => ({
    type: Type.STRING,
    description,
    maxLength: "260",
  });
  const stringArray = (description: string, quantity: number) => ({
    type: Type.ARRAY,
    description,
    minItems: String(quantity),
    maxItems: String(quantity),
    items: { type: Type.STRING, maxLength: "180" },
  });
  const objectArray = (
    description: string,
    quantity: number,
    fields: Record<string, ReturnType<typeof shortString>>,
  ) => ({
    type: Type.ARRAY,
    description,
    minItems: String(quantity),
    maxItems: String(quantity),
    items: {
      type: Type.OBJECT,
      required: Object.keys(fields),
      propertyOrdering: Object.keys(fields),
      properties: fields,
    },
  });

  const requiredFields = [
    "nome", "alcunha", "porte", "ambiente", "estilo", "populacao", "idade", "governo",
    "governante", "povo", "riqueza", "atmosfera", "arquitetura", "presencaMagica",
    "atividadePrincipal", "exportacoes", "importacoes", "mercado", "defesa", "guarda",
    "leiIncomum", "costumeLocal", "distritos", "pontosDeInteresse", "faccoes", "npcs",
    "problemas", "rumores", "ganchos", "eventoProximo",
  ];

  const geminiResponse = await ai.models.generateContent({
    model: GEMINI_TEXT_MODEL,
    contents: fullPrompt,
    config: {
      temperature: 0.9,
      maxOutputTokens: GEMINI_CITY_MAX_OUTPUT_TOKENS,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: requiredFields,
        propertyOrdering: requiredFields,
        properties: {
          nome: shortString("Nome original da cidade."),
          alcunha: shortString("Alcunha iniciada por um artigo, como 'a Cidade das Brumas'."),
          porte: { type: Type.STRING, enum: [porte] },
          ambiente: { type: Type.STRING, enum: [ambiente] },
          estilo: { type: Type.STRING, enum: [estilo] },
          populacao: {
            type: Type.INTEGER,
            minimum: populationRange[0],
            maximum: populationRange[1],
          },
          idade: shortString("Idade da cidade e uma referência curta à fundação."),
          governo: shortString("Forma de governo."),
          governante: shortString("Título e nome do governante atual."),
          povo: shortString("Composição dos habitantes e cultura predominante."),
          riqueza: shortString("Nível de riqueza e desigualdade."),
          atmosfera: shortString("Sensação que a cidade causa nos visitantes."),
          arquitetura: shortString("Arquitetura coerente com ambiente e estilo."),
          presencaMagica: shortString("Presença e tratamento da magia na cidade."),
          atividadePrincipal: shortString("Principal atividade econômica."),
          exportacoes: stringArray("Principais exportações.", 2),
          importacoes: stringArray("Principais importações.", 3),
          mercado: shortString("Uma característica marcante do mercado local."),
          defesa: shortString("Defesas físicas ou mágicas da cidade."),
          guarda: shortString("Qualidade, reputação e comportamento da guarda."),
          leiIncomum: shortString("Uma lei incomum que pode afetar os personagens."),
          costumeLocal: shortString("Um costume local memorável."),
          distritos: objectArray("Distritos distintos da cidade.", quantities.districts, {
            nome: shortString("Nome do distrito."),
            descricao: shortString("Função, aparência ou conflito do distrito."),
          }),
          pontosDeInteresse: objectArray("Locais que os personagens podem visitar.", quantities.locations, {
            nome: shortString("Nome do local."),
            tipo: shortString("Tipo do local, como taverna, templo ou fortaleza."),
            detalhe: shortString("Utilidade, característica ou segredo do local."),
          }),
          faccoes: objectArray("Facções atuantes na cidade.", quantities.factions, {
            nome: shortString("Nome da facção."),
            objetivo: shortString("Objetivo atual da facção."),
            metodo: shortString("Método usado pela facção."),
          }),
          npcs: objectArray("NPCs importantes da cidade.", quantities.npcs, {
            nome: shortString("Nome do NPC."),
            funcao: shortString("Função do NPC na cidade."),
            traco: shortString("Traço de personalidade ou comportamento."),
            segredo: shortString("Segredo útil para uma aventura."),
          }),
          problemas: stringArray("Problemas atuais e acionáveis da cidade.", 2),
          rumores: stringArray("Rumores que podem ser verdadeiros ou falsos.", 2),
          ganchos: stringArray("Ganchos de aventura envolvendo personagens e locais da cidade.", 3),
          eventoProximo: shortString("Evento que ocorrerá em breve e pode movimentar a cidade."),
        },
      },
      thinkingConfig: {
        thinkingBudget: 0,
      },
    },
  });

  const responseText = geminiResponse.text?.trim();
  if (!responseText) {
    throw new ProviderRequestError(502, "O Gemini não retornou a cidade.");
  }

  let parsedResponse: unknown;
  try {
    parsedResponse = JSON.parse(responseText);
  } catch {
    throw new ProviderRequestError(502, "O Gemini retornou um JSON inválido para a cidade.");
  }

  const city = parseGeneratedCity(parsedResponse, porte, ambiente, estilo);
  if (!city) {
    throw new ProviderRequestError(502, "O Gemini retornou dados inválidos para a cidade.");
  }

  return city;
}

async function generateImage(
  body: JsonRecord,
  accountId: string,
  apiToken: string,
): Promise<{ base64: string; mimeType: string } | null | undefined> {
  const monsterName = readRequiredString(body, "monsterName", MAX_MONSTER_NAME_LENGTH);
  const scenario = readRequiredString(body, "scenario", MAX_PROMPT_LENGTH);
  if (!monsterName || !scenario) return undefined;

  const prompt = `Ilustração de um encontro para RPG de mesa, ambientada em um mundo de fantasia medieval, sem elementos modernos e sem texto na imagem. Monstro: ${monsterName}. Descrição da cena: ${scenario}`
    .slice(0, CLOUDFLARE_IMAGE_PROMPT_MAX_LENGTH);

  const cloudflareResponse = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/run/${CLOUDFLARE_IMAGE_MODEL}`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        steps: CLOUDFLARE_IMAGE_STEPS,
      }),
    },
  );

  const payload: unknown = await cloudflareResponse.json().catch(() => null);
  if (!cloudflareResponse.ok) {
    throw new ProviderRequestError(
      cloudflareResponse.status,
      getCloudflareErrorMessage(payload) ?? `Cloudflare Workers AI HTTP ${cloudflareResponse.status}`,
    );
  }

  if (!isRecord(payload) || payload.success !== true || !isRecord(payload.result)) {
    throw new ProviderRequestError(
      502,
      getCloudflareErrorMessage(payload) ?? "Resposta inválida da Cloudflare Workers AI.",
    );
  }

  const base64 = payload.result.image;
  if (typeof base64 !== "string" || !base64) {
    return null;
  }

  return {
    base64,
    mimeType: "image/jpeg",
  };
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Método não permitido." }), {
        status: 405,
        headers: {
          "Allow": "POST",
          "Cache-Control": "no-store",
          "Content-Type": "application/json",
        },
      });
    }

    if (!isSameOriginRequest(request)) {
      return jsonResponse({ error: "Origem não permitida." }, 403);
    }

    const body = await parseBody(request);
    if (!body) {
      return jsonResponse({ error: "Corpo da requisição inválido." }, 400);
    }

    try {
      if (body.action === "text") {
        const apiKey = process.env.GEMINI_API_KEY?.trim();
        if (!apiKey) {
          console.error("GEMINI_API_KEY não está configurada na Vercel.");
          return jsonResponse({ error: "Geração de texto não configurada." }, 500);
        }

        const ai = new GoogleGenAI({ apiKey });
        const text = await generateText(ai, body);
        if (!text) {
          return jsonResponse({ error: "Dados para geração de texto inválidos." }, 400);
        }

        return jsonResponse({ text }, 200);
      }

      if (body.action === "human-group") {
        const apiKey = process.env.GEMINI_API_KEY?.trim();
        if (!apiKey) {
          console.error("GEMINI_API_KEY não está configurada na Vercel.");
          return jsonResponse({ error: "Geração de grupo com IA não configurada." }, 500);
        }

        const ai = new GoogleGenAI({ apiKey });
        const group = await generateHumanGroup(ai, body);
        if (!group) {
          return jsonResponse({ error: "Dados para geração do grupo inválidos." }, 400);
        }

        return jsonResponse({ group }, 200);
      }

      if (body.action === "city") {
        const apiKey = process.env.GEMINI_API_KEY?.trim();
        if (!apiKey) {
          console.error("GEMINI_API_KEY não está configurada na Vercel.");
          return jsonResponse({ error: "Geração de cidade com IA não configurada." }, 500);
        }

        const ai = new GoogleGenAI({ apiKey });
        const city = await generateCityWithAI(ai, body);
        if (!city) {
          return jsonResponse({ error: "Dados para geração da cidade inválidos." }, 400);
        }

        return jsonResponse({ city }, 200);
      }

      if (body.action === "image") {
        const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
        const apiToken = process.env.CLOUDFLARE_API_TOKEN?.trim();
        if (!accountId || !apiToken) {
          console.error("Credenciais da Cloudflare não estão configuradas na Vercel.");
          return jsonResponse({ error: "Geração de imagem não configurada." }, 500);
        }

        const image = await generateImage(body, accountId, apiToken);
        if (image === undefined) {
          return jsonResponse({ error: "Dados para geração de imagem inválidos." }, 400);
        }
        if (!image) {
          return jsonResponse({ error: "A Cloudflare não retornou uma imagem." }, 502);
        }

        return jsonResponse({
          imageBase64: image.base64,
          mimeType: image.mimeType,
        }, 200);
      }

      return jsonResponse({ error: "Ação inválida." }, 400);
    } catch (error: unknown) {
      const isImageRequest = body.action === "image";
      const secrets = [
        process.env.GEMINI_API_KEY?.trim(),
        process.env.CLOUDFLARE_API_TOKEN?.trim(),
      ].filter((secret): secret is string => Boolean(secret));
      const errorMessage = secrets.reduce(
        (message, secret) => message.replaceAll(secret, "[REDACTED]"),
        getErrorMessage(error),
      );
      const publicError = getPublicGenerationError(error, isImageRequest);
      console.error(`Erro ao chamar ${isImageRequest ? "Cloudflare" : "Gemini"}:`, errorMessage);
      return jsonResponse({
        error: publicError.message,
        code: publicError.code,
      }, publicError.status);
    }
  },
};
