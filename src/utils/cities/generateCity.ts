const CITY_SIZES = ["Aldeia", "Vila", "Cidade pequena", "Cidade grande", "Metrópole"] as const;
const CITY_ENVIRONMENTS = ["Planície", "Floresta", "Costa", "Montanha", "Deserto", "Pântano", "Subterrâneo", "Tundra"] as const;
const CITY_THEMES = ["Fantasia medieval", "Alta fantasia", "Fantasia sombria", "Steampunk", "Espadas e feitiçaria"] as const;

export type CitySize = (typeof CITY_SIZES)[number];
export type CityEnvironment = (typeof CITY_ENVIRONMENTS)[number];
export type CityTheme = (typeof CITY_THEMES)[number];
export type CitySizeOption = CitySize | "Aleatório";
export type CityEnvironmentOption = CityEnvironment | "Aleatório";
export type CityThemeOption = CityTheme | "Aleatório";

export const citySizeOptions: readonly CitySizeOption[] = ["Aleatório", ...CITY_SIZES];
export const cityEnvironmentOptions: readonly CityEnvironmentOption[] = ["Aleatório", ...CITY_ENVIRONMENTS];
export const cityThemeOptions: readonly CityThemeOption[] = ["Aleatório", ...CITY_THEMES];

export interface CityGenerationOptions {
  size: CitySizeOption;
  environment: CityEnvironmentOption;
  theme: CityThemeOption;
}

export interface CityDistrict {
  nome: string;
  descricao: string;
}

export interface CityPointOfInterest {
  nome: string;
  tipo: string;
  detalhe: string;
}

export interface CityFaction {
  nome: string;
  objetivo: string;
  metodo: string;
}

export interface CityNpc {
  nome: string;
  funcao: string;
  traco: string;
  segredo: string;
}

export interface GeneratedCity {
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
  distritos: CityDistrict[];
  pontosDeInteresse: CityPointOfInterest[];
  faccoes: CityFaction[];
  npcs: CityNpc[];
  problemas: string[];
  rumores: string[];
  ganchos: string[];
  eventoProximo: string;
}

function randomItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomInt(minimum: number, maximum: number): number {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

function randomItems<T>(items: readonly T[], quantity: number): T[] {
  return [...items]
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(quantity, items.length));
}

function resolveOption<T extends string>(option: T | "Aleatório", values: readonly T[]): T {
  return option === "Aleatório" ? randomItem(values) : option;
}

const populationRanges: Record<CitySize, readonly [number, number]> = {
  Aldeia: [80, 450],
  Vila: [451, 2_500],
  "Cidade pequena": [2_501, 12_000],
  "Cidade grande": [12_001, 60_000],
  Metrópole: [60_001, 250_000],
};

const contentQuantity: Record<CitySize, { districts: number; locations: number; factions: number; npcs: number }> = {
  Aldeia: { districts: 2, locations: 3, factions: 2, npcs: 3 },
  Vila: { districts: 3, locations: 4, factions: 2, npcs: 4 },
  "Cidade pequena": { districts: 4, locations: 5, factions: 3, npcs: 4 },
  "Cidade grande": { districts: 5, locations: 6, factions: 4, npcs: 5 },
  Metrópole: { districts: 6, locations: 7, factions: 5, npcs: 6 },
};

const nameStarts = [
  "Al", "Ar", "Bel", "Bran", "Cal", "Cor", "Dor", "Eld", "Fal", "Gal", "Grim", "Hal", "Kar", "Lor", "Mar", "Nor", "Raven", "Sol", "Tor", "Val",
];
const nameEnds = [
  "amar", "burgo", "dora", "fal", "gard", "heim", "lume", "mar", "mont", "muralha", "porto", "ria", "tor", "vale", "véria", "wick",
];
const cityNicknames = [
  "a Cidade das Mil Lanternas", "a Sentinela do Norte", "a Joia Cinzenta", "o Último Refúgio", "a Coroa do Vale", "a Cidade sem Sono", "o Porto dos Sussurros", "a Fortaleza Dourada", "a Encruzilhada dos Reinos", "a Cidade das Sete Torres",
];

const governments = [
  { nome: "Monarquia hereditária", titles: ["Rainha", "Rei", "Princesa-regente", "Príncipe-regente"] },
  { nome: "Conselho de guildas", titles: ["Mestre das Guildas", "Primeira Conselheira", "Chanceler"] },
  { nome: "República mercantil", titles: ["Doge", "Cônsul", "Primeira Mercadora"] },
  { nome: "Teocracia", titles: ["Sumo Sacerdote", "Oráculo-Regente", "Matriarca do Templo"] },
  { nome: "Junta militar", titles: ["Marechal", "General-Governador", "Comandante"] },
  { nome: "Magocracia", titles: ["Arquimaga", "Arquimago", "Chanceler Arcano"] },
  { nome: "Senhorio feudal", titles: ["Baronesa", "Barão", "Duquesa", "Duque"] },
  { nome: "Conselho eleito", titles: ["Prefeita", "Prefeito", "Voz do Conselho"] },
];

const firstNames = [
  "Adara", "Aldren", "Brenna", "Cedric", "Dália", "Dorian", "Elara", "Eamon", "Freya", "Garrick", "Helena", "Ivar", "Kael", "Liora", "Mara", "Nolan", "Orin", "Petra", "Rowan", "Selene", "Tobias", "Vera",
];
const lastNames = [
  "Alvacor", "Brandefogo", "Corvo", "da Ponte", "do Vale", "Ferromão", "Folhapálida", "Martelo", "Montenegro", "Pedralva", "Rios", "Seteventos", "Torrelume", "Vulpino",
];

const peoples = [
  "Humanos predominantes, com pequenas comunidades élficas e anãs",
  "Uma mistura cosmopolita de povos de muitas regiões",
  "Anões e humanos ligados por antigas famílias de artesãos",
  "Elfos, meio-elfos e humanos unidos por tradições arcanas",
  "Povos viajantes que se fixaram ao redor de uma antiga fortaleza",
  "Uma população desconfiada de estrangeiros e orgulhosa de seus ancestrais",
  "Refugiados e aventureiros vindos de reinos distantes",
];
const wealthLevels = ["Empobrecida", "Modesta", "Estável", "Próspera", "Muito rica, mas profundamente desigual"];
const atmospheres = [
  "Acolhedora durante o dia e inquietante após o pôr do sol",
  "Barulhenta, congestionada e cheia de oportunidades",
  "Solenemente religiosa, com sinos marcando todas as horas",
  "Desconfiada; guardas observam cada recém-chegado",
  "Festiva, colorida e famosa por seus artistas de rua",
  "Tensa, como se todos aguardassem uma guerra inevitável",
  "Coberta por névoa e repleta de histórias que ninguém confirma",
];

const architectureByTheme: Record<CityTheme, readonly string[]> = {
  "Fantasia medieval": ["Casas de madeira e pedra cercam uma fortaleza de muralhas antigas", "Telhados íngremes, vielas estreitas e grandes salões de guilda dominam a paisagem"],
  "Alta fantasia": ["Torres esguias, pontes suspensas e cristais luminosos formam o horizonte", "Jardins encantados dividem espaço com palácios de mármore impossível"],
  "Fantasia sombria": ["Edifícios escurecidos pela fuligem se apertam sob torres ameaçadoras", "Gárgulas, vitrais rachados e fortalezas austeras dominam as ruas"],
  Steampunk: ["Chaminés de cobre, passarelas metálicas e tubulações cruzam os prédios", "Torres de relógio e oficinas movidas a vapor encobrem o céu com fumaça"],
  "Espadas e feitiçaria": ["Palácios decadentes e bazares labirínticos se erguem sobre ruínas antigas", "Muralhas ciclópicas cercam casas coloridas e templos cobertos de ouro"],
};

const magicByTheme: Record<CityTheme, readonly string[]> = {
  "Fantasia medieval": ["Rara e recebida com cautela", "Controlada por uma pequena ordem licenciada", "Aceita apenas quando ligada aos templos"],
  "Alta fantasia": ["Comum e integrada aos serviços da cidade", "Abundante, embora rigidamente regulamentada", "Tão presente que pequenos encantamentos fazem parte da vida cotidiana"],
  "Fantasia sombria": ["Proibida em público e praticada secretamente", "Temida após uma antiga catástrofe arcana", "Tolerada apenas por inquisidores e nobres"],
  Steampunk: ["Disputada por engenheiros arcanos e industriais", "Usada como combustível para máquinas experimentais", "Substituída em grande parte por engenhos a vapor"],
  "Espadas e feitiçaria": ["Antiga, perigosa e associada a cultos esquecidos", "Dominada por poucos feiticeiros de grande poder", "Encontrada principalmente em relíquias e ruínas"],
};

const environmentEconomy: Record<CityEnvironment, readonly string[]> = {
  Planície: ["grãos", "cavalos", "linho", "cerâmica"],
  Floresta: ["madeira rara", "ervas medicinais", "mel", "peles"],
  Costa: ["peixe salgado", "pérolas", "sal", "navios"],
  Montanha: ["ferro", "prata", "pedra trabalhada", "armas"],
  Deserto: ["especiarias", "vidro", "tâmaras", "corantes"],
  Pântano: ["ervas alquímicas", "turfa", "venenos", "madeira negra"],
  Subterrâneo: ["cristais", "cogumelos", "gemas", "metais profundos"],
  Tundra: ["peles", "óleo", "marfim", "peixe defumado"],
};

const mainActivities = [
  "Comércio regional", "Mineração e metalurgia", "Pesca e construção naval", "Agricultura e criação de animais", "Produção de armas", "Peregrinação religiosa", "Pesquisa arcana", "Artesanato de luxo", "Contratação de mercenários", "Contrabando",
];
const imports = [
  "vinho", "grãos", "madeira", "ferro", "tecidos finos", "ervas medicinais", "livros", "animais de carga", "sal", "componentes mágicos", "carvão", "armas",
];
const markets = [
  "O mercado funciona todos os dias, mas os melhores negócios acontecem ao amanhecer",
  "Toda venda legal recebe o selo de uma guilda",
  "Moedas estrangeiras são pesadas e cortadas antes de serem aceitas",
  "Um mercado noturno oferece mercadorias que não aparecem durante o dia",
  "Escambo ainda é comum, especialmente entre moradores antigos",
  "Leilões públicos atraem nobres, aventureiros e ladrões",
];

const defensesBySize: Record<CitySize, readonly string[]> = {
  Aldeia: ["Uma paliçada simples e uma torre de vigia", "Valas rasas, sinos de alarme e moradores armados"],
  Vila: ["Paliçada reforçada, dois portões e torres de madeira", "Uma muralha baixa de pedra e patrulhas montadas"],
  "Cidade pequena": ["Muralhas de pedra, quatro portões e torres de vigia", "Uma fortaleza central protege os acessos principais"],
  "Cidade grande": ["Muralhas duplas, balistas e uma cidadela fortificada", "Portões encantados e torres guarnecidas dia e noite"],
  Metrópole: ["Três anéis de muralhas, fortalezas distritais e defesas arcanas", "Uma cidadela colossal, muralhas encantadas e um exército permanente"],
};
const guardQualities = [
  "Honesta, porém mal equipada", "Bem treinada e respeitada", "Numerosa, corrupta e fácil de subornar", "Pequena, mas apoiada por aventureiros locais", "Brutal e totalmente leal ao governante", "Dividida entre duas comandantes rivais", "Reforçada por construtos ou criaturas treinadas",
];
const unusualLaws = [
  "É proibido portar armas desembainhadas dentro das muralhas",
  "Toda magia deve ser registrada antes de ser conjurada em público",
  "Estrangeiros não podem sair às ruas depois da meia-noite",
  "Duelos são legais ao nascer do sol, desde que tenham duas testemunhas",
  "Mentir diante de um sacerdote da cidade é considerado crime grave",
  "Máscaras são obrigatórias durante a noite de lua nova",
  "Cadáveres devem ser cremados antes do próximo pôr do sol",
  "Nenhum sino pode tocar depois da meia-noite",
];
const localCustoms = [
  "Visitantes amarram uma fita no portão para indicar intenções pacíficas",
  "Moradores deixam uma moeda na janela para afastar maus espíritos",
  "Toda negociação importante começa com a partilha de pão e sal",
  "As pessoas evitam dizer o nome dos mortos durante o inverno",
  "Crianças pintam símbolos de proteção nas portas no início de cada mês",
  "Uma cadeira vazia é mantida em toda grande celebração para um herói desaparecido",
];

const districtTypes = [
  { nome: "Bairro da Coroa", descricao: "Sede do governo, de residências nobres e de intrigas políticas." },
  { nome: "Mercado das Sete Ruas", descricao: "Centro comercial lotado de mercadores, artistas e batedores de carteira." },
  { nome: "Distrito das Forjas", descricao: "Oficinas, fundições e guildas produzem barulho até tarde da noite." },
  { nome: "Baixios", descricao: "Ruas pobres e apertadas onde a guarda raramente entra sozinha." },
  { nome: "Bairro dos Templos", descricao: "Santuários rivais disputam fiéis, doações e influência." },
  { nome: "Porto Velho", descricao: "Armazéns, tavernas e docas recebem viajantes e cargas suspeitas." },
  { nome: "Jardins Altos", descricao: "Mansões protegidas por muros dominam a parte mais rica da cidade." },
  { nome: "Arco Arcano", descricao: "Magos, alquimistas e livreiros trabalham sob constante supervisão." },
  { nome: "Bairro dos Estrangeiros", descricao: "Culturas distantes se misturam em hospedarias e mercados próprios." },
  { nome: "Catacumbas", descricao: "Túneis antigos servem de necrópole, esconderijo e caminho clandestino." },
];

const locationTypes = [
  { tipo: "Taverna", nomes: ["O Dragão Sonolento", "A Caneca Partida", "O Corvo e a Chave"], detalhe: "Ponto de encontro de viajantes, informantes e aventureiros." },
  { tipo: "Templo", nomes: ["Santuário da Chama Serena", "Templo das Sete Vozes", "Capela do Último Sol"], detalhe: "Seus sacerdotes conhecem curas, profecias e segredos dos moradores." },
  { tipo: "Fortaleza", nomes: ["Cidadela de Pedra Negra", "Torre do Juramento", "Bastião do Grifo"], detalhe: "Guarda armas, prisioneiros e documentos de grande valor político." },
  { tipo: "Mercado", nomes: ["Feira das Mil Cores", "Mercado da Lua", "Praça dos Mercadores"], detalhe: "Produtos comuns dividem espaço com itens raros e negócios clandestinos." },
  { tipo: "Oficina", nomes: ["Forja de Brasa Azul", "Oficina do Engrenista", "Martelos de Prata"], detalhe: "Seu proprietário aceita encomendas especiais por um preço ou favor." },
  { tipo: "Biblioteca", nomes: ["Arquivo das Cinzas", "Biblioteca Real", "Casa dos Mapas"], detalhe: "Abriga mapas incompletos, registros proibidos e histórias esquecidas." },
  { tipo: "Hospedaria", nomes: ["A Raposa Dourada", "Pouso do Peregrino", "Estalagem da Ponte"], detalhe: "Oferece quartos seguros, desde que ninguém faça perguntas demais." },
  { tipo: "Local misterioso", nomes: ["Poço dos Sussurros", "Porta sem Rua", "Obelisco Partido"], detalhe: "Moradores evitam o lugar e discordam sobre sua verdadeira origem." },
];

const factionTemplates = [
  { nome: "Guilda da Chave Dourada", objetivo: "Controlar o comércio e as rotas de abastecimento", metodo: "Subornos, contratos exclusivos e sabotagem econômica" },
  { nome: "Companhia do Escudo Rubro", objetivo: "Expandir sua autoridade sobre a guarda", metodo: "Proteção armada, intimidação e recrutamento de veteranos" },
  { nome: "Círculo do Véu", objetivo: "Ocultar e estudar um segredo arcano sob a cidade", metodo: "Espionagem, magia e agentes infiltrados" },
  { nome: "Irmandade dos Becos", objetivo: "Manter o crime organizado sob seu domínio", metodo: "Contrabando, chantagem e favores à população pobre" },
  { nome: "Ordem da Luz Vigilante", objetivo: "Eliminar cultos e criaturas consideradas profanas", metodo: "Investigações, sermões e julgamentos públicos" },
  { nome: "Liga dos Livres", objetivo: "Derrubar privilégios nobres e impostos abusivos", metodo: "Panfletos, greves e reuniões secretas" },
  { nome: "Casa Vesper", objetivo: "Colocar um de seus herdeiros no governo", metodo: "Casamentos, duelos e intriga política" },
];

const npcRoles = [
  "Comandante da guarda", "Mercadora influente", "Sacerdote local", "Chefe de guilda", "Estalajadeira", "Curandeiro", "Contrabandista", "Erudita", "Nobre em decadência", "Caçadora de recompensas", "Maga licenciada", "Líder comunitário",
];
const npcTraits = [
  "Fala baixo e nunca perde contato visual", "Ri nos momentos menos apropriados", "Anota todas as conversas", "É generoso, mas exige lealdade absoluta", "Desconfia de qualquer pessoa armada", "Trata todo encontro como uma negociação", "É conhecido por cumprir sua palavra", "Parece sempre saber mais do que revela",
];
const npcSecrets = [
  "Trabalha secretamente para uma facção rival", "Encontrou uma passagem para ruínas sob a cidade", "É herdeiro de uma linhagem que deveria estar extinta", "Deve uma grande quantia ao submundo local", "Protege uma criatura procurada pela guarda", "Falsificou os documentos que sustentam sua posição", "Recebe mensagens de alguém que morreu há anos", "Planeja abandonar a cidade antes do próximo festival",
];

const problems = [
  "Pessoas desaparecem perto dos túneis antigos",
  "Uma doença desconhecida se espalha entre os bairros pobres",
  "Duas facções estão prestes a iniciar uma guerra nas ruas",
  "O abastecimento de água foi contaminado deliberadamente",
  "Criaturas atacam caravanas nas estradas próximas",
  "Impostos extraordinários estão levando comerciantes à revolta",
  "Um culto recruta membros entre os soldados da guarda",
  "Os mortos recentes não permanecem em seus túmulos",
  "Uma criatura colossal foi vista sob as fundações da cidade",
];
const rumors = [
  "O governante verdadeiro morreu e foi substituído por um impostor",
  "Existe uma sala de tesouros esquecida sob o edifício do governo",
  "A taverna mais antiga possui uma porta para outro plano",
  "Um dragão vive disfarçado entre os mercadores",
  "A guarda vende prisioneiros para uma mina secreta",
  "Um mapa tatuado nas costas de um mendigo leva a uma relíquia",
  "Os sinos da cidade tocarão sozinhos antes de uma grande tragédia",
  "Uma das estátuas da praça muda de posição durante a noite",
];
const adventureHooks = [
  "Encontrar uma pessoa desaparecida antes que a guarda encerre a investigação",
  "Escoltar uma testemunha através de bairros controlados por uma facção inimiga",
  "Recuperar um objeto roubado sem provocar uma guerra entre guildas",
  "Investigar uma passagem recém-aberta para ruínas sob a cidade",
  "Impedir um atentado durante uma cerimônia pública",
  "Descobrir quem está falsificando ordens com o selo do governante",
  "Proteger um monstro inocente escondido entre os moradores",
  "Entrar em um baile nobre para obter provas de uma conspiração",
  "Romper uma maldição antes do próximo nascer da lua",
];
const upcomingEvents = [
  "O Festival das Lanternas começa em três dias",
  "Uma comitiva real chegará amanhã com centenas de soldados",
  "A eleição do novo conselho ocorrerá ao final da semana",
  "Um eclipse previsto para esta noite deixou templos em alerta",
  "A maior feira do ano atrairá mercadores de vários reinos",
  "Um torneio promete riqueza e um título ao vencedor",
  "O julgamento público de uma figura popular ameaça causar tumultos",
];

function generatePersonName(): string {
  return `${randomItem(firstNames)} ${randomItem(lastNames)}`;
}

function generateCityName(): string {
  return `${randomItem(nameStarts)}${randomItem(nameEnds)}`;
}

export function generateCity(options: CityGenerationOptions): GeneratedCity {
  const porte = resolveOption(options.size, CITY_SIZES);
  const ambiente = resolveOption(options.environment, CITY_ENVIRONMENTS);
  const estilo = resolveOption(options.theme, CITY_THEMES);
  const populationRange = populationRanges[porte];
  const quantities = contentQuantity[porte];
  const government = randomItem(governments);
  const exports = randomItems(environmentEconomy[ambiente], 2);

  return {
    nome: generateCityName(),
    alcunha: randomItem(cityNicknames),
    porte,
    ambiente,
    estilo,
    populacao: randomInt(populationRange[0], populationRange[1]),
    idade: `${randomInt(45, 1_800)} anos desde sua fundação`,
    governo: government.nome,
    governante: `${randomItem(government.titles)} ${generatePersonName()}`,
    povo: randomItem(peoples),
    riqueza: randomItem(wealthLevels),
    atmosfera: randomItem(atmospheres),
    arquitetura: randomItem(architectureByTheme[estilo]),
    presencaMagica: randomItem(magicByTheme[estilo]),
    atividadePrincipal: randomItem(mainActivities),
    exportacoes: exports,
    importacoes: randomItems(imports.filter((item) => !exports.includes(item)), 3),
    mercado: randomItem(markets),
    defesa: randomItem(defensesBySize[porte]),
    guarda: randomItem(guardQualities),
    leiIncomum: randomItem(unusualLaws),
    costumeLocal: randomItem(localCustoms),
    distritos: randomItems(districtTypes, quantities.districts),
    pontosDeInteresse: randomItems(locationTypes, quantities.locations).map((location) => ({
      nome: randomItem(location.nomes),
      tipo: location.tipo,
      detalhe: location.detalhe,
    })),
    faccoes: randomItems(factionTemplates, quantities.factions),
    npcs: Array.from({ length: quantities.npcs }, () => ({
      nome: generatePersonName(),
      funcao: randomItem(npcRoles),
      traco: randomItem(npcTraits),
      segredo: randomItem(npcSecrets),
    })),
    problemas: randomItems(problems, 2),
    rumores: randomItems(rumors, 2),
    ganchos: randomItems(adventureHooks, 3),
    eventoProximo: randomItem(upcomingEvents),
  };
}
