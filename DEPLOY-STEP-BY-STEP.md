# 🚀 GUIA COMPLETO DE DEPLOY - HomeBudget
## Deploy Seguro no Railway + Vercel

---

## ⚠️ IMPORTANTE - SEGURANÇA

**NUNCA commite:**
- ❌ Arquivos `.env` reais
- ❌ `appsettings.Development.json` com suas credenciais locais
- ❌ Senhas ou chaves secretas no código

**Sempre use:**
- ✅ Variáveis de ambiente nas plataformas de deploy
- ✅ Arquivos `.example` como templates
- ✅ `.gitignore` configurado corretamente

---

## 📋 PRÉ-REQUISITOS

1. ✅ Conta no GitHub
2. ✅ Código no repositório GitHub
3. ✅ Conta no Railway (https://railway.app)
4. ✅ Conta na Vercel (https://vercel.com)

---

## 🎯 PASSO 1: GERAR CHAVE JWT SEGURA

Abra o terminal e execute:

```bash
openssl rand -base64 32
```

**COPIE E GUARDE** o resultado. Você vai usar na configuração do Railway.

Exemplo de saída:
```
Ab3Cd5Ef7Gh9Ij1Kl3Mn5Op7Qr9St1Uv3Wx5Yz==
```

---

## 🔧 PASSO 2: PREPARAR O REPOSITÓRIO

### 2.1 Verificar arquivos sensíveis

```bash
cd /Users/matheusluizdasilva/Downloads/HomeBudget
git status
```

### 2.2 Commitar arquivos seguros

```bash
# Adicionar arquivos de deploy
git add .gitignore
git add README.md
git add DEPLOY.md QUICKSTART-DEPLOY.md COMANDOS.md DEPLOY-FILES.md MYSQL-CONFIG.md
git add HomeBudget.API/Dockerfile
git add HomeBudget.API/.dockerignore
git add HomeBudget.API/appsettings.Production.json.example
git add HomeBudget.API/Program.cs
git add HomeBudget.API/appsettings.json
git add homebudget-frontend/.env.production
git add prepare-deploy.sh
git add .env.example

git commit -m "feat: adiciona configuração para deploy em produção

- Adiciona Dockerfile para containerização
- Configura CORS dinâmico via variáveis de ambiente
- Adiciona documentação completa de deploy
- Atualiza .gitignore para proteger dados sensíveis"

git push origin main
```

---

## 🚀 PASSO 3: DEPLOY DO BACKEND NO RAILWAY

### 3.1 Criar Projeto no Railway

1. Acesse: **https://railway.app/**
2. Clique em **"Login"** → Login com GitHub
3. Clique em **"New Project"**
4. Selecione **"Deploy from GitHub repo"**
5. Escolha o repositório **`home-budget`**
6. Railway iniciará o build automaticamente

### 3.2 Adicionar MySQL

1. No projeto, clique em **"New"**
2. Selecione **"Database"**
3. Escolha **"Add MySQL"**
4. Railway criará o banco automaticamente

### 3.3 Obter Connection String do MySQL

1. Clique no serviço **MySQL** que foi criado
2. Vá na aba **"Variables"**
3. Procure a variável **`MYSQL_URL`**
4. Clique em **"Copy"** para copiar o valor completo

Exemplo de formato:
```
mysql://root:senha@containers-us-west-123.railway.app:1234/railway
```

### 3.4 Configurar Variáveis de Ambiente do Backend

1. Clique no serviço **HomeBudget.API** (o backend)
2. Vá na aba **"Variables"**
3. Clique em **"New Variable"** e adicione cada uma abaixo:

**VARIÁVEL 1:**
```
Name: ASPNETCORE_ENVIRONMENT
Value: Production
```

**VARIÁVEL 2:**
```
Name: ConnectionStrings__DefaultConnection
Value: COLE_AQUI_A_MYSQL_URL_COPIADA_ACIMA
```

**VARIÁVEL 3:**
```
Name: JwtSettings__SecretKey
Value: COLE_AQUI_A_CHAVE_JWT_GERADA_NO_PASSO_1
```

**VARIÁVEL 4:**
```
Name: JwtSettings__Issuer
Value: HomeBudgetAPI
```

**VARIÁVEL 5:**
```
Name: JwtSettings__Audience
Value: HomeBudgetApp
```

**VARIÁVEL 6 (adicionar depois da Vercel):**
```
Name: AllowedOrigins__0
Value: http://localhost:3000
```
*(Vamos atualizar isso depois de ter a URL da Vercel)*

### 3.5 Gerar Domínio Público

1. No serviço **HomeBudget.API**, vá em **"Settings"**
2. Role até **"Networking"**
3. Clique em **"Generate Domain"**
4. **COPIE A URL** gerada (exemplo: `https://homebudget-production-abc123.up.railway.app`)

### 3.6 Aguardar Deploy

- Railway fará o build e deploy automaticamente
- Aguarde até ver **"Active"** no status
- Isso pode levar 3-5 minutos

---

## 🌐 PASSO 4: DEPLOY DO FRONTEND NA VERCEL

### 4.1 Criar Projeto na Vercel

1. Acesse: **https://vercel.com/**
2. Clique em **"Login"** → Login com GitHub
3. Clique em **"Add New..."** → **"Project"**
4. Selecione o repositório **`home-budget`**

### 4.2 Configurar Build

Na tela de configuração:

**Framework Preset:**
```
Create React App
```

**Root Directory:**
```
homebudget-frontend
```

**Build Command:** (já detectado automaticamente)
```
npm run build
```

**Output Directory:** (já detectado automaticamente)
```
build
```

### 4.3 Adicionar Variável de Ambiente

1. Clique em **"Environment Variables"**
2. Adicione:

**VARIÁVEL:**
```
Name: REACT_APP_API_URL
Value: https://sua-url-do-railway.up.railway.app/api
```

⚠️ **IMPORTANTE:** 
- Use a URL que o Railway gerou no **Passo 3.5**
- Adicione `/api` no final
- Exemplo completo: `https://homebudget-production-abc123.up.railway.app/api`

### 4.4 Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (2-3 minutos)
3. **COPIE A URL** gerada (exemplo: `https://home-budget-xyz.vercel.app`)

---

## 🔄 PASSO 5: CONFIGURAR CORS (CONECTAR BACKEND E FRONTEND)

### 5.1 Voltar ao Railway

1. Acesse **Railway**
2. Entre no projeto **home-budget**
3. Clique no serviço **HomeBudget.API**
4. Vá em **"Variables"**

### 5.2 Atualizar AllowedOrigins

1. Encontre a variável **`AllowedOrigins__0`**
2. Clique em **"Edit"**
3. Atualize o valor para a **URL da Vercel** (copiada no Passo 4.4)

```
AllowedOrigins__0=https://home-budget-xyz.vercel.app
```

⚠️ **IMPORTANTE:** Use a URL EXATA da Vercel, SEM barra no final

### 5.3 Aguardar Redeploy

- Railway fará redeploy automaticamente
- Aguarde 1-2 minutos

---

## ✅ PASSO 6: TESTAR A APLICAÇÃO

### 6.1 Acessar Frontend

1. Abra a URL da Vercel no navegador
2. Você deve ver a tela de Login/Registro

### 6.2 Registrar Usuário

1. Clique em **"Registrar"**
2. Preencha:
   - Nome: Seu Nome
   - Email: seu@email.com
   - Senha: Senha123 (mínimo 6 caracteres, com letra e número)
3. Clique em **"Registrar"**

### 6.3 Fazer Login

1. Use o email e senha que você cadastrou
2. Clique em **"Entrar"**
3. Você deve ser redirecionado para o Dashboard

### 6.4 Testar Funcionalidades

- ✅ Ver Dashboard
- ✅ Criar uma transação
- ✅ Ver categorias
- ✅ Gerenciar cofrinhos

---

## 🐛 TROUBLESHOOTING (Solução de Problemas)

### ❌ Erro: "Network Error" ou "Failed to fetch"

**Causa:** Backend não está respondendo ou URL incorreta

**Solução:**
1. Verifique se o backend está **"Active"** no Railway
2. Confirme que `REACT_APP_API_URL` na Vercel está correta
3. Verifique que tem `/api` no final da URL
4. No Railway, veja os **Logs** do backend para erros

### ❌ Erro: "CORS policy" no console do navegador

**Causa:** URL da Vercel não está nas origens permitidas

**Solução:**
1. No Railway, vá em **Variables** do backend
2. Verifique se `AllowedOrigins__0` tem a URL EXATA da Vercel
3. Aguarde o redeploy (1-2 minutos)
4. Limpe o cache do navegador (Ctrl+Shift+R ou Cmd+Shift+R)

### ❌ Erro: "500 Internal Server Error"

**Causa:** Problema com banco de dados ou configuração

**Solução:**
1. No Railway, clique no serviço **MySQL**
2. Verifique se está **"Active"**
3. No backend, vá em **Variables**
4. Confirme que `ConnectionStrings__DefaultConnection` está correto
5. Veja os **Logs** do backend para detalhes do erro

### ❌ Erro: "401 Unauthorized" ao fazer login

**Causa:** JWT não configurado corretamente

**Solução:**
1. No Railway, vá em **Variables** do backend
2. Verifique que `JwtSettings__SecretKey` tem pelo menos 32 caracteres
3. Confirme que todas as variáveis JWT estão presentes:
   - `JwtSettings__SecretKey`
   - `JwtSettings__Issuer`
   - `JwtSettings__Audience`
4. Faça redeploy

### ❌ Backend não faz deploy no Railway

**Causa:** Erro no Dockerfile ou configuração

**Solução:**
1. No Railway, vá em **Deployments**
2. Clique no último deployment
3. Veja os **Logs** para identificar o erro
4. Problemas comuns:
   - Dockerfile não está na raiz do projeto backend
   - Faltam dependências no .csproj
   - Porta incorreta no Dockerfile

---

## 📊 VERIFICAR STATUS DOS SERVIÇOS

### Railway (Backend + MySQL)

1. Acesse **Railway Dashboard**
2. Verifique:
   - ✅ **HomeBudget.API**: Status "Active"
   - ✅ **MySQL**: Status "Active"
3. Para ver logs:
   - Clique no serviço
   - Vá em **"Deployments"**
   - Clique no deployment mais recente
   - Veja os logs em tempo real

### Vercel (Frontend)

1. Acesse **Vercel Dashboard**
2. Verifique:
   - ✅ Último deployment: "Ready"
3. Para ver logs:
   - Clique no projeto
   - Vá em **"Deployments"**
   - Clique no deployment
   - Veja **"Build Logs"** e **"Runtime Logs"**

---

## 🔐 SEGURANÇA - CHECKLIST FINAL

Antes de compartilhar a URL:

- [ ] `appsettings.Development.json` NÃO está no GitHub
- [ ] Arquivo `.env` com senhas locais NÃO está no GitHub
- [ ] Chave JWT no Railway tem pelo menos 32 caracteres
- [ ] Connection string do MySQL não está exposta no código
- [ ] CORS configurado apenas para URL da Vercel
- [ ] `.gitignore` está protegendo arquivos sensíveis

---

## 📤 COMPARTILHAR COM OUTRAS PESSOAS

Após deploy bem-sucedido:

1. **Compartilhe apenas a URL da Vercel:**
   ```
   https://home-budget-xyz.vercel.app
   ```

2. **Cada pessoa:**
   - Acessa a URL
   - Registra uma conta com email único
   - Faz login e usa o sistema
   - Dados são isolados por usuário

3. **Não há limite de usuários!** 🎉

---

## 💰 CUSTOS

### Railway (Free Tier)
- ✅ **$5 de crédito/mês** (renova todo mês)
- ✅ Suficiente para 20-50 usuários ativos
- ⚠️ Se exceder, serviço pausa até próximo mês
- 💡 Pode adicionar cartão de crédito para uso ilimitado (pay-as-you-go)

### Vercel (Free Tier)
- ✅ **Ilimitado** para projetos pessoais
- ✅ 100GB bandwidth/mês
- ✅ Deploy automático a cada push no GitHub
- ✅ SSL/HTTPS automático

**Total: GRATUITO** para uso normal! 🎉

---

## 🔄 ATUALIZAÇÕES FUTURAS

Para atualizar o código após mudanças:

1. **Faça alterações no código local**
2. **Commit e push:**
   ```bash
   git add .
   git commit -m "feat: nova funcionalidade"
   git push origin main
   ```
3. **Deploy automático:**
   - Railway faz redeploy automático do backend
   - Vercel faz redeploy automático do frontend
4. **Pronto!** 🚀

---

## 📞 RESUMO - QUICK REFERENCE

### URLs Importantes

```
GitHub: https://github.com/Mathluiz23/home-budget
Railway: https://railway.app/
Vercel: https://vercel.com/

Backend (API): https://sua-url.up.railway.app
Frontend (App): https://sua-url.vercel.app
```

### Variáveis de Ambiente - Backend (Railway)

```bash
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=<MYSQL_URL>
JwtSettings__SecretKey=<CHAVE_32_CARACTERES>
JwtSettings__Issuer=HomeBudgetAPI
JwtSettings__Audience=HomeBudgetApp
AllowedOrigins__0=<URL_DA_VERCEL>
```

### Variáveis de Ambiente - Frontend (Vercel)

```bash
REACT_APP_API_URL=<URL_DO_RAILWAY>/api
```

---

## ✨ PRONTO!

Sua aplicação está no ar! 🎉

Agora você pode:
- 🌐 Acessar de qualquer lugar
- 👥 Compartilhar com amigos/família
- 📱 Usar no celular (é responsivo!)
- 🔄 Atualizar automaticamente a cada push

---

**Desenvolvido com ❤️ usando:**
- ASP.NET Core 9
- React
- MySQL
- Railway
- Vercel
