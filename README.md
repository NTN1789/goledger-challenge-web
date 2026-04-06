# GoLedger Challenge UI

Aplicacao web em React + Vite para testar o desafio da GoLedger com CRUD de:

- `tvShows`
- `seasons`
- `episodes`
- `watchlist`

A interface permite:

- carregar o schema da API
- pesquisar registros
- ler um registro especifico pela `key`
- criar, editar e apagar assets
- visualizar respostas da API no painel de debug

## Tecnologias

- React
- TypeScript
- Vite
- CSS puro

## Requisitos

- Node.js instalado
- npm instalado
- credenciais de Basic Auth enviadas por email

## Configuracao do ambiente

Cria um ficheiro `.env` na raiz do projeto a partir de [`.env.example`](C:/Users/natan/GoLedgerTest/project/.env.example).

Exemplo:

```env
VITE_API_BASE_URL=/goledger-api
VITE_API_USERNAME=teu_usuario
VITE_API_PASSWORD=tua_senha
```

Notas:

- `VITE_API_BASE_URL=/goledger-api` usa o proxy local do Vite configurado em [`vite.config.ts`](C:/Users/natan/GoLedgerTest/project/vite.config.ts)
- tambem e possivel editar `Base URL`, `Username` e `Password` diretamente na interface

## Como executar

1. Instala as dependencias:

```bash
npm install
```

2. Inicia o projeto:

```bash
npm run dev
```

3. Abre no navegador:

```bash
http://localhost:5173
```

## Scripts

```bash
npm run dev
npm run lint
npx tsc -b
```

## Como usar a interface

### 1. Carregar os tipos da API

1. Preenche `Username` e `Password`
2. Clica em `Carregar schema geral`
3. Escolhe a colecao desejada: `TV Shows`, `Seasons`, `Episodes` ou `Watchlists`

### 2. Pesquisar registros

1. Escolhe a colecao
2. Clica em `Pesquisar`
3. Os resultados aparecem no painel esquerdo

Tambem podes:

- colar uma `key` em `Read/Delete key`
- clicar em `Ler 1 asset`

### 3. Editar registros

1. Faz uma pesquisa
2. Clica em `Editar` num card da lista
3. O formulario da direita entra em modo `Atualizar registo`
4. Altera os campos
5. Clica em `Guardar alteracao`

### 4. Apagar registros

1. Carrega um registro com `Editar` ou `Ler 1 asset`
2. Clica em `Apagar asset`
3. Confirma a acao

## Regras importantes por entidade

### TV Shows

Campos principais:

- `Title`
- `Description`
- `Recommended Age`

Regras:

- `Title` funciona como chave unica
- `Recommended Age` so aceita valores entre `0` e `18`
- se o valor for invalido, a aplicacao mostra erro e nao envia para a API

Exemplo:

- `Title`: `teste-tvshow-001`
- `Description`: `Serie criada para teste`
- `Recommended Age`: `16`

### Seasons

Campos principais:

- `Number`
- `Tv Show`
- `Year of Release`

Regras:

- `Number` deve ser numerico
- `Tv Show` deve apontar para um `TV Show` existente
- a interface ja gera essa referencia automaticamente por dropdown

Fluxo recomendado:

1. cria ou escolhe primeiro um `TV Show`
2. entra em `Seasons`
3. seleciona o `TV Show` no dropdown
4. informa `Number`
5. informa `Year of Release`
6. cria a season

### Episodes

Campos comuns no schema:

- `Season`
- `Episode Number`
- `Title`
- `Release Date`
- `Description`
- `Rating`

Recomendacao:

1. cria primeiro `TV Show`
2. cria depois `Season`
3. so depois cria `Episode`

Se a API exigir referencias completas para `Season`, usa o valor retornado de um registro existente como modelo no painel de debug.

### Watchlists

Campos comuns:

- `Title`
- `Description`
- `TV Shows`

Regra importante:

- `Title` costuma funcionar como chave unica
- `TV Shows` e uma lista de referencias para shows existentes

Atualmente, o campo `TV Shows` em `Watchlists` ainda aceita JSON manual.

Exemplo:

```json
[
  {
    "@assetType": "tvShows",
    "@key": "tvShows:197774df-e719-5bd7-a677-3fa0f7241797"
  }
]
```

## Feedback da interface

- a barra inferior mostra o estado da ultima operacao
- toasts aparecem apenas em:
  - criar
  - atualizar
  - apagar
- o painel `Debug da API` mostra:
  - schema do asset selecionado
  - ultima resposta crua da API

## Erros comuns

### Erro 409: asset already exists

Causa:

- chave duplicada

Exemplo:

- em `TV Shows`, repetir o mesmo `Title`

Solucao:

- usa um valor unico no campo marcado como `chave unica`

### Erro 400 com campo numerico

Causa:

- campo que devia ser numero recebeu texto

Exemplo:

- `Number` em `Seasons`
- `Recommended Age` em `TV Shows`

Solucao:

- usa apenas numeros nesses campos

### Erro 404 asset type does not exist

Causa:

- nome do asset type nao existe na API

Observacao:

- a interface ja normaliza `Watchlists` para `watchlist`

## Estrutura principal do projeto

- [`src/App.tsx`](C:/Users/natan/GoLedgerTest/project/src/App.tsx): container principal
- [`src/components`](C:/Users/natan/GoLedgerTest/project/src/components): componentes da interface
- [`src/services/goLedgerApi.ts`](C:/Users/natan/GoLedgerTest/project/src/services/goLedgerApi.ts): chamadas HTTP
- [`src/utils/schema.ts`](C:/Users/natan/GoLedgerTest/project/src/utils/schema.ts): leitura e parse de schema
- [`src/utils/formatters.ts`](C:/Users/natan/GoLedgerTest/project/src/utils/formatters.ts): labels e utilitarios
- [`src/types/assets.ts`](C:/Users/natan/GoLedgerTest/project/src/types/assets.ts): tipos

## Validacao local

Para validar o codigo localmente:

```bash
npm run lint
npx tsc -b
```

# GoLedger Challenge

In this challenge you will create a web interface to a blockchain application. In this application you must implement a imdb-like interface, to catalogue TV Shows, with series, seasons, episodes and watchlist registration.

# Requirements

- Your application should be able to add/remove/edit and show all tv shows, seasons, episodes and watchlists;
- Use **React** or **Next.js** (all UI libraries are allowed);

## Instructions

- Fork the repository [https://github.com/goledgerdev/goledger-challenge-web](https://github.com/goledgerdev/goledger-challenge-web)
    - Fork it, do **NOT** clone it, since you will need to send us your forked repository
    - If you **cannot** fork it, create a private repository and give access to `andremacedopv` and `lucas-campelo`.
- Create an web application using React. You will implement the basic operations provided by the API, which are `Create`, `Update`, `Delete` and `Search`.
- Improve your application with a beautiful UI.

## Server

The data are obtained using a rest server at this address: `http://ec2-50-19-36-138.compute-1.amazonaws.com`

Also, a Swagger with the endpoints specifications for the operations is provided at this address: `http://ec2-50-19-36-138.compute-1.amazonaws.com/api-docs/index.html`.

Note: The API is protected with Basic Auth. The credentials were sent to you by email.

Tip: execute each operation in the Swagger for information on payload format and endpoint addresses. See examples below.

### Get Schema
Execute a `getSchema` operation to get information on which asset types are available. Don't forget to authenticate with the credentials provided.

```bash
curl -X POST "http://ec2-50-19-36-138.compute-1.amazonaws.com/api/query/getSchema" -H "accept: */*" -H "Content-Type: application/json"
```

Execute a getSchema with a payload to get more details on a particula asset.

```bash
curl -X POST "http://ec2-50-19-36-138.compute-1.amazonaws.com/api/query/getSchema" -H "accept: */*" -H "Content-Type: application/json" -d "{\"assetType\":\"tvShows\"}"
```
Tip: the same can be done with transactions, using the `getTx` endpoint.

### Search
Perform a search query on a particular asset type.
```bash
curl -X POST "http://ec2-50-19-36-138.compute-1.amazonaws.com/api/query/search" -H "accept: */*" -H "Content-Type: application/json" -d "{\"query\":{\"selector\":{\"@assetType\":\"seasons\"}}}"
```
Tip: to read a specific asset, you can use the `readAsset` endpoint.

## Complete the challenge

To complete the challenge, you must send us the link to your forked repository with the code of your application. Please, provide instructions to execute the code.
