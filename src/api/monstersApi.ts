const API_BASE = 'https://www.dnd5eapi.co/api/2014';

export type MonsterBasic = {
  index: string;
  name: string;
  url: string;
};

export type MonsterDetails = {
  name: string;
  size: string;
  type: string;
  alignment: string;
  armor_class: number | { type: string; value: number }[];
  hit_points: number;
  hit_dice: string;
  challenge_rating: number;
  strength: number;
  dexterity: number;
  speed: { [key: string]: string }; // walk, fly, swim, etc.
  actions?: { name: string; desc: string }[];
  special_abilities?: { name: string; desc: string }[];
};

export class MonstersAPI {
  static async fetchMonsterList(): Promise<MonsterBasic[]> {
    const response = await fetch(`${API_BASE}/monsters`);
    const data = await response.json();
    return data.results;
  }

  static async fetchMonsterDetails(index: string): Promise<MonsterDetails> {
    const response = await fetch(`${API_BASE}/monsters/${index}`);
    return response.json();
  }
}
