
# HomeBudget

Sistema completo para gestão de orçamento doméstico, desenvolvido com backend em ASP.NET Core 9, frontend em React, autenticação JWT e banco de dados MySQL.

## 🚀 Deploy e Produção

**Quer colocar sua aplicação no ar e compartilhar com outras pessoas?**

- 📖 **Guia Rápido:** Consulte o arquivo [QUICKSTART-DEPLOY.md](QUICKSTART-DEPLOY.md) para deploy em 15-20 minutos (Railway + Vercel)
- 📚 **Guia Completo:** Veja [DEPLOY.md](DEPLOY.md) para todas as opções de deploy (Azure, Render, etc.)
- 🛠️ **Script Automático:** Execute `./prepare-deploy.sh` para preparar o projeto automaticamente

**Plataformas recomendadas (GRATUITAS):**
- **Backend:** Railway (com MySQL integrado)
- **Frontend:** Vercel
- **Custo:** $0/mês no free tier!

---

## Funcionalidades
- ✅ Cadastro e login de usuários (autenticação JWT)
- ✅ Gerenciamento de orçamentos mensais
- ✅ Controle de categorias de despesas e receitas
- ✅ Cadastro e listagem de transações
- ✅ Relatórios gráficos (dashboard)
- ✅ Gerenciamento de "cofrinhos" (poupanças)
- ✅ Cálculo automático do saldo do cofrinho principal
- ✅ Validação ao criar cofrinhos secundários
- ✅ Proteção de rotas (acesso restrito)
- ✅ Interface responsiva e moderna (Material-UI)

## Tecnologias Utilizadas
### Backend
- **ASP.NET Core 9**
- **Entity Framework Core** (ORM)
- **MySQL** (banco de dados)
- **JWT** para autenticação
- **ASP.NET Identity**

### Frontend
- **React**
- **Material-UI**
- **Chart.js**
- **Axios** (requisições HTTP)

### Deploy
- **Docker** (containerização)
- **Railway** (backend + MySQL)
- **Vercel** (frontend)

### Outros
- **VS Code** para desenvolvimento
- **Git** para versionamento
- **.env** para variáveis de ambiente

---

## Como Rodar o Projeto Localmente

### Pré-requisitos
- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (recomendado versão LTS)
- [npm](https://www.npmjs.com/)
- [MySQL](https://dev.mysql.com/downloads/mysql/) (ou Docker)

### 1. Clonar o repositório
```bash
git clone https://github.com/Mathluiz23/home-budget.git
cd home-budget
```

### 2. Configurar o banco de dados MySQL
Crie um banco de dados no MySQL:
```sql
CREATE DATABASE homebudget;
```

### 3. Configurar variáveis de ambiente do Backend
Copie o arquivo de exemplo:
```bash
cp HomeBudget.API/appsettings.Development.json.example HomeBudget.API/appsettings.Development.json
```

Edite `HomeBudget.API/appsettings.Development.json` com suas configurações:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=homebudget;User=root;Password=sua_senha;"
  },
  "JwtSettings": {
    "SecretKey": "sua_chave_jwt_minimo_32_caracteres",
    "Issuer": "HomeBudgetAPI",
    "Audience": "HomeBudgetApp"
  }
}
```

### 4. Rodar o Backend (API)
```bash
cd HomeBudget.API
dotnet restore
dotnet ef database update  # Criar as tabelas no MySQL
dotnet run
```
A API estará disponível em `http://localhost:5021`.

### 5. Configurar variáveis de ambiente do Frontend
Copie o arquivo de exemplo:
```bash
cp homebudget-frontend/.env.example homebudget-frontend/.env
```

O arquivo `.env` deve conter:
```env
REACT_APP_API_URL=http://localhost:5021/api
```

### 6. Rodar o Frontend (React)
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