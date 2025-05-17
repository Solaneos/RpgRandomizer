import {
    nomesMasculinosComuns,
    nomesFemininosComuns,
    nomesNeutrosComuns,
    nomesMasculinosMedievais,
    nomesFemininosMedievais,
    nomesNeutrosMedievais,
    sobrenomesComuns,
    sobrenomesMedievais,
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
    } else {
      if (genero === 'masculino') nomes = nomesMasculinosMedievais;
      else if (genero === 'feminino') nomes = nomesFemininosMedievais;
      else nomes = nomesNeutrosMedievais;
    }
  
    const primeiro = nomes[Math.floor(Math.random() * nomes.length)];
    let sobrenome = '';
  
    if (incluirSobrenome) {
      const listaSobrenomes =
        estilo === 'comum' ? sobrenomesComuns : sobrenomesMedievais;
      sobrenome = listaSobrenomes[Math.floor(Math.random() * listaSobrenomes.length)];
    }
  
    return `${primeiro}${sobrenome ? ' ' + sobrenome : ''}`;
  }
  