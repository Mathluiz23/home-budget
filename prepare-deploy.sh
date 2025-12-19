#!/bin/bash

echo "🚀 HomeBudget - Preparação para Deploy"
echo "======================================"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -f "HomeBudget.sln" ]; then
    echo -e "${RED}❌ Erro: Execute este script na raiz do projeto HomeBudget${NC}"
    exit 1
fi

echo "📋 Checklist de Deploy"
echo "----------------------"
echo ""

# 1. Verificar se há mudanças não commitadas
echo -n "1. Verificando mudanças não commitadas... "
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Há mudanças não commitadas${NC}"
    echo ""
    git status --short
    echo ""
    read -p "Deseja commitar agora? (s/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        git add .
        read -p "Mensagem do commit: " commit_msg
        git commit -m "$commit_msg"
        echo -e "${GREEN}✅ Commit realizado${NC}"
    fi
else
    echo -e "${GREEN}✅${NC}"
fi

# 2. Verificar se o repositório está no GitHub
echo -n "2. Verificando repositório remoto... "
if git remote -v | grep -q "github.com"; then
    REPO_URL=$(git config --get remote.origin.url)
    echo -e "${GREEN}✅${NC}"
    echo "   Repositório: $REPO_URL"
else
    echo -e "${RED}❌ Repositório não está no GitHub${NC}"
    echo "   Configure o repositório remoto com:"
    echo "   git remote add origin https://github.com/seu-usuario/seu-repo.git"
    exit 1
fi

# 3. Push para o GitHub
echo -n "3. Enviando código para o GitHub... "
git push origin main 2>&1 | grep -q "Everything up-to-date\|Writing objects"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${YELLOW}⚠️  Execute: git push origin main${NC}"
fi

# 4. Gerar chave JWT
echo ""
echo "4. Gerando chave JWT segura..."
JWT_KEY=$(openssl rand -base64 32)
echo -e "${GREEN}✅ Chave gerada:${NC}"
echo "   $JWT_KEY"
echo ""
echo "   ⚠️  SALVE ESTA CHAVE! Você vai precisar dela no Railway/Vercel"
echo ""

# 5. Informações importantes
echo "📝 Informações para o Deploy"
echo "=============================="
echo ""
echo "VARIÁVEIS DE AMBIENTE NECESSÁRIAS:"
echo "----------------------------------"
echo ""
echo "Para o RAILWAY (Backend):"
echo "-------------------------"
echo "ASPNETCORE_ENVIRONMENT=Production"
echo "ConnectionStrings__DefaultConnection=<MYSQL_URL_DO_RAILWAY>"
echo "JwtSettings__SecretKey=$JWT_KEY"
echo "JwtSettings__Issuer=HomeBudgetAPI"
echo "JwtSettings__Audience=HomeBudgetApp"
echo "AllowedOrigins__0=<URL_DA_VERCEL>"
echo ""
echo "Para a VERCEL (Frontend):"
echo "-------------------------"
echo "REACT_APP_API_URL=<URL_DO_RAILWAY>/api"
echo ""

# 6. Próximos passos
echo ""
echo "🎯 PRÓXIMOS PASSOS:"
echo "==================="
echo ""
echo "1. Acesse: https://railway.app/"
echo "   - Faça login com GitHub"
echo "   - New Project → Deploy from GitHub repo"
echo "   - Selecione este repositório"
echo "   - Adicione MySQL: New → Database → MySQL"
echo "   - Configure as variáveis de ambiente acima"
echo "   - Gere um domínio em Settings → Generate Domain"
echo ""
echo "2. Acesse: https://vercel.com/"
echo "   - Faça login com GitHub"
echo "   - Add New → Project"
echo "   - Selecione este repositório"
echo "   - Root Directory: homebudget-frontend"
echo "   - Adicione REACT_APP_API_URL nas variáveis"
echo "   - Deploy!"
echo ""
echo "3. Volte ao Railway:"
echo "   - Atualize AllowedOrigins__0 com a URL da Vercel"
echo ""
echo -e "${GREEN}✅ Preparação concluída!${NC}"
echo ""
echo "📖 Consulte QUICKSTART-DEPLOY.md para instruções detalhadas"
echo ""
