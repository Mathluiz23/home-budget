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
  Dialog,          // Diálogo modal
  DialogTitle,     // Título do diálogo
  DialogContent,   // Conteúdo do diálogo
  DialogActions,   // Ações do diálogo
  FormControl,     // Controle de formulário
  InputLabel,      // Label de input
  Select,          // Componente select
  TextField,       // Campo de texto
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
  PictureAsPdf as PdfIcon,           // Ícone de PDF
  ChevronLeft as ChevronLeftIcon,    // Ícone de navegação para esquerda
  ChevronRight as ChevronRightIcon,  // Ícone de navegação para direita
} from '@mui/icons-material';

// Importando nosso contexto de autenticação
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

// Importando nossos serviços da API
import { transactionsService } from '../services/api';
import pdfExportService from '../services/pdfExport';

// Importando os componentes que criamos
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import HomeBudgetLogo from '../components/HomeBudgetLogo';
import PiggybanksManager from '../components/PiggybanksManager';
import CategoryManager from '../components/CategoryManager';
import Reports from './Reports';

const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const DASHBOARD_PDF_CHART_WIDTH = 90;
const QUICK_ACTION_BUTTON_SX = {
  height: 48,
  borderRadius: 2,
  fontWeight: 600,
  letterSpacing: 0.5,
  justifyContent: 'center',
  gap: 1,
};

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
  const { showNotification } = useNotification();
  const theme = useTheme();
  const isCompactTabs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmallHeader = useMediaQuery(theme.breakpoints.down('md'));
  const totalTabs = 4;
  const maxTabIndex = totalTabs - 1;

  const renderTabContent = (IconComponent, label) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isCompactTabs ? 'column' : 'row',
        alignItems: 'center',
        gap: isCompactTabs ? 0.5 : 1,
      }}
    >
      <IconComponent fontSize={isCompactTabs ? 'small' : 'medium'} />
      <Typography
        variant={isCompactTabs ? 'caption' : 'body2'}
        sx={{ fontWeight: isCompactTabs ? 600 : 500 }}
      >
        {label}
      </Typography>
    </Box>
  );
  
  // Estados para controlar menus e modais
  const [anchorEl, setAnchorEl] = useState(null);                 // Para o menu do perfil
  const [tabValue, setTabValue] = useState(0);                    // Aba ativa
  const [showTransactionForm, setShowTransactionForm] = useState(false); // Se o modal está aberto
  const [editingTransaction, setEditingTransaction] = useState(null);     // Transação sendo editada
  const [showCategoryManager, setShowCategoryManager] = useState(false);  // Para o gerenciador de categorias
  const [showExportDialog, setShowExportDialog] = useState(false);        // Diálogo de exportação PDF
  const [exportFilter, setExportFilter] = useState({
    period: 'all',
    month: '',
    year: new Date().getFullYear(),
  });
  
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
  const [exportChartData, setExportChartData] = useState({ expenses: [], income: [] });

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

  const handleTabNavigation = (direction) => {
    setTabValue((prev) => {
      const nextValue = prev + direction;
      if (nextValue < 0) return 0;
      if (nextValue > maxTabIndex) return maxTabIndex;
      return nextValue;
    });
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

  const waitForChartRender = () =>
    new Promise((resolve) => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 300); // garante que os gráficos invisíveis sejam renderizados
      });
    });

  const renderHiddenLegend = (data) => {
    const totalValue = data.reduce((sum, item) => sum + (item.value || 0), 0) || 1;
    return (
      <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.35 }}>
        {data.map((item, index) => {
          const color = PIE_COLORS[index % PIE_COLORS.length];
          const percentage = ((item.value || 0) / totalValue) * 100;
          return (
            <Box
              key={`${item.name}-${index}`}
              sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
                <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.6rem' }}>
                  {item.name}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.6rem' }}>
                {`${formatCurrency(item.value || 0)} (${percentage.toFixed(0)}%)`}
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  };

  // Função para exportar relatório em PDF
  const handleExportPDF = async () => {
    setShowExportDialog(true);
  };

  const handleConfirmExport = async () => {
    try {
      console.log('Iniciando exportação de PDF...');
      console.log('Usuário:', user);
      console.log('Filtro:', exportFilter);
      
      let startDate = null;
      let endDate = null;
      let periodText = 'Todos os períodos';
      
      // Aplicar filtros baseados na seleção
      if (exportFilter.period === 'month' && exportFilter.month && exportFilter.year) {
        const monthNumber = parseInt(exportFilter.month);
        startDate = new Date(exportFilter.year, monthNumber - 1, 1).toISOString();
        endDate = new Date(exportFilter.year, monthNumber, 0, 23, 59, 59).toISOString();
        
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        periodText = `${monthNames[monthNumber - 1]} de ${exportFilter.year}`;
      } else if (exportFilter.period === 'year' && exportFilter.year) {
        startDate = new Date(exportFilter.year, 0, 1).toISOString();
        endDate = new Date(exportFilter.year, 11, 31, 23, 59, 59).toISOString();
        periodText = `Ano de ${exportFilter.year}`;
      }
      
      // Busca transações com filtros
      const params = { pageSize: 10000 };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await transactionsService.getAll(params);
      console.log('Transações recebidas:', response.data?.length);
      
      // Calcula resumo baseado nas transações filtradas
      const filteredTransactions = response.data || [];
      const totalIncome = filteredTransactions
        .filter(t => t.type === 1)
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = filteredTransactions
        .filter(t => t.type === 2)
        .reduce((sum, t) => sum + t.amount, 0);
      
      // Agrupa por categoria
      const categorySummaryMap = {};
      filteredTransactions.forEach(t => {
        const key = t.categoryName || 'Sem categoria';
        if (!categorySummaryMap[key]) {
          categorySummaryMap[key] = {
            categoryName: key,
            transactionCount: 0,
            totalAmount: 0,
            incomeTotal: 0,
            expenseTotal: 0,
          };
        }
        const entry = categorySummaryMap[key];
        entry.transactionCount++;
        entry.totalAmount += t.amount;
        if (t.type === 1) {
          entry.incomeTotal += t.amount;
        } else {
          entry.expenseTotal += t.amount;
        }
      });
      const categorySummaries = Object.values(categorySummaryMap);
      const expenseChartData = categorySummaries
        .map((c) => ({
          name: c.categoryName,
          value: c.expenseTotal || (c.totalAmount < 0 ? Math.abs(c.totalAmount) : 0),
        }))
        .filter((item) => item.value > 0);

      const incomeChartData = categorySummaries
        .map((c) => ({
          name: c.categoryName,
          value: c.incomeTotal || (c.totalAmount > 0 ? c.totalAmount : 0),
        }))
        .filter((item) => item.value > 0);

      setExportChartData({ expenses: expenseChartData, income: incomeChartData });
      
      const reportData = {
        summary: {
          totalIncome,
          totalExpenses,
          balance: totalIncome - totalExpenses,
        },
        transactions: filteredTransactions,
        categorySummaries,
        period: periodText,
      };
      
      console.log('Dados do relatório preparados:', reportData);
      const chartIds = [];
      if (expenseChartData.length > 0) {
        chartIds.push({
          id: 'dashboard-expenses-chart',
          title: 'Despesas por Categoria',
          width: DASHBOARD_PDF_CHART_WIDTH,
        });
      }
      if (incomeChartData.length > 0) {
        chartIds.push({
          id: 'dashboard-income-chart',
          title: 'Receitas por Categoria',
          width: DASHBOARD_PDF_CHART_WIDTH,
        });
      }

      if (chartIds.length > 0) {
        await waitForChartRender();
      }

      await pdfExportService.exportReportWithCharts(
        reportData,
        user,
        chartIds,
        { title: 'Relatório Financeiro' }
      );
      console.log('PDF exportado com sucesso!');
      
      showNotification('Relatório PDF gerado com sucesso!', { severity: 'success' });
      setShowExportDialog(false);
    } catch (error) {
      console.error('Erro detalhado ao exportar PDF:', error);
      console.error('Stack trace:', error.stack);
      const message = `Erro ao gerar relatório PDF: ${error.message}`;
      showNotification(message, { severity: 'error' });
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Barra superior da aplicação */}
      <AppBar
        position="static"
        sx={{
          background: 'linear-gradient(90deg, #083472 0%, #0C4AA5 55%, #0F5FCF 100%)',
        }}
      >
        <Toolbar
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: isSmallHeader ? 1 : 0,
            gap: isSmallHeader ? 1 : 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HomeBudgetLogo size={32} showText={!isSmallHeader} />
            {!isSmallHeader && (
              <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
                Controle Financeiro
              </Typography>
            )}
          </Box>
          {isSmallHeader && (
            <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                HomeBudget
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.8rem', display: 'block', mt: 0.25 }}>
                Controle Financeiro
              </Typography>
            </Box>
          )}
          
          {/* Menu do perfil */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexGrow: isSmallHeader ? 0 : 1 }}>
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
          </Box>
        </Toolbar>
      </AppBar>

      {/* Abas de navegação */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Container maxWidth="lg" disableGutters>
          <Box sx={{ display: 'flex', alignItems: 'center', px: { xs: 0, md: 0 } }}>
            {isCompactTabs && (
              <IconButton
                aria-label="Ver aba anterior"
                size="small"
                sx={{ mr: 0.5 }}
                onClick={() => handleTabNavigation(-1)}
                disabled={tabValue === 0}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
            )}
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons={isCompactTabs ? false : 'auto'}
              sx={{ flex: 1, '& .MuiTab-root': { minWidth: isCompactTabs ? 80 : 140 } }}
            >
              <Tab aria-label="Dashboard" label={renderTabContent(DashboardIcon, 'Dashboard')} />
              <Tab aria-label="Transações" label={renderTabContent(ReceiptIcon, 'Transações')} />
              <Tab aria-label="Cofrinhos" label={renderTabContent(SavingsIcon, 'Cofrinhos')} />
              <Tab aria-label="Relatórios" label={renderTabContent(AssessmentIcon, 'Relatórios')} />
            </Tabs>
            {isCompactTabs && (
              <IconButton
                aria-label="Ver próxima aba"
                size="small"
                sx={{ ml: 0.5 }}
                onClick={() => handleTabNavigation(1)}
                disabled={tabValue === maxTabIndex}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
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
                  <Grid item xs={12} sm={6} md={3}>
                    {/* Botão para nova transação - agora funcional */}
                    <Button
                      variant="contained"
                      startIcon={<ReceiptIcon />}
                      onClick={handleNewTransaction}
                      fullWidth
                      sx={QUICK_ACTION_BUTTON_SX}
                    >
                      Nova Transação
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="outlined"
                      startIcon={<CategoryIcon />}
                      onClick={() => setShowCategoryManager(true)}
                      fullWidth
                      sx={QUICK_ACTION_BUTTON_SX}
                    >
                      Gerenciar Categorias
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="outlined"
                      startIcon={<AssessmentIcon />}
                      onClick={() => setTabValue(3)} // Vai para a aba de relatórios
                      fullWidth
                      sx={QUICK_ACTION_BUTTON_SX}
                    >
                      Relatórios
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<PdfIcon />}
                      onClick={handleExportPDF}
                      fullWidth
                      sx={QUICK_ACTION_BUTTON_SX}
                    >
                      Exportar PDF
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

      {/* Modal para gerenciar categorias */}
      <CategoryManager
        open={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
        onCategoryChange={() => {
          // Recarrega o summary quando as categorias mudam
          loadSummary();
        }}
      />

      {/* Diálogo de filtro de exportação PDF */}
      <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Exportar Relatório PDF</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Período</InputLabel>
              <Select
                value={exportFilter.period}
                label="Período"
                onChange={(e) => setExportFilter({ ...exportFilter, period: e.target.value })}
              >
                <MenuItem value="all">Todos os períodos</MenuItem>
                <MenuItem value="month">Mês específico</MenuItem>
                <MenuItem value="year">Ano completo</MenuItem>
              </Select>
            </FormControl>

            {exportFilter.period === 'month' && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Mês</InputLabel>
                  <Select
                    value={exportFilter.month}
                    label="Mês"
                    onChange={(e) => setExportFilter({ ...exportFilter, month: e.target.value })}
                  >
                    <MenuItem value="1">Janeiro</MenuItem>
                    <MenuItem value="2">Fevereiro</MenuItem>
                    <MenuItem value="3">Março</MenuItem>
                    <MenuItem value="4">Abril</MenuItem>
                    <MenuItem value="5">Maio</MenuItem>
                    <MenuItem value="6">Junho</MenuItem>
                    <MenuItem value="7">Julho</MenuItem>
                    <MenuItem value="8">Agosto</MenuItem>
                    <MenuItem value="9">Setembro</MenuItem>
                    <MenuItem value="10">Outubro</MenuItem>
                    <MenuItem value="11">Novembro</MenuItem>
                    <MenuItem value="12">Dezembro</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  type="number"
                  label="Ano"
                  value={exportFilter.year}
                  onChange={(e) => setExportFilter({ ...exportFilter, year: parseInt(e.target.value) })}
                />
              </>
            )}

            {exportFilter.period === 'year' && (
              <TextField
                fullWidth
                type="number"
                label="Ano"
                value={exportFilter.year}
                onChange={(e) => setExportFilter({ ...exportFilter, year: parseInt(e.target.value) })}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleConfirmExport} 
            variant="contained" 
            color="primary"
            startIcon={<PdfIcon />}
          >
            Exportar
          </Button>
        </DialogActions>
      </Dialog>
      {/* Hidden charts rendered off-screen for PDF capture */}
      {(exportChartData.expenses.length > 0 || exportChartData.income.length > 0) && (
        <Box
          sx={{
            position: 'fixed',
            top: 14,
            left: 14,
            opacity: 0,
            pointerEvents: 'none',
            zIndex: -1,
            width: 210,
          }}
        >
          {exportChartData.expenses.length > 0 && (
            <Box
              id="dashboard-expenses-chart"
              sx={{
                width: 185,
                p: 0.9,
                bgcolor: '#fff',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.85,
              }}
            >
              <Box sx={{ width: '100%', height: 120 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={exportChartData.expenses}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={50}
                      labelLine={false}
                      isAnimationActive={false}
                    >
                      {exportChartData.expenses.map((entry, index) => (
                        <Cell key={`exp-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              {renderHiddenLegend(exportChartData.expenses)}
            </Box>
          )}
          {exportChartData.income.length > 0 && (
            <Box
              id="dashboard-income-chart"
              sx={{
                width: 185,
                p: 0.9,
                mt: 2.2,
                bgcolor: '#fff',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.85,
              }}
            >
              <Box sx={{ width: '100%', height: 120 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={exportChartData.income}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={50}
                      labelLine={false}
                      isAnimationActive={false}
                    >
                      {exportChartData.income.map((entry, index) => (
                        <Cell key={`inc-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              {renderHiddenLegend(exportChartData.income)}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

// Exporta o componente para usar em outros arquivos
export default Dashboard;