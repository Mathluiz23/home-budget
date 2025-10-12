#!/bin/bash

# Script para iniciar tanto o backend quanto o frontend do HomeBudget

echo "🚀 Iniciando HomeBudget..."

# Parar processos existentes
echo "🛑 Parando processos existentes..."
pkill -f "dotnet.*HomeBudget" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true

# Aguardar um momento para os processos terminarem
sleep 2

# Iniciar o backend em background
echo "🔧 Iniciando backend (.NET API)..."
cd /Users/matheusluizdasilva/Downloads/HomeBudget/HomeBudget.API
nohup /usr/local/share/dotnet/dotnet run > backend.log 2>&1 &
BACKEND_PID=$!

# Aguardar o backend inicializar
echo "⏳ Aguardando backend inicializar..."
sleep 8

# Verificar se o backend está funcionando
if curl -s http://localhost:5021/api/piggybanks > /dev/null 2>&1; then
    echo "✅ Backend iniciado com sucesso na porta 5021"
else
    echo "❌ Erro ao iniciar backend - verificando logs..."
    tail -10 backend.log
    exit 1
fi

# Iniciar o frontend em background
echo "🎨 Iniciando frontend (React)..."
cd /Users/matheusluizdasilva/Downloads/HomeBudget/homebudget-frontend
nohup npm start > frontend.log 2>&1 &
FRONTEND_PID=$!

# Aguardar o frontend inicializar
echo "⏳ Aguardando frontend inicializar..."
sleep 10

# Verificar se o frontend está funcionando
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ Frontend iniciado com sucesso na porta 3001"
else
    echo "⚠️  Frontend ainda inicializando... (pode demorar alguns segundos)"
fi

echo ""
echo "🎉 HomeBudget iniciado com sucesso!"
echo ""
echo "📱 Frontend: http://localhost:3001"
echo "🔧 Backend API: http://localhost:5021"
echo ""
echo "📊 Para monitorar os logs:"
echo "   Backend: tail -f /Users/matheusluizdasilva/Downloads/HomeBudget/HomeBudget.API/backend.log"
echo "   Frontend: tail -f /Users/matheusluizdasilva/Downloads/HomeBudget/homebudget-frontend/frontend.log"
echo ""
echo "🛑 Para parar as aplicações: pkill -f 'dotnet.*HomeBudget' && pkill -f 'react-scripts'"
echo ""
echo "🌐 Abrindo navegador..."
sleep 3
open http://localhost:3001

echo "✨ Pronto! A aplicação está rodando!"