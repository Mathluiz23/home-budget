import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { PictureAsPdf as PdfIcon } from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { transactionsService } from '../services/api';
import pdfExportService from '../services/pdfExport';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Reports = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('currentMonth');
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [incomeByCategory, setIncomeByCategory] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0
  });
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const pieOuterRadius = isSmallScreen ? 110 : 130;
  const pieChartHeight = isSmallScreen ? 320 : 360;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await transactionsService.getAll({
        pageSize: 1000
      });

      const transactions = response.data;
      
      // Processar dados por categoria
      const expensesByCategory = {};
      const incomeByCategory = {};
      
      let totalIncome = 0;
      let totalExpenses = 0;

      transactions.forEach(transaction => {
        const categoryName = transaction.categoryName;
        const amount = transaction.amount;
        
        if (transaction.type === 2) { // Despesa
          totalExpenses += amount;
          if (expensesByCategory[categoryName]) {
            expensesByCategory[categoryName] += amount;
          } else {
            expensesByCategory[categoryName] = amount;
          }
        } else { // Receita
          totalIncome += amount;
          if (incomeByCategory[categoryName]) {
            incomeByCategory[categoryName] += amount;
          } else {
            incomeByCategory[categoryName] = amount;
          }
        }
      });

      // Converter para formato dos gráficos
      const expensesData = Object.entries(expensesByCategory).map(([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2))
      }));

      const incomeData = Object.entries(incomeByCategory).map(([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2))
      }));

      setExpensesByCategory(expensesData);
      setIncomeByCategory(incomeData);
      setAllTransactions(transactions);
      setSummaryData({
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        transactionCount: transactions.length
      });

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados dos relatórios.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDFWithCharts = async () => {
    try {
      const categorySummaryMap = {};
      allTransactions.forEach(t => {
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

      const reportData = {
        summary: {
          totalIncome: summaryData.totalIncome,
          totalExpenses: summaryData.totalExpenses,
          balance: summaryData.balance,
        },
        transactions: allTransactions,
        categorySummaries,
        period: 'Todos os períodos',
      };

      const chartIds = [
        { id: 'reports-expenses-chart-export', title: 'Despesas por Categoria', width: 120 },
        { id: 'reports-income-chart-export', title: 'Receitas por Categoria', width: 120 },
      ];

      await pdfExportService.exportReportWithCharts(
        reportData,
        user,
        chartIds,
        { title: 'Relatórios Financeiros' }
      );
      showNotification('Relatório com gráficos exportado com sucesso!', { severity: 'success' });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      showNotification('Erro ao gerar relatório PDF. Tente novamente.', { severity: 'error' });
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1, border: '1px solid #ccc' }}>
          <Typography variant="body2" fontWeight="bold">
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography 
              key={index} 
              variant="body2" 
              sx={{ color: entry.color }}
            >
              {entry.name}: {formatCurrency(entry.value)}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  const renderLegendItems = (data) => {
    if (!data || data.length === 0) return null;
    const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
    return (
      <Box
        sx={{
          mt: 2,
          display: 'flex',
          flexDirection: isSmallScreen ? 'column' : 'row',
          flexWrap: isSmallScreen ? 'nowrap' : 'wrap',
          gap: isSmallScreen ? 1.5 : 3,
        }}
      >
        {data.map((item, index) => {
          const color = COLORS[index % COLORS.length];
          const percentage = ((item.value / total) * 100).toFixed(0);
          return (
            <Box
              key={`${item.name}-${index}`}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.85rem',
                minWidth: isSmallScreen ? 'auto' : '45%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: color }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {item.name}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {percentage}%
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  };

  const renderExportLegend = (data) => {
    if (!data || data.length === 0) return null;
    const total = data.reduce((sum, item) => sum + (item.value || 0), 0) || 1;
    return (
      <Box sx={{ mt: 0.75, display: 'flex', flexDirection: 'column', gap: 0.4 }}>
        {data.map((item, index) => {
          const color = COLORS[index % COLORS.length];
          const percentage = ((item.value || 0) / total) * 100;
          return (
            <Box
              key={`export-legend-${item.name}-${index}`}
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Carregando relatórios...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      disableGutters={isSmallScreen}
      sx={{
        mt: { xs: 2, sm: 4 },
        mb: { xs: 3, sm: 4 },
        px: { xs: isSmallScreen ? 1.5 : 2.5, sm: 3 },
      }}
    >
      <Box
        mb={4}
        display="flex"
        justifyContent="space-between"
        alignItems={isSmallScreen ? 'flex-start' : 'center'}
        flexDirection={isSmallScreen ? 'column' : 'row'}
        gap={isSmallScreen ? 2 : 0}
      >
        <Box>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontSize: { xs: '2rem', sm: '2.5rem' }, lineHeight: 1.1 }}
          >
            📊 Relatórios Financeiros
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Visualize suas finanças através de gráficos e análises detalhadas
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PdfIcon />}
          onClick={handleExportPDFWithCharts}
          sx={{ alignSelf: isSmallScreen ? 'stretch' : 'center' }}
        >
          Exportar PDF
        </Button>
      </Box>

      {/* Cards de resumo */}
      <Grid container spacing={{ xs: 2, md: 3 }} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total de Receitas
              </Typography>
              <Typography variant="h5" sx={{ color: 'success.main' }}>
                {formatCurrency(summaryData.totalIncome)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total de Despesas
              </Typography>
              <Typography variant="h5" sx={{ color: 'error.main' }}>
                {formatCurrency(summaryData.totalExpenses)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Saldo
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: summaryData.balance >= 0 ? 'success.main' : 'error.main' 
                }}
              >
                {formatCurrency(summaryData.balance)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total de Transações
              </Typography>
              <Typography variant="h5">
                {summaryData.transactionCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos de pizza */}
      <Grid container spacing={{ xs: 2, sm: 3 }} mb={4}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: { xs: 2, sm: 3 },
              minHeight: isSmallScreen ? 420 : 440,
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Despesas por Categoria
            </Typography>
            {expensesByCategory.length > 0 ? (
              <Box
                id="expenses-pie-chart"
                sx={{
                  height: pieChartHeight,
                  '& .recharts-pie-label-text': {
                    fontSize: isSmallScreen ? '0.7rem' : '0.85rem',
                    fontWeight: 600,
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={!isSmallScreen ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%` : undefined}
                      outerRadius={pieOuterRadius}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box display="flex" alignItems="center" justifyContent="center" height={isSmallScreen ? 340 : 360}>
                <Typography color="textSecondary">
                  Nenhuma despesa encontrada
                </Typography>
              </Box>
            )}
            {renderLegendItems(expensesByCategory)}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: { xs: 2, sm: 3 },
              minHeight: isSmallScreen ? 420 : 440,
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Receitas por Categoria
            </Typography>
            {incomeByCategory.length > 0 ? (
              <Box
                id="income-pie-chart"
                sx={{
                  height: pieChartHeight,
                  '& .recharts-pie-label-text': {
                    fontSize: isSmallScreen ? '0.7rem' : '0.85rem',
                    fontWeight: 600,
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={!isSmallScreen ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%` : undefined}
                      outerRadius={pieOuterRadius}
                    fill="#82ca9d"
                    dataKey="value"
                  >
                    {incomeByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box display="flex" alignItems="center" justifyContent="center" height={isSmallScreen ? 340 : 360}>
                <Typography color="textSecondary">
                  Nenhuma receita encontrada
                </Typography>
              </Box>
            )}
            {renderLegendItems(incomeByCategory)}
          </Paper>
        </Grid>
      </Grid>

      {(expensesByCategory.length > 0 || incomeByCategory.length > 0) && (
        <Box
          sx={{
            position: 'fixed',
            top: 18,
            left: 18,
            opacity: 0,
            pointerEvents: 'none',
            zIndex: -1,
            width: 210,
          }}
        >
          {expensesByCategory.length > 0 && (
            <Box
              id="reports-expenses-chart-export"
              sx={{
                width: 180,
                p: 0.75,
                bgcolor: '#fff',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.75,
              }}
            >
              <Box sx={{ width: '100%', height: 120 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={50}
                      labelLine={false}
                      isAnimationActive={false}
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`rep-exp-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              {renderExportLegend(expensesByCategory)}
            </Box>
          )}
          {incomeByCategory.length > 0 && (
            <Box
              id="reports-income-chart-export"
              sx={{
                width: 180,
                p: 0.75,
                mt: 2,
                bgcolor: '#fff',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.75,
              }}
            >
              <Box sx={{ width: '100%', height: 120 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeByCategory}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={50}
                      labelLine={false}
                      isAnimationActive={false}
                    >
                      {incomeByCategory.map((entry, index) => (
                        <Cell key={`rep-inc-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              {renderExportLegend(incomeByCategory)}
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
};

export default Reports;