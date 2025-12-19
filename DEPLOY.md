# 🚀 Guia de Deploy - HomeBudget

## Opção 1: Railway (Backend + MySQL) + Vercel (Frontend)

### 📦 BACKEND - Railway

#### 1. Criar conta no Railway
- Acesse: https://railway.app/
- Faça login com GitHub

#### 2. Deploy do Backend
1. No Railway, clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha o repositório `home-budget`
4. Configure as variáveis de ambiente:
   ```
   ASPNETCORE_ENVIRONMENT=Production
   ConnectionStrings__DefaultConnection=mysql://usuario:senha@host:3306/homebudget
   JWT__SecretKey=SUA_CHAVE_SECRETA_AQUI_MINIMO_32_CARACTERES
   JWT__Issuer=HomeBudgetAPI
   JWT__Audience=HomeBudgetApp
   JWT__ExpirationMinutes=1440
   ```

#### 3. Adicionar MySQL no Railway
1. No mesmo projeto, clique em **"New"** → **"Database"** → **"Add MySQL"**
2. Railway criará automaticamente o banco
3. Copie a connection string gerada (variável `DATABASE_URL`)
4. Atualize a variável `ConnectionStrings__DefaultConnection` com essa URL

#### 4. Configurar porta
- Railway usa a porta definida pela variável `PORT`
- O Dockerfile já está configurado para usar a porta 8080

#### 5. Deploy
- Railway fará o deploy automaticamente
- Anote a URL gerada (ex: `https://seu-app.up.railway.app`)

---

### 🌐 FRONTEND - Vercel

#### 1. Criar conta na Vercel
- Acesse: https://vercel.com/
- Faça login com GitHub

#### 2. Preparar o Frontend
Atualize o arquivo `.env` no frontend:
```bash
REACT_APP_API_URL=https://seu-app.up.railway.app/api
```

#### 3. Deploy na Vercel
1. No painel da Vercel, clique em **"Add New Project"**
2. Selecione o repositório `home-budget`
3. Configure:
   - **Framework Preset:** Create React App
   - **Root Directory:** `homebudget-frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

4. Adicione a variável de ambiente:
   ```
   REACT_APP_API_URL=https://seu-app.up.railway.app/api
   ```

5. Clique em **"Deploy"**

#### 4. Configurar CORS no Backend
Adicione a URL da Vercel nas origens permitidas do CORS no `Program.cs`:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000",
            "https://seu-app.vercel.app"  // Adicione sua URL da Vercel aqui
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});
```

---

## Opção 2: Azure (Tudo em um lugar)

### Backend - Azure App Service
1. Acesse: https://portal.azure.com/
2. Crie um **App Service**
3. Escolha **.NET 9.0** como runtime
4. Configure variáveis de ambiente
5. Faça deploy via GitHub Actions ou Visual Studio

### Banco - Azure Database for MySQL
1. Crie um **Azure Database for MySQL**
2. Configure firewall rules
3. Copie a connection string

### Frontend - Azure Static Web Apps
1. Crie um **Static Web App**
2. Conecte ao GitHub
3. Configure build do React

---

## Opção 3: Render

### 1. Criar conta no Render
- Acesse: https://render.com/

### 2. Deploy do Backend
1. Clique em **"New +"** → **"Web Service"**
2. Conecte seu GitHub
3. Configure:
   - **Environment:** Docker
   - **Dockerfile Path:** `HomeBudget.API/Dockerfile`

### 3. Adicionar MySQL
1. Clique em **"New +"** → **"PostgreSQL"** ou use MySQL externo
2. Configure connection string

### 4. Deploy do Frontend
1. Clique em **"New +"** → **"Static Site"**
2. Configure:
   - **Build Command:** `cd homebudget-frontend && npm install && npm run build`
   - **Publish Directory:** `homebudget-frontend/build`

---

## ✅ Checklist Pré-Deploy

- [ ] Criar `.env.example` sem dados sensíveis
- [ ] Configurar CORS para permitir domínio de produção
- [ ] Gerar chave JWT segura (mínimo 32 caracteres)
- [ ] Testar localmente antes do deploy
- [ ] Configurar variáveis de ambiente na plataforma
- [ ] Executar migrations no banco de produção
- [ ] Testar autenticação e endpoints após deploy

---

## 🔒 Segurança

### Variáveis de Ambiente Obrigatórias:
```
ConnectionStrings__DefaultConnection=sua_connection_string
JWT__SecretKey=chave_minimo_32_caracteres_segura
JWT__Issuer=HomeBudgetAPI
JWT__Audience=HomeBudgetApp
ASPNETCORE_ENVIRONMENT=Production
```

### Gerar JWT Secret:
```bash
openssl rand -base64 32
```

---

## 📱 Compartilhar com Outros Usuários

Após o deploy:
1. Compartilhe a URL da Vercel (frontend)
2. Cada usuário precisa se registrar
3. Dados são isolados por usuário (JWT)
4. Não há limite de usuários

---

## 🆘 Troubleshooting

### Backend não conecta ao banco:
- Verifique a connection string
- Confirme que o banco está acessível
- Execute migrations

### CORS error no frontend:
- Adicione a URL do frontend no `Program.cs`
- Verifique se CORS está habilitado

### 401 Unauthorized:
- Verifique se JWT__SecretKey é o mesmo em ambos ambientes
- Confirme que o token está sendo enviado no header

---

## 💰 Custos

### Railway (Free Tier):
- $5 de crédito/mês
- Suficiente para projetos pequenos

### Vercel (Free Tier):
- Ilimitado para projetos pessoais
- 100GB bandwidth/mês

### Render (Free Tier):
- Web services dormem após 15min inatividade
- Banco de dados grátis por 90 dias

### Azure:
- Crédito grátis no primeiro mês
- Depois, varia conforme uso
