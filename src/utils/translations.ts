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
      aberration: 'aberração',
      beast: 'besta',
      celestial: 'celestial',
      construct: 'construto',
      dragon: 'dragão',
      elemental: 'elemental',
      fey: 'fada',
      fiend: 'demônio',
      giant: 'gigante',
      humanoid: 'humanoide',
      monstrosity: 'monstruosidade',
      ooze: 'gosma',
      plant: 'planta',
      undead: 'morto-vivo',
    },
    alignment: {
      'chaotic evil': 'caótico e maligno',
      'chaotic good': 'caótico e bom',
      'chaotic neutral': 'caótico e neutro',
      'lawful evil': 'ordeiro e maligno',
      'lawful good': 'ordeiro e bom',
      'lawful neutral': 'ordeiro e neutro',
      'neutral evil': 'neutro e maligno',
      'neutral good': 'neutro e bom',
      'neutral': 'neutro',
      'unaligned': 'sem alinhamento',
      'any alignment': 'qualquer alinhamento',
    },
    speed: {
      walk: 'andar',
      fly: 'voar',
      swim: 'nadar',
      climb: 'escalar',
      burrow: 'escavar',
    },
  };

  export function translate<T extends Record<string, string>>(dict: T, key: string): string {
    return dict[key as keyof T] || key;
  }