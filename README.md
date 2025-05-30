
# RPG Randomizer 🎲

A mobile-first React + TypeScript application that generates random monster encounters from the Dungeons & Dragons universe.

## 🔮 Features

- Random monster draw from the D&D 5e API
- Displays detailed monster stats, including:
  - Strength
  - Skill (based on Dexterity)
  - Speed converted to meters
  - Actions
  - Special abilities
- AI description generation using:
  - **OpenAI**
  - **Google Gemini (image + text)**
- Monster filtering by **environment** and **type**
- Human enemy group generator with various custom parameters
- Name generator with style, gender, and surname options

## 📱 Interface

This project is **mobile-first**, optimized for smartphone browsers. A full responsive layout is planned for the future.

## 📂 Tabs Explained

### 🐉 Monstros (Monsters)
- Connects to the D&D 5e API and randomly selects a monster
- Filters available:
  - Environment (desert, forest, cave, etc.)
  - Monster type (hide Humans, Animals, Dragons)
- Option to generate enhanced descriptions using OpenAI or Gemini (with image support)

### 🧍 Humanos (Humans)
- Generates a random group of human enemies
- Customizable filters:
  - Group type (e.g., Bandits, Soldiers)
  - Technology level
  - Magic level
  - Quantity
  - Skill/Difficulty

### 🧾 Nomes (Names)
- Random name generator with:
  - Style (Common or Medieval)
  - Gender (Male, Female, Neutral)
  - Surname toggle

## 🚀 How to Run Locally

```bash
git clone https://github.com/Solaneos/RpgRandomizer.git
cd RpgRandomizer

npm install
npm run dev
```

Access at: `http://localhost:5173`

## 📦 API Used
- [D&D 5e API](https://www.dnd5eapi.co/)

## 🛠️ Technologies

- React
- TypeScript
- Vite
- OpenAI
- Google Gemini (text + image)
- CSS (inline styles, mobile-oriented)

---

## 🇧🇷 Versão em Português

Aplicação React + TypeScript criada para gerar encontros aleatórios com monstros do universo Dungeons & Dragons. Otimizada para celulares.

## 🔮 Funcionalidades

- Sorteio de monstros da API D&D 5e
- Exibe informações detalhadas como:
  - Força
  - Perícia (baseada na Destreza)
  - Velocidade em metros
  - Ações e habilidades especiais
- Integração com IA para gerar descrições:
  - **OpenAI**
  - **Google Gemini** (com imagem)
- Filtros por ambiente e tipo de monstro
- Geração de grupo de inimigos humanos com diversos parâmetros
- Gerador de nomes personalizável

## 📱 Interface

Desenvolvido com foco em **navegador de celular**. Responsividade completa será adicionada futuramente.

## 📂 Abas

### 🐉 Monstros
- Conecta com a API do D&D e sorteia um monstro aleatório
- Filtros disponíveis:
  - Ambiente (floresta, caverna, deserto etc.)
  - Tipo (esconder humanos, animais, dragões)
- Gera texto descritivo usando IA (OpenAI ou Gemini)

### 🧍 Humanos
- Cria grupo aleatório de inimigos humanos com filtros:
  - Grupo (Bandidos, Soldados, Piratas etc.)
  - Nível tecnológico
  - Nível mágico
  - Quantidade
  - Nível de dificuldade

### 🧾 Nomes
- Gera nomes com:
  - Estilo (Comum ou Medieval)
  - Gênero (Masculino, Feminino ou Neutro)
  - Opção de incluir sobrenome

## 🚀 Como executar localmente

```bash
git clone https://github.com/Solaneos/RpgRandomizer.git
cd RpgRandomizer

npm install
npm run dev
```

Abra no navegador: `http://localhost:5173`

## 📦 API utilizada
- [D&D 5e API](https://www.dnd5eapi.co/)

## 🛠️ Tecnologias

- React
- TypeScript
- Vite
- OpenAI
- Google Gemini (texto + imagem)


Sim, esse readme foi gerado com IA, por isso tem os emotes e eu tenho muita preguiça para tentar esconder isso.
