// Dashboard - Página principal da aplicação após o login
// Esta página mostra um resumo das finanças e permite navegar pelas funcionalidades

import React, { useState, useEffect } from 'react';
import {
  Box,              // Container flexível
  AppBar,           // Barra superior
  Toolbar,          // Conteúdo da barra superior  
  Typography,       // Para textos
  Button,           // Botões
  Container,        // Container com largura máxima
  Grid,            // Sistema de grid
  Paper,           // Componente com elevação
  Card,            // Cartões do Material-UI
  CardContent,     // Conteúdo dos cartões
  Fab,             // Floating Action Button
  IconButton,      // Botões com ícones
  Menu,            // Menu dropdown
  MenuItem,        // Item do menu
  Tabs,            // Abas para navegação
  Tab,             // Aba individual
  Collapse,        // Para expandir/contrair conteúdo
  List,            // Lista do Material-UI
  ListItem,        // Item da lista
  ListItemText,    // Texto do item da lista
  Chip,            // Para mostrar tags
} from '@mui/material';

// Importando ícones do Material-UI
import {
  Add as AddIcon,                    // Ícone de adicionar
  AccountCircle,                     // Ícone de perfil  
  Dashboard as DashboardIcon,        // Ícone de dashboard
  Receipt as ReceiptIcon,            // Ícone de transações
  Category as CategoryIcon,          // Ícone de categorias
  Assessment as AssessmentIcon,      // Ícone de relatórios
  Savings as SavingsIcon,            // Ícone de cofrinhos
  ExpandMore as ExpandMoreIcon,      // Ícone de expandir
  ExpandLess as ExpandLessIcon,      // Ícone de contrair
} from '@mui/icons-material';

// Importando nosso contexto de autenticação
import { useAuth } from '../context/AuthContext';

// Importando nossos serviços da API
import { transactionsService } from '../services/api';

// Importando os componentes que criamos
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import HomeBudgetLogo from '../components/HomeBudgetLogo';
import PiggybanksManager from '../components/PiggybanksManager';
import Reports from './Reports';

// Função TabPanel para mostrar o conteúdo de cada aba
// Esta é uma função utilitária que mostra conteúdo baseado na aba selecionada
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}  // Esconde se não é a aba ativa
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Componente principal Dashboard
function Dashboard() {
  // Pega as funções de autenticação do contexto
  const { user, logout } = useAuth();
  
  // Estados para controlar menus e modais
  const [anchorEl, setAnchorEl] = useState(null);                 // Para o menu do perfil
  const [tabValue, setTabValue] = useState(0);                    // Aba ativa
  const [showTransactionForm, setShowTransactionForm] = useState(false); // Se o modal está aberto
  const [editingTransaction, setEditingTransaction] = useState(null);     // Transação sendo editada
  
  // Estados para dados do dashboard - resumo financeiro
  const [summary, setSummary] = useState({
    totalIncome: 0,        // Total de receitas
    totalExpenses: 0,      // Total de despesas
    balance: 0,           // Saldo (receitas - despesas)
    categorySummaries: [], // Resumo por categoria
  });

  // Estados para expansão de categorias e transações detalhadas
  const [expandedCategories, setExpandedCategories] = useState({}); // Controla quais categorias estão expandidas
  const [categoryTransactions, setCategoryTransactions] = useState({}); // Transações detalhadas por categoria
  const [loadingTransactions, setLoadingTransactions] = useState({}); // Loading por categoria

  // useEffect para carregar dados quando o componente é montado
  useEffect(() => {
    loadSummary();
  }, []); // Array vazio significa que executa apenas uma vez

  // Função para buscar o resumo financeiro da API
  const loadSummary = async () => {
    try {
      // Chama nossa API para buscar resumo
      // O endpoint getSummary foi implementado no TransactionsController.cs
      const response = await transactionsService.getSummary();
      
      // Mapeia a resposta da API para o formato esperado pelo frontend
      const apiData = response.data;
      setSummary({
        totalIncome: apiData.totalIncome || 0,
        totalExpenses: apiData.totalExpenses || 0,
        balance: apiData.balance || 0,
        categorySummaries: apiData.categorySummaries || [],
      });
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
    }
  };

  // Função para carregar transações de uma categoria específica
  const loadCategoryTransactions = async (categoryId) => {
    try {
      setLoadingTransactions(prev => ({ ...prev, [categoryId]: true }));
      
      // Busca transações filtradas por categoria
      const response = await transactionsService.getAll({
        categoryId: categoryId,
        pageSize: 50, // Limitar a 50 transações para não sobrecarregar
      });
      
      setCategoryTransactions(prev => ({
        ...prev,
        [categoryId]: response.data
      }));
    } catch (error) {
      console.error('Erro ao carregar transações da categoria:', error);
    } finally {
      setLoadingTransactions(prev => ({ ...prev, [categoryId]: false }));
    }
  };

  // Função para alternar expansão de categoria
  const toggleCategoryExpansion = (categoryId) => {
    const isExpanded = expandedCategories[categoryId];
    
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !isExpanded
    }));

    // Se está expandindo e ainda não carregou as transações, carrega agora
    if (!isExpanded && !categoryTransactions[categoryId]) {
      loadCategoryTransactions(categoryId);
    }
  };

  // Funções para controle do menu do perfil
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Função para fazer logout
  const handleLogout = () => {
    logout(); // Chama a função de logout do contexto de autenticação
    handleClose();
  };

  // Função para mudar de aba
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Função para abrir o modal de nova transação
  const handleNewTransaction = () => {
    setEditingTransaction(null); // Garante que não está editando
    setShowTransactionForm(true);
  };

  // Função para abrir o modal de edição de transação
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  // Função chamada após salvar uma transação (criar ou editar)
  const handleTransactionSaved = () => {
    loadSummary(); // Atualiza o resumo do dashboard
    // A lista de transações será atualizada automaticamente pelo TransactionList
  };

  // Função para formatar valores em moeda brasileira
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Função para formatar data
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Função para obter texto do tipo de transação
  const getTransactionTypeText = (type) => {
    return type === 1 ? 'Receita' : 'Despesa';
  };

  // Função para obter cor do tipo de transação
  const getTransactionTypeColor = (type) => {
    return type === 1 ? 'success' : 'error';
  };

  return (
    <Box>
      {/* Barra superior da aplicação */}
      <AppBar position="static">
        <Toolbar>
          {/* Logo e título da aplicação */}
          <HomeBudgetLogo size={32} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 1 }}>
            Controle Financeiro
          </Typography>
          
          {/* Menu do perfil */}
          <div>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            
            {/* Menu dropdown do perfil */}
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              {/* Item com nome do usuário */}
              <MenuItem onClick={handleClose}>
                {user?.firstName} {user?.lastName}
              </MenuItem>
              {/* Item de logout */}
              <MenuItem onClick={handleLogout}>Sair</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>

      {/* Abas de navegação */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab icon={<DashboardIcon />} label="Dashboard" />
            <Tab icon={<ReceiptIcon />} label="Transações" />
            <Tab icon={<SavingsIcon />} label="Cofrinhos" />
            <Tab icon={<AssessmentIcon />} label="Relatórios" />
          </Tabs>
        </Container>
      </Box>

      {/* Container principal com as abas */}
      <Container maxWidth="lg">
        
        {/* Conteúdo da aba Dashboard */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            
            {/* Cards de resumo financeiro */}
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Receitas
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main">
                    {formatCurrency(summary.totalIncome)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Despesas
                  </Typography>
                  <Typography variant="h4" component="div" color="error.main">
                    {formatCurrency(summary.totalExpenses)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Saldo
                  </Typography>
                  <Typography 
                    variant="h4" 
                    component="div" 
                    color={summary.balance >= 0 ? "success.main" : "error.main"}
                  >
                    {formatCurrency(summary.balance)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Resumo por categoria */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Resumo por Categoria
                </Typography>
                {summary.categorySummaries.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">
                    Nenhuma transação encontrada. Adicione sua primeira transação!
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {/* Mapeia cada categoria para mostrar seu resumo */}
                    {summary.categorySummaries.map((category) => (
                      <Grid item xs={12} sm={6} md={4} key={category.categoryId}>
                        <Card variant="outlined">
                          <CardContent>
                            {/* Mostra a cor e nome da categoria */}
                            <Box display="flex" alignItems="center" mb={1}>
                              <Box
                                sx={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: '50%',
                                  backgroundColor: category.categoryColor,
                                  mr: 1,
                                }}
                              />
                              <Typography variant="subtitle2">
                                {category.categoryName}
                              </Typography>
                            </Box>
                            {/* Valor total da categoria */}
                            <Typography variant="h6">
                              {formatCurrency(category.totalAmount)}
                            </Typography>
                            {/* Quantidade de transações com botão para expandir */}
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                              <Typography variant="body2" color="textSecondary">
                                {category.transactionCount} transação(ões)
                              </Typography>
                              {category.transactionCount > 0 && (
                                <IconButton 
                                  size="small" 
                                  onClick={() => toggleCategoryExpansion(category.categoryId)}
                                  sx={{ color: 'primary.main' }}
                                >
                                  {expandedCategories[category.categoryId] ? 
                                    <ExpandLessIcon /> : <ExpandMoreIcon />
                                  }
                                </IconButton>
                              )}
                            </Box>
                            
                            {/* Seção expandida com as transações */}
                            <Collapse in={expandedCategories[category.categoryId]}>
                              <Box mt={2}>
                                {loadingTransactions[category.categoryId] ? (
                                  <Typography variant="body2" color="textSecondary">
                                    Carregando transações...
                                  </Typography>
                                ) : (
                                  <List dense>
                                    {categoryTransactions[category.categoryId]?.map((transaction) => (
                                      <ListItem key={transaction.id} sx={{ px: 0 }}>
                                        <ListItemText
                                          primary={
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                              <Typography variant="body2" noWrap>
                                                {transaction.description}
                                              </Typography>
                                              <Chip
                                                label={getTransactionTypeText(transaction.type)}
                                                color={getTransactionTypeColor(transaction.type)}
                                                size="small"
                                                variant="outlined"
                                              />
                                            </Box>
                                          }
                                          secondary={
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                              <Typography variant="caption" color="textSecondary">
                                                {formatDate(transaction.date)}
                                              </Typography>
                                              <Typography 
                                                variant="body2" 
                                                fontWeight="bold"
                                                color={transaction.type === 1 ? 'success.main' : 'error.main'}
                                              >
                                                {formatCurrency(transaction.amount)}
                                              </Typography>
                                            </Box>
                                          }
                                        />
                                      </ListItem>
                                    ))}
                                  </List>
                                )}
                              </Box>
                            </Collapse>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </Grid>

            {/* Ações rápidas */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Ações Rápidas
                </Typography>
                <Grid container spacing={2}>
                  <Grid item>
                    {/* Botão para nova transação - agora funcional */}
                    <Button
                      variant="contained"
                      startIcon={<ReceiptIcon />}
                      onClick={handleNewTransaction}
                    >
                      Nova Transação
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="outlined"
                      startIcon={<CategoryIcon />}
                      onClick={() => alert('Funcionalidade de categorias em desenvolvimento')}
                    >
                      Gerenciar Categorias
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="outlined"
                      startIcon={<AssessmentIcon />}
                      onClick={() => setTabValue(3)} // Vai para a aba de relatórios
                    >
                      Relatórios
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Conteúdo da aba Transações */}
        <TabPanel value={tabValue} index={1}>
          {/* Renderiza o componente TransactionList que criamos */}
          <TransactionList onEdit={handleEditTransaction} />
        </TabPanel>

        {/* Conteúdo da aba Cofrinhos */}
        <TabPanel value={tabValue} index={2}>
          <PiggybanksManager />
        </TabPanel>

        {/* Conteúdo da aba Relatórios */}
        <TabPanel value={tabValue} index={3}>
          <Reports />
        </TabPanel>
      </Container>

      {/* Floating Action Button - botão flutuante para nova transação */}
      <Fab
        color="primary"
        aria-label="add transaction"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={handleNewTransaction}
      >
        <AddIcon />
      </Fab>

      {/* Modal para criar/editar transação */}
      <TransactionForm
        open={showTransactionForm}
        onClose={() => setShowTransactionForm(false)}
        transaction={editingTransaction}
        onSave={handleTransactionSaved}
      />
    </Box>
  );
}

// Exporta o componente para usar em outros arquivos
export default Dashboard;