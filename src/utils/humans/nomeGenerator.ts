import {
  nomesMasculinosComuns,
  nomesFemininosComuns,
  nomesNeutrosComuns,
  nomesMasculinosMedievais,
  nomesFemininosMedievais,
  nomesNeutrosMedievais,
  nomesMasculinosEspanhol,
  nomesFemininosEspanhol,
  nomesNeutrosEspanhol,
  sobrenomesComuns,
  sobrenomesMedievais,
  sobrenomesEspanhol,
} from './nomeListas';

export function gerarNomeAleatorio(
  estilo: string,
  genero: string,
  incluirSobrenome: boolean
): string {
  let nomes: string[] = [];

  if (estilo === 'comum') {
    if (genero === 'masculino') nomes = nomesMasculinosComuns;
    else if (genero === 'feminino') nomes = nomesFemininosComuns;
    else nomes = nomesNeutrosComuns;
  } else if (estilo === 'espanhol') {
    if (genero === 'masculino') nomes = nomesMasculinosEspanhol;
    else if (genero === 'feminino') nomes = nomesFemininosEspanhol;
    else nomes = nomesNeutrosEspanhol;
  } else {
    if (genero === 'masculino') nomes = nomesMasculinosMedievais;
    else if (genero === 'feminino') nomes = nomesFemininosMedievais;
    else nomes = nomesNeutrosMedievais;
  }

  const primeiro = nomes[Math.floor(Math.random() * nomes.length)];
  let sobrenome = '';

  if (incluirSobrenome) {
    const listaSobrenomes =
      estilo === 'comum'
        ? sobrenomesComuns
        : estilo === 'espanhol'
          ? sobrenomesEspanhol
          : sobrenomesMedievais;
    sobrenome = listaSobrenomes[Math.floor(Math.random() * listaSobrenomes.length)];
  }

  return `${primeiro}${sobrenome ? ' ' + sobrenome : ''}`;
}
  
