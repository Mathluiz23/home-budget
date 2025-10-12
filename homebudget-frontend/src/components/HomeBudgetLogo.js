// Logo do HomeBudget - Componente SVG com tema de casa
// Este componente cria um logo personalizado usando SVG com elementos que remetem a uma casa
// Combina ícones de casa com elementos financeiros para representar o orçamento doméstico

import React from 'react';
import { Box } from '@mui/material';

// Componente Logo que aceita props para personalização
const HomeBudgetLogo = ({ 
  size = 40,           // Tamanho do logo em pixels
  color = '#1976d2',   // Cor principal (azul do Material-UI por padrão)
  showText = true,     // Se deve mostrar o texto "HomeBudget"
  textColor = '#1976d2' // Cor do texto
}) => {
  return (
    <Box 
      display="flex" 
      alignItems="center" 
      sx={{ 
        userSelect: 'none', // Impede seleção do texto
        cursor: 'default'   // Cursor padrão
      }}
    >
      {/* SVG do logo - uma casa estilizada com elementos financeiros */}
      <Box 
        component="svg" 
        width={size} 
        height={size} 
        viewBox="0 0 100 100"
        sx={{ mr: showText ? 1 : 0 }}
      >
        {/* Gradiente para dar profundidade ao logo */}
        <defs>
          <linearGradient id="houseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
          
          {/* Gradiente para o telhado */}
          <linearGradient id="roofGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#2E7D32" stopOpacity="1" />
          </linearGradient>
        </defs>
        
        {/* Base/fundação da casa */}
        <rect 
          x="25" y="65" 
          width="50" height="30" 
          fill="url(#houseGradient)"
          rx="2"
          ry="2"
        />
        
        {/* Corpo principal da casa */}
        <rect 
          x="20" y="45" 
          width="60" height="25" 
          fill="url(#houseGradient)"
          stroke={color}
          strokeWidth="1"
          rx="3"
          ry="3"
        />
        
        {/* Telhado da casa - formato triangular */}
        <polygon 
          points="15,45 50,20 85,45" 
          fill="url(#roofGradient)"
          stroke="#2E7D32"
          strokeWidth="1.5"
        />
        
        {/* Chaminé */}
        <rect 
          x="65" y="25" 
          width="8" height="15" 
          fill="#8D6E63"
          stroke="#5D4037"
          strokeWidth="1"
        />
        
        {/* Porta da casa */}
        <rect 
          x="42" y="55" 
          width="16" height="15" 
          fill="#6D4C41"
          stroke="#4A2C2A"
          strokeWidth="1"
          rx="8"
          ry="0"
        />
        
        {/* Maçaneta da porta */}
        <circle 
          cx="54" cy="62" 
          r="1.5" 
          fill="#FFD700"
        />
        
        {/* Janelas da casa */}
        <rect 
          x="27" y="50" 
          width="10" height="8" 
          fill="#87CEEB"
          stroke={color}
          strokeWidth="1"
          rx="1"
        />
        
        <rect 
          x="63" y="50" 
          width="10" height="8" 
          fill="#87CEEB"
          stroke={color}
          strokeWidth="1"
          rx="1"
        />
        
        {/* Divisórias das janelas (cruz) */}
        <line x1="32" y1="50" x2="32" y2="58" stroke={color} strokeWidth="0.5" />
        <line x1="27" y1="54" x2="37" y2="54" stroke={color} strokeWidth="0.5" />
        
        <line x1="68" y1="50" x2="68" y2="58" stroke={color} strokeWidth="0.5" />
        <line x1="63" y1="54" x2="73" y2="54" stroke={color} strokeWidth="0.5" />
        
        {/* Símbolo de dinheiro na casa - representa o aspecto financeiro */}
        <circle 
          cx="50" cy="35" 
          r="8" 
          fill="#4CAF50"
          stroke="#2E7D32"
          strokeWidth="2"
          opacity="0.9"
        />
        
        {/* Símbolo de R$ */}
        <text 
          x="50" y="39" 
          textAnchor="middle" 
          fill="white" 
          fontSize="10" 
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
        >
          R$
        </text>
        
        {/* Pequenas folhas/plantas ao lado da casa para dar vida */}
        <ellipse 
          cx="12" cy="75" 
          rx="3" ry="8" 
          fill="#4CAF50"
          opacity="0.7"
        />
        
        <ellipse 
          cx="88" cy="75" 
          rx="3" ry="8" 
          fill="#4CAF50"
          opacity="0.7"
        />
      </Box>
      
      {/* Texto do logo */}
      {showText && (
        <Box 
          component="span"
          sx={{
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            fontWeight: 600,
            fontSize: `${size * 0.6}px`,
            color: textColor,
            letterSpacing: '-0.5px',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
        >
          Home
          <Box 
            component="span" 
            sx={{ 
              color: '#4CAF50', // Verde para representar dinheiro
              fontWeight: 700 
            }}
          >
            Budget
          </Box>
        </Box>
      )}
    </Box>
  );
};

// Componente menor apenas com ícone para uso em espaços reduzidos
export const HomeBudgetIcon = ({ size = 24, color = '#1976d2' }) => {
  return <HomeBudgetLogo size={size} color={color} showText={false} />;
};

// Exporta o componente principal
export default HomeBudgetLogo;