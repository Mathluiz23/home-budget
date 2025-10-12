
# HomeBudget

Sistema completo para gestão de orçamento doméstico, desenvolvido com backend em ASP.NET Core 9, frontend em React, autenticação JWT e banco de dados SQLite.

## Funcionalidades
- Cadastro e login de usuários (autenticação JWT)
- Gerenciamento de orçamentos mensais
- Controle de categorias de despesas e receitas
- Cadastro e listagem de transações
- Relatórios gráficos (dashboard)
- Gerenciamento de "piggybanks" (poupanças)
- Proteção de rotas (acesso restrito)
- Interface responsiva e moderna (Material-UI)

## Tecnologias Utilizadas
### Backend
- **ASP.NET Core 9**
- **Entity Framework Core** (ORM)
- **SQLite** (banco de dados local)
- **JWT** para autenticação
- **AutoMapper**
- **ASP.NET Identity**

### Frontend
- **React**
- **Material-UI**
- **Chart.js**
- **Axios** (requisições HTTP)

### Outros
- **VS Code** para desenvolvimento
- **Git** para versionamento
- **.env** para variáveis de ambiente

## Como Rodar o Projeto Localmente

### Pré-requisitos
- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (recomendado versão LTS)
- [npm](https://www.npmjs.com/)
- [SQLite](https://www.sqlite.org/download.html) (opcional, já incluso no projeto)

### 1. Clonar o repositório
```bash
git clone https://github.com/Mathluiz23/home-budget.git
cd home-budget
```

### 2. Configurar variáveis de ambiente
Crie o arquivo `.env` na raiz do backend e do frontend, baseado no `.env.example`:
```env
# Exemplo para backend
DB_CONNECTION_STRING=Data Source=homebudget.db
JWT_SECRET=sua_chave_jwt_segura
```

### 3. Configurar o banco de dados
O projeto já inclui o arquivo `homebudget.db` e scripts SQL. Se necessário, execute o script:
```bash
sqlite3 homebudget.db < HomeBudget.API/create_piggybank_tables.sql
```

### 4. Rodar o Backend (API)
```bash
cd HomeBudget.API
dotnet restore
dotnet build
dotnet run
```
A API estará disponível em `http://localhost:5000` (ou porta configurada).

### 5. Rodar o Frontend (React)
```bash
cd homebudget-frontend
npm install
npm start
```
O frontend estará disponível em `http://localhost:3000`.

### 6. Testar o sistema
- Acesse o frontend, faça cadastro/login e utilize todas as funcionalidades.
- O backend pode ser testado via ferramentas como Postman ou pelo frontend.

## Estrutura dos Arquivos de Configuração
- `.env.example`: Exemplo de variáveis de ambiente (não contém dados sensíveis)
- `appsettings.Development.json`: Configurações do backend para ambiente de desenvolvimento
- `.gitignore`: Garante que arquivos sensíveis não sejam versionados

## Observações de Segurança
- Nunca versionar arquivos `.env` reais ou secrets no repositório
- Use sempre variáveis de ambiente para dados sensíveis
- O arquivo `appsettings.Development.json` não deve conter secrets em produção

## Contribuição
Pull requests são bem-vindos! Siga o padrão de commits e mantenha o código limpo e seguro.

## Licença
Este projeto está sob a licença MIT.