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
  Box
} from '@mui/material';
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('currentMonth');
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [incomeByCategory, setIncomeByCategory] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0
  });

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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          📊 Relatórios Financeiros
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Visualize suas finanças através de gráficos e análises detalhadas
        </Typography>
      </Box>

      {/* Cards de resumo */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
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
          <Card>
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
          <Card>
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
          <Card>
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
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Despesas por Categoria
            </Typography>
            {expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
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
            ) : (
              <Box display="flex" alignItems="center" justifyContent="center" height="90%">
                <Typography color="textSecondary">
                  Nenhuma despesa encontrada
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Receitas por Categoria
            </Typography>
            {incomeByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={incomeByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
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
            ) : (
              <Box display="flex" alignItems="center" justifyContent="center" height="90%">
                <Typography color="textSecondary">
                  Nenhuma receita encontrada
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Reports;