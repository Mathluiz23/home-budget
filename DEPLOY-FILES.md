# 📦 Arquivos Criados para Deploy

## ✅ Arquivos Adicionados

### 1. Configuração de Deploy
- ✅ `Dockerfile` - Container Docker para o backend
- ✅ `.dockerignore` - Arquivos a ignorar no build Docker
- ✅ `DEPLOY.md` - Guia completo de deploy (todas as opções)
- ✅ `QUICKSTART-DEPLOY.md` - Guia rápido (15-20 minutos)
- ✅ `prepare-deploy.sh` - Script automático de preparação
- ✅ `appsettings.Production.json.example` - Exemplo de config de produção
- ✅ `.env.production` (frontend) - Variáveis de ambiente de produção

### 2. Atualizações
- ✅ `README.md` - Atualizado com informações de deploy
- ✅ `Program.cs` - CORS configurável via variáveis de ambiente
- ✅ `appsettings.json` - Adicionado `AllowedOrigins`
- ✅ `.gitignore` - Atualizado para proteger arquivos sensíveis

---

## 🚀 Como Fazer Deploy

### Opção Recomendada: Railway + Vercel (GRATUITO)

#### 1️⃣ Preparação (1 minuto)
```bash
cd /Users/matheusluizdasilva/Downloads/HomeBudget
./prepare-deploy.sh
```

Este script irá:
- ✅ Verificar se há mudanças não commitadas
- ✅ Fazer push para o GitHub
- ✅ Gerar uma chave JWT segura
- ✅ Mostrar todas as variáveis de ambiente necessárias

#### 2️⃣ Deploy do Backend no Railway (10 minutos)
1. Acesse: https://railway.app/
2. Login com GitHub
3. New Project → Deploy from GitHub repo
4. Selecione `home-budget`
5. Adicione MySQL: New → Database → MySQL
6. Configure variáveis de ambiente (o script mostrará quais)
7. Generate Domain

#### 3️⃣ Deploy do Frontend na Vercel (5 minutos)
1. Acesse: https://vercel.com/
2. Login com GitHub
3. Add New → Project
4. Selecione `home-budget`
5. Root Directory: `homebudget-frontend`
6. Adicione variável: `REACT_APP_API_URL=<URL_DO_RAILWAY>/api`
7. Deploy!

#### 4️⃣ Configurar CORS (2 minutos)
1. Volte ao Railway
2. Adicione variável: `AllowedOrigins__0=<URL_DA_VERCEL>`
3. Aguarde redeploy automático

---

## 📝 Variáveis de Ambiente

### Backend (Railway)
```bash
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=<MYSQL_URL_GERADA_PELO_RAILWAY>
JwtSettings__SecretKey=<CHAVE_GERADA_PELO_SCRIPT>
JwtSettings__Issuer=HomeBudgetAPI
JwtSettings__Audience=HomeBudgetApp
AllowedOrigins__0=<URL_DA_VERCEL>
```

### Frontend (Vercel)
```bash
REACT_APP_API_URL=<URL_DO_RAILWAY>/api
```

---

## 🎯 Checklist Final

Antes de fazer deploy, verifique:

- [ ] Código está commitado no GitHub
- [ ] Arquivo `.gitignore` protege dados sensíveis
- [ ] `appsettings.Development.json` não está no repositório
- [ ] Chave JWT tem pelo menos 32 caracteres
- [ ] Connection string do MySQL está correta
- [ ] URL do frontend está nas origens permitidas (CORS)
- [ ] Testou localmente antes do deploy

---

## 💡 Dicas Importantes

### Segurança
- ⚠️ **NUNCA** commite arquivos `.env` ou `appsettings.Development.json`
- ✅ Use sempre variáveis de ambiente na plataforma de deploy
- ✅ Gere uma chave JWT forte: `openssl rand -base64 32`

### Performance
- ✅ Railway free tier: $5 crédito/mês (renova mensalmente)
- ✅ Vercel free tier: ilimitado para projetos pessoais
- ✅ Ambos fazem deploy automático a cada push no GitHub

### Manutenção
- 🔄 Push no GitHub = Deploy automático
- 📊 Railway tem logs detalhados
- 🌐 Vercel mostra preview de cada deploy

---

## 📖 Documentação Completa

- **Guia Rápido:** [QUICKSTART-DEPLOY.md](QUICKSTART-DEPLOY.md)
- **Guia Completo:** [DEPLOY.md](DEPLOY.md)
- **README Principal:** [README.md](README.md)

---

## 🆘 Precisa de Ajuda?

### Problemas Comuns

**❌ "Network Error" no frontend**
- Verifique se o backend está rodando no Railway
- Confirme que `REACT_APP_API_URL` está correto na Vercel

**❌ "CORS policy" no console**
- Adicione a URL da Vercel em `AllowedOrigins__0` no Railway
- Aguarde o redeploy automático

**❌ "401 Unauthorized"**
- Verifique se `JwtSettings__SecretKey` tem 32+ caracteres
- Confirme que todas as variáveis JWT estão configuradas

**❌ "500 Internal Server Error"**
- Verifique se o MySQL está rodando no Railway
- Confirme que a connection string está correta
- Veja os logs no Railway

---

## ✨ Pronto!

Após o deploy, sua aplicação estará acessível online e você poderá:
- 🌐 Compartilhar a URL com outras pessoas
- 👥 Cada usuário se registra com seu email
- 🔒 Dados isolados por usuário
- 🚀 Deploy automático a cada atualização

**URL do Frontend:** `https://seu-app.vercel.app`
**URL do Backend:** `https://seu-app.railway.app`

---

Desenvolvido com ❤️ usando ASP.NET Core 9, React e MySQL
