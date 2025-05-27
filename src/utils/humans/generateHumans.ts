import { gerarNomeAleatorio } from './nomeGenerator';

export type Grupo = 'Bandidos' | 'Piratas' | 'Piratas Espaciais' | 'Guardas' | 'Soldados' | 'Gangues';
export type NivelTecnologico = 'Baixo' | 'Medio' | 'Alto' | 'Muito Alto';
export type NivelMagico = 'Nenhum' | 'Baixo' | 'Medio' | 'Alto';

type Humano = {
  nome: string;
  grupo: Grupo;
  armas: string[];
  magias?: string[];
  ataque: number;
  defesa: number;
};

const armasPorGrupo: Record<Grupo, string[]> = {
  Bandidos: [
    'Adaga', 'Espada Curta', 'Arco', 'Besta', 'Pistola', 'Escopeta', 'Rifle', 'Revolver',
    'Machadinha', 'Bastão', 'Soqueira', 'Porrete', 'Clava', 'Granada de Fragmentação', 'Coquetel Molotov'
  ],
  Piratas: [
    'Adaga', 'Sabre', 'Porrete', 'Pistola', 'Rifle', 'Escopeta', 'Canhão Móvel',
    'Coquetel Molotov', 'Chicote', 'Rede'
  ],
  'Piratas Espaciais': [
    'Adaga', 'Espada', 'Clava', 'Revolver', 'Sabre de Luz',
    'Granada de Luz', 'Granada de Fragmentação', 'Granada de Fumaça', 
    'Granada de Magnetismo', 'Pistola Laser', 'Escopeta Laser', 
    'Rifle Laser', 'Sniper', 'Lança Granadas',
  ],
  Guardas: [
    'Lança', 'Alabarda', 'Besta', 'Arco', 'Adaga', 'Pistola',
    'Rifle', 'Escopeta', 'Rifle de Assalto', 'Lança Granadas'
  ],
  Soldados: [
    'Adaga', 'Espada', 'Espada de Duas Mãos', 'Machado', 'Machado de Duas Mãos',
    'Clava', 'Soqueira', 'Lança', 'Alabarda', 'Lança de Arremesso', 'Pistola', 'Revolver', 'Rifle',
    'Escopeta', 'Arco', 'Besta', 'Granada de Luz', 'Granada de Fragmentação', 'Granada de Fumaça',
    'Granada de Magnetismo', 'Escudo', 'Chicote', 'Martelo de Guerra', 'Martelo', 'Foice'
  ],
  Gangues: [
    'Adaga', 'Soqueira', 'Barra de Ferro', 'Porrete', 'Taco de Baseball',
    'Pé de Cabra', 'Navalha', 'Canivete', 'Coquetel Molotov', 'Glock', '.38', 'Escopeta Cano Serrado', 'AK-47',
    'Uzi', 'MAC-10', 'TEC-9', 'Corrente de Metal', 'Desert Eagle'
  ]
};


const magiasDisponiveis = ['Água', 'Ar', 'Fogo', 'Terra', 'Natureza', 'Animais', 'Trevas', 'Luz'];

const armasPorTecnologia: Record<NivelTecnologico, string[]> = {
  Baixo: [
    'Adaga', 'Espada', 'Machado', 'Arco', 'Porrete', 'Besta', 'Chicote', 'Lança', 'Corrente de Metal',
    'Machadinha', 'Bastão', 'Sabre', 'Rede', 'Foice', 'Soqueira', 'Barra de Ferro', 'Taco de Baseball', 'Pé de Cabra', 'Navalha', 'Canivete'
  ],
  Medio: [
    'Lança', 'Espada', 'Machado', 'Besta', 'Clava', 'Espada de Duas Mãos', 'Alabarda', 'Soqueira', 'Pistola', 'Rifle', 'Corrente de Metal',
    'Martelo', 'Martelo de Guerra', 'Revolver', 'Escudo', 'Espada Curta', 'Lança de Arremesso', 'Coquetel Molotov',
    'Barra de Ferro', 'Taco de Baseball', 'Pé de Cabra', 'Navalha', 'Canivete'
  ],
  Alto: [
    'Soqueira', 'Pistola', 'Rifle', 'Martelo', 'Martelo de Guerra', 'Revolver', 
    'Glock', '.38', 'Escopeta Cano Serrado', 'AK-47', 'Uzi', 'MAC-10', 'TEC-9', 'Desert Eagle',
    'Granada de Fragmentação', 'Granada de Luz', 'Granada de Fumaça', 'Granada de Magnetismo',
    'Escopeta', 'Canhão Móvel', 'Coquetel Molotov', 'Lança Granadas', 'Rifle de Assalto', 'Sniper',
    'Lança Granadas'
  ],
  'Muito Alto': [
    'Pistola Laser', 'Sabre de Luz', 'Escopeta Laser', 'Lança Granadas', 'Rifle Laser', 'Sniper', 'Granada de Fragmentação',
    'Glock', '.38', 'Escopeta Cano Serrado', 'AK-47', 'Uzi', 'MAC-10', 'TEC-9', 'Desert Eagle',
    'Granada de Luz', 'Granada de Fumaça', 'Granada de Magnetismo'
  ]
};


const periciaPorNivel = (nivel: number) => {
  const base = [15, 25, 40, 60, 85, 115];
  const min = base[nivel];
  const max = base[nivel + 1] ? base[nivel + 1] - 1 : base[nivel] + 10;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomItens<T>(arr: T[], max: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * (max + 1)));
}

function gerarMagiasParaGrupo(nivelMagico: NivelMagico): number {
  switch (nivelMagico) {
    case 'Baixo':
      return 1;
    case 'Medio':
      return 1 + (Math.random() < 0.3 ? 1 : 0); // chance de 2
    case 'Alto':
      return 2 + (Math.random() < 0.5 ? 1 : 0); // chance de 3
    default:
      return 0;
  }
}

export function gerarHumanos(
  grupo: Grupo,
  tecnologia: NivelTecnologico,
  magia: NivelMagico,
  quantidade: number,
  nivel: number
): Humano[] {
  const resultado: Humano[] = [];

  for (let i = 0; i < quantidade; i++) {
    if (grupo === 'Piratas Espaciais' && tecnologia === 'Baixo') {
      throw new Error('Piratas Espaciais não podem ter tecnologia Baixo.');
    }

    if (grupo === 'Piratas' && tecnologia === 'Muito Alto') {
      throw new Error('Piratas não podem ter tecnologia Muito Alto.');
    }


    const armasDoGrupo = armasPorGrupo[grupo];
    const armasTec = Object.entries(armasPorTecnologia)
      .filter(([key]) => {
        const ordem = ['Baixo', 'Medio', 'Alto', 'Muito Alto'];
        return ordem.indexOf(key) <= ordem.indexOf(tecnologia);
      })
      .flatMap(([_, armas]) => armas);

    const armasPossiveis = armasDoGrupo.filter((a) => armasTec.includes(a));
    const armasSelecionadas = [randomItem(armasPossiveis)];

    if (Math.random() < 0.5) {
      const segunda = randomItem(armasPossiveis);
      if (segunda && segunda !== armasSelecionadas[0]) armasSelecionadas.push(segunda);
    }

    if (armasSelecionadas.includes('Escudo')) {
      const extra = randomItem(armasPossiveis.filter((a) => a !== 'Escudo'));
      if (extra) armasSelecionadas.push(extra);
    }

    const nome = gerarNomeAleatorio('comum', randomItem(['Masculino', 'Feminino']), true);

    resultado.push({
      nome,
      grupo,
      armas: armasSelecionadas,
      ataque: periciaPorNivel(nivel),
      defesa: periciaPorNivel(nivel)
    });
  }

  // Aplica magia ao grupo (nível de magia afeta o grupo inteiro)
  const magosNoGrupo = gerarMagiasParaGrupo(magia);
  const indicesUsados: number[] = [];

  for (let i = 0; i < magosNoGrupo; i++) {
    let index = Math.floor(Math.random() * resultado.length);
    while (indicesUsados.includes(index)) {
      index = Math.floor(Math.random() * resultado.length);
    }
    indicesUsados.push(index);
    const quantidadeMagias = Math.floor(Math.random() * 2) + 1;
    const magias = randomItens(magiasDisponiveis, quantidadeMagias).map(m => `*${m}*`);
    resultado[index].magias = magias;
  }

  return resultado;
}
