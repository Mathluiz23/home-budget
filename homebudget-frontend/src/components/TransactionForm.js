// TransactionForm - Componente para criar e editar transações
// Este é um modal (janela sobreposta) que permite adicionar ou editar uma transação

import React, { useState, useEffect } from 'react';
import {
  Dialog,          // Modal do Material-UI
  DialogTitle,     // Título do modal
  DialogContent,   // Conteúdo do modal
  DialogActions,   // Área dos botões do modal
  TextField,       // Campos de texto
  Button,          // Botões
  FormControl,     // Container para controles de formulário
  InputLabel,      // Labels para campos
  Select,          // Seletor dropdown
  MenuItem,        // Itens do seletor
  Grid,            // Sistema de grid para layout
  Alert,           // Para mostrar mensagens de erro
  InputAdornment,  // Para adicionar ícones nos campos
} from '@mui/material';

// Importando ícones
import {
  AttachMoney as MoneyIcon,     // Ícone de dinheiro
  Description as DescIcon,      // Ícone de descrição
} from '@mui/icons-material';

// Importando nossos serviços da API
import { transactionsService, categoriesService } from '../services/api';

// Componente principal TransactionForm
// Props que este componente recebe:
// - open: se o modal está aberto
// - onClose: função chamada quando o modal é fechado
// - transaction: transação para editar (null se for criação)
// - onSave: função chamada após salvar com sucesso
const TransactionForm = ({ open, onClose, transaction, onSave }) => {
  // Estados do formulário - cada campo tem seu próprio estado
  const [formData, setFormData] = useState({
    description: '',    // Descrição da transação
    amount: '',        // Valor da transação
    date: '',          // Data da transação
    categoryId: '',    // ID da categoria selecionada
    type: 'Expense',   // Tipo: 'Income' (receita) ou 'Expense' (despesa) - será convertido para número
  });

  // Estados de controle
  const [categories, setCategories] = useState([]);  // Lista de categorias disponíveis
  const [loading, setLoading] = useState(false);     // Se está salvando
  const [error, setError] = useState('');            // Mensagem de erro
  const [categoriesLoading, setCategoriesLoading] = useState(false); // Se está carregando categorias

  // useEffect para carregar categorias quando o modal abrir
  useEffect(() => {
    if (open) {
      loadCategories(); // Carrega as categorias da API
      
      // Se há uma transação para editar, preenche o formulário com seus dados
      if (transaction) {
        setFormData({
          description: transaction.description,
          amount: transaction.amount.toString(), // Converte para string para o TextField
          date: transaction.date.split('T')[0],  // Pega apenas a parte da data (YYYY-MM-DD)
          categoryId: transaction.categoryId,
          type: transaction.type === 1 ? 'Income' : 'Expense', // Converte número para string
        });
      } else {
        // Se é uma nova transação, limpa o formulário
        setFormData({
          description: '',
          amount: '',
          date: new Date().toISOString().split('T')[0], // Data de hoje por padrão
          categoryId: '',
          type: 'Expense',
        });
      }
    }
  }, [open, transaction]); // Executa quando open ou transaction mudarem

  // Função para buscar categorias da API
  const loadCategories = async () => {
    try {
      setCategoriesLoading(true); // Ativa indicador de carregamento
      
      let response;
      try {
        // Tenta buscar categorias do usuário (requer autenticação)
        response = await categoriesService.getAll();
      } catch (authError) {
        // Se der erro de autenticação, busca apenas as categorias padrão
        console.log('Buscando categorias padrão como fallback');
        response = await categoriesService.getDefault();
      }
      
      console.log('Categorias carregadas:', response.data); // Log para debug
      setCategories(response.data);
      
      // Se não há categorias, mostra uma mensagem específica
      if (response.data.length === 0) {
        setError('Nenhuma categoria encontrada. Verifique se o backend está funcionando.');
      }
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      setError('Erro ao carregar categorias. Verifique sua conexão e tente novamente.');
    } finally {
      setCategoriesLoading(false); // Desativa indicador de carregamento
    }
  };

  // Função chamada quando o usuário digita em um campo
  const handleChange = (field, value) => {
    // Atualiza apenas o campo que foi modificado
    setFormData(prev => ({
      ...prev,        // Mantém os outros campos
      [field]: value, // Atualiza o campo específico
    }));
    
    // Limpa erro se houver
    if (error) {
      setError('');
    }
  };

  // Função para validar os dados do formulário
  const validateForm = () => {
    // Verifica se todos os campos obrigatórios estão preenchidos
    if (!formData.description.trim()) {
      setError('Descrição é obrigatória');
      return false;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Valor deve ser maior que zero');
      return false;
    }

    if (!formData.date) {
      setError('Data é obrigatória');
      return false;
    }

    if (!formData.categoryId) {
      setError('Categoria é obrigatória');
      return false;
    }

    return true; // Todos os dados estão válidos
  };

  // Função chamada quando o usuário clica em "Salvar"
  const handleSubmit = async () => {
    // Primeiro valida o formulário
    if (!validateForm()) {
      return;
    }

    setLoading(true); // Ativa o indicador de carregamento
    
    try {
      // Prepara os dados para enviar para a API
      const dataToSend = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),        // Converte para número
        date: new Date(formData.date).toISOString(), // Converte para formato ISO
        categoryId: parseInt(formData.categoryId),   // Converte para número
        type: formData.type === 'Income' ? 1 : 2,   // Converte string para número (1=Income, 2=Expense)
      };

      console.log('Dados sendo enviados para a API:', dataToSend);
      console.log('Token de autenticação presente:', !!localStorage.getItem('token'));

      // Decide se vai criar ou atualizar baseado se há uma transação existente
      if (transaction) {
        // Está editando - chama o método de atualização
        console.log('Atualizando transação ID:', transaction.id);
        await transactionsService.update(transaction.id, dataToSend);
      } else {
        // Está criando - chama o método de criação
        console.log('Criando nova transação');
        await transactionsService.create(dataToSend);
      }

      // Se chegou aqui, deu certo - chama a função onSave passada como prop
      onSave();
      
      // Fecha o modal
      onClose();
      
    } catch (err) {
      // Se deu erro, mostra uma mensagem para o usuário
      console.error('Erro ao salvar transação:', err);
      console.error('Detalhes do erro:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        headers: err.response?.headers
      });
      
      // Verifica se a API retornou alguma mensagem específica
      if (err.response?.data?.message) {
        setError(`Erro: ${err.response.data.message}`);
      } else if (err.response?.status === 401) {
        setError('Erro de autenticação. Faça login novamente.');
      } else if (err.response?.status === 400) {
        setError(`Dados inválidos: ${JSON.stringify(err.response.data)}`);
      } else if (err.message) {
        setError(`Erro: ${err.message}`);
      } else {
        setError('Erro ao salvar transação. Tente novamente.');
      }
    } finally {
      setLoading(false); // Desativa o indicador de carregamento
    }
  };

  // Função para formatar o valor enquanto o usuário digita
  const handleAmountChange = (e) => {
    const value = e.target.value;
    
    // Remove caracteres que não são números ou ponto/vírgula
    const numericValue = value.replace(/[^\d.,]/g, '');
    
    // Substitui vírgula por ponto para compatibilidade com JavaScript
    const formattedValue = numericValue.replace(',', '.');
    
    handleChange('amount', formattedValue);
  };

  // Renderização do componente
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm"      // Tamanho médio para o modal
      fullWidth          // Usar toda a largura disponível
    >
      {/* Título do modal - muda baseado se é criação ou edição */}
      <DialogTitle>
        {transaction ? 'Editar Transação' : 'Nova Transação'}
      </DialogTitle>

      {/* Conteúdo do modal */}
      <DialogContent>
        {/* Se houver erro, mostra uma mensagem */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Grid para organizar os campos do formulário */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          
          {/* Campo de descrição */}
          <Grid item xs={12}>
            <TextField
              label="Descrição"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              fullWidth
              required         // Campo obrigatório
              placeholder="Ex: Compra no supermercado"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DescIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Campo de valor */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Valor"
              value={formData.amount}
              onChange={handleAmountChange}
              fullWidth
              required
              type="number"
              inputProps={{ 
                min: "0.01", 
                step: "0.01" 
              }}
              placeholder="0,00"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MoneyIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Campo de data */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Data"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              fullWidth
              required
              InputLabelProps={{
                shrink: true, // Faz o label ficar sempre acima do campo
              }}
            />
          </Grid>

          {/* Seletor de categoria */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={formData.categoryId}
                onChange={(e) => handleChange('categoryId', e.target.value)}
                label="Categoria"
                disabled={categoriesLoading}
              >
                {/* Se está carregando, mostra mensagem */}
                {categoriesLoading ? (
                  <MenuItem disabled>Carregando categorias...</MenuItem>
                ) : categories.length === 0 ? (
                  <MenuItem disabled>Nenhuma categoria encontrada</MenuItem>
                ) : (
                  // Mapeia todas as categorias para criar as opções
                  categories.map((category) => (
                    <MenuItem 
                      key={category.id} 
                      value={category.id}
                      sx={{
                        // Mostra a cor da categoria no menu
                        '&::before': {
                          content: '""',
                          display: 'inline-block',
                          width: 12,
                          height: 12,
                          backgroundColor: category.color,
                          borderRadius: '50%',
                          marginRight: 1,
                        }
                      }}
                    >
                      {category.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>

          {/* Seletor de tipo (Receita/Despesa) */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                label="Tipo"
              >
                <MenuItem value="Income">Receita</MenuItem>
                <MenuItem value="Expense">Despesa</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>

      {/* Área dos botões */}
      <DialogActions sx={{ p: 2 }}>
        {/* Botão Cancelar */}
        <Button 
          onClick={onClose}
          disabled={loading} // Desabilita se estiver salvando
        >
          Cancelar
        </Button>
        
        {/* Botão Salvar */}
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={loading} // Desabilita se estiver salvando
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Exporta o componente para usar em outros arquivos
export default TransactionForm;