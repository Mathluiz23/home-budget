// Este é o componente TransactionList - responsável por exibir uma lista de transações
// É um componente React que usa Material-UI para interface e se conecta com nossa API

import React, { useState, useEffect } from 'react';
import {
  Box,           // Container flexível para layout
  Paper,         // Componente com elevação (sombra) do Material-UI
  Typography,    // Para textos estilizados
  Table,         // Tabela do Material-UI
  TableBody,     // Corpo da tabela
  TableCell,     // Células da tabela
  TableContainer,// Container da tabela
  TableHead,     // Cabeçalho da tabela
  TableRow,      // Linhas da tabela
  IconButton,    // Botões com ícones
  Chip,          // Componente de "tag" para mostrar categorias
  Alert,         // Para exibir mensagens de erro
  CircularProgress, // Indicador de carregamento
  Button,        // Botões normais
  TextField,     // Campos de texto
  Grid,          // Sistema de grid para layout
  MenuItem,      // Item de menu/select
  Select,        // Seletor dropdown
  FormControl,   // Container para controles de formulário
  InputLabel,    // Labels para campos
} from '@mui/material';

// Importando ícones do Material-UI para usar nos botões
import {
  Edit as EditIcon,      // Ícone de editar
  Delete as DeleteIcon,  // Ícone de deletar
  Add as AddIcon,       // Ícone de adicionar
} from '@mui/icons-material';

// Importando nossos serviços da API que criamos anteriormente
import { transactionsService, categoriesService } from '../services/api';

// Função principal do componente TransactionList
// Este componente será usado para exibir todas as transações do usuário
// Props que recebe:
// - onEdit: função chamada quando o usuário clica para editar uma transação
const TransactionList = ({ onEdit }) => {
  // Estados do React - variáveis que o React monitora para re-renderizar quando mudarem
  const [transactions, setTransactions] = useState([]);     // Lista de transações
  const [categories, setCategories] = useState([]);         // Lista de categorias
  const [loading, setLoading] = useState(true);             // Se está carregando dados
  const [error, setError] = useState('');                   // Mensagem de erro
  const [page, setPage] = useState(1);                      // Página atual (paginação)
  const [totalCount, setTotalCount] = useState(0);          // Total de transações
  
  // Estados para filtros - permite ao usuário filtrar as transações
  const [filters, setFilters] = useState({
    startDate: '',     // Data inicial do filtro
    endDate: '',       // Data final do filtro
    categoryId: '',    // Categoria selecionada
    type: '',          // Tipo: receita ou despesa
  });

  // Função para buscar as categorias da API
  const loadCategories = async () => {
    try {
      // Chama nossa API para buscar categorias
      const response = await categoriesService.getAll();
      setCategories(response.data);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      // Se não conseguir carregar categorias, não é crítico, então não mostra erro
    }
  };

  // useEffect é um hook do React que executa código quando o componente é montado
  // ou quando certas dependências mudam
  useEffect(() => {
    // Função que busca as transações da API
    const loadData = async () => {
      try {
        setLoading(true); // Ativa o indicador de carregamento
        
        // Monta os parâmetros para enviar para a API
        const params = {
          page,                    // Número da página
          pageSize: 10,           // Quantas transações por página
          ...filters,             // Inclui todos os filtros do estado
        };

        // Chama nossa API para buscar as transações
        // transactionsService.getAll foi definido em services/api.js
        const response = await transactionsService.getAll(params);
        
        // Atualiza o estado com as transações recebidas
        setTransactions(response.data);
        
        // Pega o total de transações do cabeçalho da resposta HTTP
        const total = response.headers['x-total-count'];
        if (total) {
          setTotalCount(parseInt(total));
        }
        
        setError(''); // Limpa qualquer erro anterior
      } catch (err) {
        // Se deu erro, mostra uma mensagem para o usuário
        console.error('Erro ao carregar transações:', err);
        setError('Erro ao carregar transações. Tente novamente.');
      } finally {
        setLoading(false); // Desativa o indicador de carregamento
      }
    };

    loadData();
    // Função que busca as categorias para os filtros
    loadCategories();
  }, [page, filters]); // Executa novamente quando page ou filters mudarem

  // Função separada para recarregar transações (usada em outras operações)
  const loadTransactions = async () => {
    try {
      setLoading(true);
      
      const params = {
        page,
        pageSize: 10,
        ...filters,
      };

      const response = await transactionsService.getAll(params);
      setTransactions(response.data);
      
      const total = response.headers['x-total-count'];
      if (total) {
        setTotalCount(parseInt(total));
      }
      
      setError('');
    } catch (err) {
      console.error('Erro ao carregar transações:', err);
      setError('Erro ao carregar transações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para deletar uma transação
  const handleDelete = async (transactionId) => {
    // Pergunta se o usuário tem certeza antes de deletar
    if (!window.confirm('Tem certeza que deseja excluir esta transação?')) {
      return;
    }

    try {
      // Chama nossa API para deletar a transação
      await transactionsService.delete(transactionId);
      // Recarrega a lista de transações para refletir a exclusão
      await loadTransactions();
    } catch (err) {
      console.error('Erro ao excluir transação:', err);
      setError('Erro ao excluir transação. Tente novamente.');
    }
  };

  // Função para quando o usuário muda algum filtro
  const handleFilterChange = (field, value) => {
    // Atualiza o estado dos filtros
    setFilters(prev => ({
      ...prev,        // Mantém os filtros anteriores
      [field]: value, // Atualiza apenas o campo que mudou
    }));
    setPage(1); // Volta para a primeira página quando muda filtro
  };

  // Função para limpar todos os filtros
  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      categoryId: '',
      type: '',
    });
    setPage(1);
  };

  // Função para formatar valores em moeda brasileira
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Função para formatar datas no padrão brasileiro
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Função para determinar a cor do chip baseado no tipo da transação
  const getTransactionTypeColor = (type) => {
    return type === 1 ? 'success' : 'error'; // 1 = Income, 2 = Expense
  };

  // Função para traduzir o tipo da transação
  const getTransactionTypeText = (type) => {
    return type === 1 ? 'Receita' : 'Despesa'; // 1 = Income, 2 = Expense
  };

  // Se está carregando, mostra um indicador de progresso
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Carregando transações...
        </Typography>
      </Box>
    );
  }

  // Renderização do componente - o que aparece na tela
  return (
    <Box>
      {/* Título da página */}
      <Typography variant="h4" component="h1" gutterBottom>
        Minhas Transações
      </Typography>

      {/* Seção de filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        
        {/* Grid para organizar os campos de filtro */}
        <Grid container spacing={2}>
          {/* Campo para data inicial */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Data Inicial"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Campo para data final */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Data Final"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Seletor de categoria */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={filters.categoryId}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                label="Categoria"
              >
                <MenuItem value="">Todas as categorias</MenuItem>
                {/* Mapeia todas as categorias para criar as opções */}
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Seletor de tipo */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                label="Tipo"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value={1}>Receita</MenuItem>
                <MenuItem value={2}>Despesa</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Botão para limpar filtros */}
          <Grid item xs={12}>
            <Button onClick={clearFilters} variant="outlined">
              Limpar Filtros
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Botão para adicionar nova transação */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => onEdit && onEdit(null)} // Chama onEdit com null para criar nova transação
        >
          Nova Transação
        </Button>
      </Box>

      {/* Se houver erro, mostra uma mensagem */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabela com as transações */}
      <TableContainer component={Paper}>
        <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
          <colgroup>
            <col style={{ width: '10%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '15%' }} />
          </colgroup>
          {/* Cabeçalho da tabela */}
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Data</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Descrição</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Categoria</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Tipo</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Valor</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          
          {/* Corpo da tabela */}
          <TableBody>
            {/* Se não há transações, mostra mensagem */}
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="h6" color="text.secondary">
                    Nenhuma transação encontrada
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              // Se há transações, mapeia cada uma para uma linha da tabela
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  {/* Coluna da data */}
                  <TableCell align="center">
                    {formatDate(transaction.date)}
                  </TableCell>
                  
                  {/* Coluna da descrição */}
                  <TableCell align="center">
                    <Typography variant="body2">
                      {transaction.description}
                    </Typography>
                  </TableCell>
                  
                  {/* Coluna da categoria com chip colorido */}
                  <TableCell align="center">
                    <Chip
                      label={transaction.categoryName}
                      style={{
                        backgroundColor: transaction.categoryColor,
                        color: 'white',
                      }}
                      size="small"
                    />
                  </TableCell>
                  
                  {/* Coluna do tipo com chip colorido */}
                  <TableCell align="center">
                    <Chip
                      label={getTransactionTypeText(transaction.type)}
                      color={getTransactionTypeColor(transaction.type)}
                      size="small"
                    />
                  </TableCell>
                  
                  {/* Coluna do valor formatado */}
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      color={transaction.type === 1 ? 'success.main' : 'error.main'}
                      fontWeight="bold"
                      align="center"
                    >
                      {formatCurrency(transaction.amount)}
                    </Typography>
                  </TableCell>
                  
                  {/* Coluna das ações (editar/excluir) */}
                  <TableCell align="center">
                    {/* Botão de editar */}
                    <IconButton
                      size="small"
                      onClick={() => onEdit && onEdit(transaction)} // Chama onEdit passando a transação
                    >
                      <EditIcon />
                    </IconButton>
                    
                    {/* Botão de excluir */}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(transaction.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Informações de paginação */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Total: {totalCount} transações
        </Typography>
        
        {/* TODO: Implementar controles de paginação */}
        <Typography variant="body2" color="text.secondary">
          Página {page} de {Math.ceil(totalCount / 10)}
        </Typography>
      </Box>
    </Box>
  );
};

// Exporta o componente para poder ser usado em outros arquivos
export default TransactionList;