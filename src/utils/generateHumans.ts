export type Grupo = 'Bandidos' | 'Piratas' | 'Piratas Espaciais' | 'Guardas' | 'Soldados';
export type NivelTecnologico = 'Baixo' | 'Medio' | 'Alto' | 'Muito Alto';
export type NivelMagico = 'Nenhum' | 'Baixo' | 'Medio' | 'Alto';


type Humano = {
  grupo: Grupo;
  armas: string[];
  magias?: string[];
  pericia: number;
};

const armasPorGrupo: Record<Grupo, string[]> = {
  Bandidos: ['Adagas', 'Espadas Curtas', 'Arcos', 'Bestas', 'Pistolas', 'Escopetas', 'Rifles', 'Revolveres', 'Machadinhas', 'Bastoes', 'Soqueiras', 'Porretes', 'Granadas'],
  Piratas: ['Adagas', 'Sabres', 'Porretes', 'Pistolas', 'Rifles', 'Escopetas', 'Canhoes moveis'],
  'Piratas Espaciais': ['Adagas', 'Espadas', 'Porretes', 'Revolveres', 'Sabres de Luz', 'Granadas de Luz', 'Granadas de Fragmentacao', 'Granadas de Fumaca', 'Granadas de Magnetismo', 'Pistolas Laser'],
  Guardas: ['Lancas', 'Alabardas', 'Bestas', 'Arcos', 'Adagas', 'Pistolas', 'Rifles'],
  Soldados: ['Adagas', 'Espadas', 'Espadas de duas maos', 'Machados', 'Machados de Duas Maos', 'Clavas', 'Soqueiras', 'Lancas', 'Alabardas', 'Lancas de Arremesso', 'Pistolas', 'Revolveres', 'Rifles', 'Escopetas', 'Arcos', 'Bestas', 'Granadas de Luz', 'Granadas de Fragmentacao', 'Granadas de Fumaca', 'Granadas de Magnetismo', 'Escudos', 'Chicotes', 'Martelo de Guerra', 'Martelo', 'Foices']
};

const magiasPorGrupo: Record<Grupo, string[]> = {
  Bandidos: ['Magos fracos de Agua', 'Fogo', 'Ar', 'Terra'],
  Piratas: ['Magos de Agua Fracos', 'Bruxas do Mar (medio)', 'Bruxas do Mar (fortes)'],
  'Piratas Espaciais': [],
  Guardas: [],
  Soldados: [
    'Magos Fracos de Agua', 'Terra', 'Ar', 'Fogo',
    'Animais (Druidas)',
    'Magos Medios de Agua', 'Terra', 'Ar', 'Fogo',
    'Magos Fortes de Agua', 'Terra', 'Ar', 'Fogo'
  ]
};

const armasPorTecnologia: Record<NivelTecnologico, string[]> = {
  Baixo: ['Adagas', 'Espadas', 'Machados', 'Arcos', 'Porretes', 'Bestas', 'Chicotes', 'Machadinhas', 'Bastoes', 'Sabres'],
  Medio: ['Lancas', 'Espadas de duas maos', 'Alabardas', 'Soqueiras', 'Pistolas', 'Rifles', 'Martelos', 'Martelos de Guerra'],
  Alto: ['Granadas', 'Escopetas', 'Revolveres', 'Canhoes moveis'],
  'Muito Alto': ['Armas a laser', 'Sabre de luz']
};

// const magiasPorNivel: Record<NivelMagico, string[]> = {
//   Nenhum: [],
//   Baixo: ['Magos Fracos', '1 item mágico'],
//   Medio: ['Magos Médios', 'Até 2 itens mágicos'],
//   Alto: ['Magos Fortes', 'Até 2 itens mágicos']
// };

const periciaPorNivel = (nivel: number) => {
  const base = [15, 25, 40, 60, 85, 115];
  const min = base[nivel];
  const max = base[nivel + 1] ? base[nivel + 1] - 1 : base[nivel] + 10;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export function gerarHumanos(
  grupo: Grupo,
  tecnologia: NivelTecnologico,
  magia: NivelMagico,
  quantidade: number,
  nivel: number
): Humano[] {
  const resultado: Humano[] = [];

  for (let i = 0; i < quantidade; i++) {
    if (grupo === 'Piratas Espaciais' && tecnologia === 'Baixo') continue;
    if (grupo === 'Piratas' && tecnologia === 'Muito Alto') continue;

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
      const extra = randomItem(armasPossiveis.filter(a => a !== 'Escudo'));
      if (extra) armasSelecionadas.push(extra);
    }

    const magiasSelecionadas =
      magia !== 'Nenhum' ? randomItens(magiasPorGrupo[grupo], magia === 'Baixo' ? 1 : 2) : [];

    resultado.push({
      grupo,
      armas: armasSelecionadas,
      magias: magiasSelecionadas,
      pericia: periciaPorNivel(nivel)
    });
  }

  return resultado;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomItens<T>(arr: T[], max: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * (max + 1)));
}
