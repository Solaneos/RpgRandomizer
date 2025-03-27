import { useEffect } from 'react';

export function useExtractTranslations() {
  useEffect(() => {
    const API_BASE = 'https://www.dnd5eapi.co/api/2014';

    async function fetchAllMonsters() {
      const res = await fetch(`${API_BASE}/monsters`);
      const data = await res.json();
      const allIndexes: string[] = data.results.map((m: any) => m.index);

      const actionsMap: Record<string, string> = {};
      const abilitiesMap: Record<string, string> = {};

      for (let i = 0; i < allIndexes.length; i++) {
        const index = allIndexes[i];
        try {
          const res = await fetch(`${API_BASE}/monsters/${index}`);
          const monster = await res.json();

          monster.actions?.forEach((a: any) => {
            if (!actionsMap[a.name]) {
              actionsMap[a.name] = a.desc;
            }
          });

          monster.special_abilities?.forEach((a: any) => {
            if (!abilitiesMap[a.name]) {
              abilitiesMap[a.name] = a.desc;
            }
          });

          // Pequeno delay pra evitar sobrecarregar a API
          await new Promise(r => setTimeout(r, 50));
        } catch (err) {
          console.error(`Erro ao buscar ${index}:`, err);
        }
      }

      const result = {
        actions: actionsMap,
        special_abilities: abilitiesMap
      };

      console.log('=== JSON de tradução gerado ===');
      console.log(JSON.stringify(result, null, 2));
    }

    // ⚠️ Rodar apenas UMA VEZ
    fetchAllMonsters();
  }, []);
}