import { useEffect } from 'react';

const MonsterImageChecker = () => {
  useEffect(() => {
    const API_BASE = 'https://www.dnd5eapi.co/api/2014';

    const checkImages = async () => {
      const response = await fetch(`${API_BASE}/monsters`);
      const data = await response.json();

      const missingImages: string[] = [];

      for (const monster of data.results) {
        try {
          const res = await fetch(`${API_BASE}/monsters/${monster.index}`);
          const details = await res.json();

          if (!details.image) {
            missingImages.push(monster.name);
          }
        } catch (err) {
          console.error(`Erro ao buscar ${monster.name}:`, err);
        }
      }

      console.log('🖼️ Monstros sem imagem:', missingImages);
    };

    checkImages();
  }, []);

  return <p>Verificando imagens dos monstros... veja o console.</p>;
};

export default MonsterImageChecker;
