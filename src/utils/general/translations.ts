export const translations = {
    size: {
      Tiny: 'Minúsculo',
      Small: 'Pequeno',
      Medium: 'Médio',
      Large: 'Grande',
      Huge: 'Enorme',
      Gargantuan: 'Gigantesco',
    },
    type: {
      aberration: 'Aberração',
      beast: 'Besta',
      celestial: 'Celestial',
      construct: 'Construto',
      dragon: 'Dragão',
      elemental: 'Elemental',
      fey: 'Fada',
      fiend: 'Demônio',
      giant: 'Gigante',
      humanoid: 'Humanoide',
      monstrosity: 'Monstruosidade',
      ooze: 'Gosma',
      plant: 'Planta',
      undead: 'Morto-Vivo',
    },
    alignment: {
      'chaotic evil': 'Caótico e Maligno',
      'chaotic good': 'Caótico e Bom',
      'chaotic neutral': 'Caótico e Neutro',
      'lawful evil': 'Ordeiro e Maligno',
      'lawful good': 'Ordeiro e Bom',
      'lawful neutral': 'Ordeiro e Neutro',
      'neutral evil': 'Neutro e Maligno',
      'neutral good': 'Neutro e Bom',
      'neutral': 'Neutro',
      'unaligned': 'Sem Alinhamento',
      'any alignment': 'Qualquer Alinhamento',
    },
    speed: {
      walk: 'Andar',
      fly: 'Voar',
      swim: 'Nadar',
      climb: 'Escalar',
      burrow: 'Escavar',
    },
  };

  export function translate<T extends Record<string, string>>(dict: T, key: string): string {
    return dict[key as keyof T] || key;
  }