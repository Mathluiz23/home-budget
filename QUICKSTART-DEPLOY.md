# 🚀 Quick Start - Deploy HomeBudget

## Opção Mais Rápida: Railway + Vercel (15-20 minutos)

### 📋 Pré-requisitos
- Conta no GitHub
- Código commitado no repositório

---

## PASSO 1️⃣ - Deploy do Backend no Railway (10 min)

### 1. Criar conta no Railway
👉 Acesse: https://railway.app/
- Faça login com GitHub

### 2. Criar novo projeto
1. Clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha o repositório `home-budget`
4. Railway iniciará o deploy automaticamente

### 3. Adicionar MySQL
1. No projeto, clique em **"New"** → **"Database"** → **"Add MySQL"**
2. Railway criará o banco automaticamente
3. Clique no serviço MySQL → **"Variables"** → Copie a variável `MYSQL_URL`

### 4. Configurar variáveis de ambiente no Backend
1. Clique no serviço do backend (HomeBudget.API)
2. Vá em **"Variables"**
3. Adicione as seguintes variáveis:

```bash
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=<COLE_A_MYSQL_URL_AQUI>
JwtSettings__SecretKey=<GERE_UMA_CHAVE_SEGURA_ABAIXO>
JwtSettings__Issuer=HomeBudgetAPI
JwtSettings__Audience=HomeBudgetApp
AllowedOrigins__0=http://localhost:3000
```

### 5. Gerar chave JWT segura
No terminal do seu Mac:
```bash
openssl rand -base64 32
```
Copie o resultado e cole em `JwtSettings__SecretKey`

### 6. Obter URL do Backend
1. No Railway, vá em **"Settings"** do serviço backend
2. Clique em **"Generate Domain"**
3. Copie a URL gerada (ex: `https://homebudget-production-xxxx.up.railway.app`)

---

## PASSO 2️⃣ - Deploy do Frontend na Vercel (5 min)

### 1. Criar conta na Vercel
👉 Acesse: https://vercel.com/
- Faça login com GitHub

### 2. Criar novo projeto
1. Clique em **"Add New..."** → **"Project"**
2. Selecione o repositório `home-budget`
3. Configure:
   - **Framework Preset:** Create React App
   - **Root Directory:** `homebudget-frontend`
   - **Build Command:** `npm run build` (já detectado automaticamente)
   - **Output Directory:** `build` (já detectado automaticamente)

### 3. Adicionar variável de ambiente
1. Clique em **"Environment Variables"**
2. Adicione:
   - **Key:** `REACT_APP_API_URL`
   - **Value:** `https://sua-url-do-railway.up.railway.app/api`
   (Use a URL que você copiou no Railway, adicionando `/api` no final)

### 4. Deploy
1. Clique em **"Deploy"**
2. Aguarde o build (2-3 minutos)
3. Copie a URL gerada (ex: `https://home-budget.vercel.app`)

---

## PASSO 3️⃣ - Configurar CORS (2 min)

### 1. Voltar ao Railway
1. Acesse o serviço backend
2. Vá em **"Variables"**
3. Atualize a variável `AllowedOrigins__0` com a URL da Vercel:
```bash
AllowedOrigins__0=https://home-budget.vercel.app
```
(Use a URL exata que a Vercel gerou)

### 2. Aguardar redeploy
- Railway fará redeploy automaticamente (1-2 minutos)

---

## ✅ PRONTO! Sua aplicação está no ar! 🎉

### Testar:
1. Acesse a URL da Vercel: `https://home-budget.vercel.app`
2. Registre um novo usuário
3. Faça login
4. Use a aplicação normalmente!

---

## 📤 Compartilhar com outras pessoas

Basta enviar a URL da Vercel para quem quiser usar:
- Cada pessoa se registra com seu próprio email
- Os dados são isolados por usuário
- Não há limite de usuários

---

## 🔧 Troubleshooting Rápido

### ❌ Erro: "Network Error" ou "Failed to fetch"
**Causa:** Backend não está respondendo ou CORS não configurado
**Solução:**
1. Verifique se o backend está rodando no Railway (deve estar "Active")
2. Confirme que a URL do backend está correta no `.env` da Vercel
3. Verifique se `AllowedOrigins__0` está com a URL correta da Vercel

### ❌ Erro: "CORS policy" no console do navegador
**Causa:** URL da Vercel não está nas origens permitidas
**Solução:**
1. No Railway, adicione a URL exata da Vercel em `AllowedOrigins__0`
2. Aguarde o redeploy (automático)

### ❌ Erro: "500 Internal Server Error"
**Causa:** Problema com banco de dados ou variáveis de ambiente
**Solução:**
1. Verifique se o MySQL está rodando no Railway
2. Confirme que `ConnectionStrings__DefaultConnection` está correto
3. Verifique os logs no Railway: Serviço → "Deployments" → "View Logs"

### ❌ Erro: "401 Unauthorized" ao fazer login
**Causa:** JWT não está configurado corretamente
**Solução:**
1. Confirme que `JwtSettings__SecretKey` tem pelo menos 32 caracteres
2. Verifique que todas as variáveis JWT estão configuradas

---

## 💰 Custos

### Railway (Free Tier):
- ✅ **$5 de crédito/mês** (renova mensalmente)
- ✅ Suficiente para projetos pequenos com uso moderado
- ⚠️ Se exceder, o serviço pausa até o próximo mês

### Vercel (Free Tier):
- ✅ **Ilimitado** para projetos pessoais
- ✅ 100GB bandwidth/mês
- ✅ Deploy automático a cada push

**Total: GRATUITO** 🎉

---

## 🔄 Atualizações Futuras

### Para atualizar o código:
1. Faça commit das alterações no GitHub
2. Railway e Vercel fazem deploy automático
3. Pronto! 🚀

---

## 📞 Precisa de Ajuda?

Consulte o arquivo `DEPLOY.md` para guias detalhados de outras plataformas (Azure, Render, etc).
