# 🛠️ Comandos Úteis - HomeBudget

## 🚀 Desenvolvimento Local

### Iniciar Backend
```bash
cd HomeBudget.API
dotnet run
# API rodando em: http://localhost:5021
```

### Iniciar Frontend
```bash
cd homebudget-frontend
npm start
# Frontend rodando em: http://localhost:3000
```

### Iniciar Ambos (Linux/Mac)
```bash
# Na raiz do projeto
./start.sh
```

---

## 🗄️ Banco de Dados

### Criar Migration
```bash
cd HomeBudget.API
dotnet ef migrations add NomeDaMigration
```

### Aplicar Migrations
```bash
cd HomeBudget.API
dotnet ef database update
```

### Remover última Migration (não aplicada)
```bash
cd HomeBudget.API
dotnet ef migrations remove
```

### Ver SQL de uma Migration
```bash
cd HomeBudget.API
dotnet ef migrations script
```

---

## 🔑 Segurança

### Gerar Chave JWT Segura
```bash
openssl rand -base64 32
```

### Gerar Senha Aleatória
```bash
openssl rand -base64 16
```

---

## 📦 Deploy

### Preparar para Deploy
```bash
./prepare-deploy.sh
```

### Build de Produção (Frontend)
```bash
cd homebudget-frontend
npm run build
# Arquivos em: homebudget-frontend/build/
```

### Build de Produção (Backend)
```bash
cd HomeBudget.API
dotnet publish -c Release -o ./publish
```

### Build Docker (Backend)
```bash
cd HomeBudget.API
docker build -t homebudget-api .
```

### Rodar Docker Localmente
```bash
docker run -p 8080:8080 homebudget-api
```

---

## 📋 Git

### Commitar Mudanças
```bash
git add .
git commit -m "feat: adiciona nova funcionalidade"
git push origin main
```

### Ver Status
```bash
git status
```

### Ver Log de Commits
```bash
git log --oneline -10
```

### Criar Branch
```bash
git checkout -b feature/nova-funcionalidade
```

### Voltar para Main
```bash
git checkout main
```

---

## 🧪 Testes

### Testar Backend (manual)
```bash
# Registrar usuário
curl -X POST http://localhost:5021/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","password":"Senha123","name":"Teste"}'

# Login
curl -X POST http://localhost:5021/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","password":"Senha123"}'

# Listar transações (substitua TOKEN pelo token recebido no login)
curl -X GET http://localhost:5021/api/transactions \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 🔍 Troubleshooting

### Backend não inicia
```bash
# Verificar se a porta 5021 está em uso
lsof -i :5021

# Matar processo na porta 5021 (Mac/Linux)
kill -9 $(lsof -t -i:5021)
```

### Frontend não inicia
```bash
# Verificar se a porta 3000 está em uso
lsof -i :3000

# Matar processo na porta 3000 (Mac/Linux)
kill -9 $(lsof -t -i:3000)

# Limpar cache do npm
cd homebudget-frontend
rm -rf node_modules package-lock.json
npm install
```

### Erro de CORS
```bash
# Verificar se o CORS está configurado corretamente no Program.cs
# Verificar se a URL do frontend está nas AllowedOrigins
# Verificar se o backend está rodando
```

### Erro de conexão com MySQL
```bash
# Verificar se o MySQL está rodando
mysql -u root -p

# Criar banco de dados manualmente
mysql -u root -p -e "CREATE DATABASE homebudget;"

# Testar conexão
mysql -u root -p homebudget
```

---

## 📊 Monitoramento

### Ver logs do Backend
```bash
cd HomeBudget.API
tail -f backend.log
```

### Ver logs do Docker
```bash
docker logs homebudget-api -f
```

### Ver uso de porta
```bash
# Mac/Linux
lsof -i :5021
lsof -i :3000

# Ou use netstat
netstat -an | grep 5021
```

---

## 🧹 Limpeza

### Limpar arquivos de build (.NET)
```bash
cd HomeBudget.API
dotnet clean
rm -rf bin obj
```

### Limpar node_modules (React)
```bash
cd homebudget-frontend
rm -rf node_modules package-lock.json
npm install
```

### Limpar tudo
```bash
# Backend
cd HomeBudget.API
dotnet clean
rm -rf bin obj

# Frontend
cd ../homebudget-frontend
rm -rf node_modules package-lock.json build

# Reinstalar
npm install
```

---

## 📦 Variáveis de Ambiente

### Ver variáveis (Railway)
```bash
# Acessar Railway CLI
railway login
railway link
railway variables
```

### Ver variáveis (Vercel)
```bash
# Acessar Vercel CLI
vercel login
vercel link
vercel env ls
```

---

## 🔄 Atualizações

### Atualizar dependências (.NET)
```bash
cd HomeBudget.API
dotnet list package --outdated
dotnet add package NomeDoPacote --version X.X.X
```

### Atualizar dependências (React)
```bash
cd homebudget-frontend
npm outdated
npm update
```

---

## 💡 Dicas

### Rodar em segundo plano (Mac/Linux)
```bash
# Backend
cd HomeBudget.API
nohup dotnet run > backend.log 2>&1 &

# Frontend
cd homebudget-frontend
nohup npm start > frontend.log 2>&1 &
```

### Ver processos em execução
```bash
ps aux | grep dotnet
ps aux | grep node
```

### Matar todos os processos .NET
```bash
killall -9 dotnet
```

### Matar todos os processos Node
```bash
killall -9 node
```

---

## 📚 Links Úteis

- [Documentação ASP.NET Core](https://docs.microsoft.com/aspnet/core)
- [Documentação React](https://react.dev/)
- [Entity Framework Core](https://docs.microsoft.com/ef/core)
- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs)
- [MySQL Docs](https://dev.mysql.com/doc/)

---

Desenvolvido com ❤️
