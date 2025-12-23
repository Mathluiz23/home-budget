import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

import {
  AccountBalance as PiggyIcon,
  TrendingUp as TrendingUpIcon,
  SwapHoriz as TransferIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
} from '@mui/icons-material';

import { piggybanksService } from '../services/api';

// Componente simplificado para gerenciar cofrinhos
function PiggybanksManager() {
  const [piggybanks, setPiggybanks] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Formulário para criar cofrinho
  const [newPiggybankName, setNewPiggybankName] = useState('');

  // Formulário para transferência
  const [transferForm, setTransferForm] = useState({
    sourcePiggybankId: '',
    destinationPiggybankId: '',
    amount: '',
    description: '',
  });

  useEffect(() => {
    console.log('PiggybanksManager mounted, checking auth...');
    
    // Verificar se o usuário está autenticado
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('Token exists:', !!token);
    console.log('User exists:', !!user);
    
    if (token) {
      console.log('Token preview:', token.substring(0, 20) + '...');
    }
    
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('Loading piggybanks data...');
      setLoading(true);
      const [piggybanksResponse, summaryResponse] = await Promise.all([
        piggybanksService.getAll(),
        piggybanksService.getSummary()
      ]);
      
      console.log('Piggybanks loaded:', piggybanksResponse.data);
      console.log('Summary loaded:', summaryResponse.data);
      
      setPiggybanks(piggybanksResponse.data);
      setSummary(summaryResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setError(`Erro ao carregar dados: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePiggybank = async (piggybankId, piggybankName, amount) => {
    let confirmMessage = `Tem certeza que deseja excluir o cofrinho "${piggybankName}"?`;
    
    if (amount > 0) {
      confirmMessage += `\n\nEste cofrinho possui saldo de ${formatCurrency(amount)}. O saldo será transferido automaticamente para o cofrinho principal.`;
    }

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await piggybanksService.delete(piggybankId);
      setSuccess(response.data?.message || `Cofrinho "${piggybankName}" excluído com sucesso!`);
      await loadData();
    } catch (error) {
      console.error('Error deleting piggybank:', error);
      setError(`Erro ao excluir cofrinho: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleCreatePiggybank = async () => {
    if (!newPiggybankName.trim()) {
      setError('Nome do cofrinho é obrigatório');
      return;
    }

    try {
      console.log('Criando cofrinho:', { name: newPiggybankName.trim() });
      const response = await piggybanksService.create({
        name: newPiggybankName.trim(),
        description: '',
        targetAmount: 0,
        initialAmount: 0,
      });
      console.log('Cofrinho criado:', response.data);

      setShowCreateDialog(false);
      setNewPiggybankName('');
      setSuccess('Cofrinho criado com sucesso!');
      await loadData();
    } catch (error) {
      console.error('Error creating piggybank:', error);
      console.error('Error details:', error.response?.data);
      setError(`Erro ao criar cofrinho: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleTransfer = async () => {
    if (!transferForm.sourcePiggybankId || !transferForm.destinationPiggybankId || !transferForm.amount) {
      setError('Todos os campos são obrigatórios para transferência');
      return;
    }

    if (parseFloat(transferForm.amount) <= 0) {
      setError('Valor deve ser maior que zero');
      return;
    }

    try {
      console.log('Realizando transferência:', {
        sourcePiggybankId: parseInt(transferForm.sourcePiggybankId),
        destinationPiggybankId: parseInt(transferForm.destinationPiggybankId),
        amount: parseFloat(transferForm.amount),
        description: transferForm.description || 'Transferência entre cofrinhos',
      });

      const response = await piggybanksService.transfer({
        sourcePiggybankId: parseInt(transferForm.sourcePiggybankId),
        destinationPiggybankId: parseInt(transferForm.destinationPiggybankId),
        amount: parseFloat(transferForm.amount),
        description: transferForm.description || 'Transferência entre cofrinhos',
      });

      console.log('Transferência realizada:', response.data);

      setShowTransferDialog(false);
      setTransferForm({ sourcePiggybankId: '', destinationPiggybankId: '', amount: '', description: '' });
      setSuccess('Transferência realizada com sucesso!');
      await loadData();
    } catch (error) {
      console.error('Error transferring:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Erro ao realizar transferência');
    }
  };

    const handleCalculateMonthlyBalance = async () => {
    try {
      console.log('Calculando saldo mensal acumulado...');
      const response = await piggybanksService.calculateMonthlyBalance();
      console.log('Resposta do cálculo:', response.data);
      
      const { totalSavings, monthsProcessed } = response.data;
      
      if (totalSavings > 0) {
        setSuccess(
          `Saldo acumulado calculado com sucesso! ` +
          `R$ ${totalSavings?.toFixed(2)} de ${monthsProcessed} meses foram adicionados ao cofrinho principal.`
        );
      } else {
        setSuccess(
          `Cálculo concluído. Nenhum saldo positivo foi encontrado nos ${monthsProcessed} meses analisados.`
        );
      }
      
      await loadData();
    } catch (error) {
      console.error('Error calculating monthly balance:', error);
      console.error('Error details:', error.response?.data);
      setError(`Erro ao calcular saldo mensal: ${error.response?.data?.message || error.message}`);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const mainPiggybank = piggybanks.find(p => p.isMainPiggybank);
  const otherPiggybanks = piggybanks.filter(p => !p.isMainPiggybank);

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Carregando cofrinhos...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Header */}
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <PiggyIcon sx={{ mr: 1 }} />
        Cofrinhos
      </Typography>

      {/* Cofrinho Principal */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <StarIcon sx={{ mr: 1 }} />
                {mainPiggybank ? mainPiggybank.name : 'Cofrinho Principal'}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(summary.mainPiggybankAmount || 0)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Saldo do cofrinho principal
              </Typography>
              {summary.totalAmount !== summary.mainPiggybankAmount && (
                <Typography variant="body2" sx={{ opacity: 0.6, mt: 1 }}>
                  Total em todos os cofrinhos: {formatCurrency(summary.totalAmount || 0)}
                </Typography>
              )}
            </Box>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<TrendingUpIcon />}
              onClick={handleCalculateMonthlyBalance}
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
              }}
            >
              Calcular Saldo Mensal
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Ações principais */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<AddIcon />}
            onClick={() => setShowCreateDialog(true)}
            size="large"
          >
            Criar Novo Cofrinho
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<TransferIcon />}
            onClick={() => setShowTransferDialog(true)}
            disabled={piggybanks.length < 2}
            size="large"
          >
            Transferir Entre Cofrinhos
          </Button>
        </Grid>
      </Grid>

      {/* Lista de outros cofrinhos */}
      {otherPiggybanks.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Meus Cofrinhos ({otherPiggybanks.length})
            </Typography>
            <List>
              {otherPiggybanks.map((piggybank, index) => (
                <ListItem key={piggybank.id} divider={index < otherPiggybanks.length - 1}>
                  <ListItemText
                    primary={piggybank.name}
                    secondary={`Saldo: ${formatCurrency(piggybank.amount)}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleDeletePiggybank(piggybank.id, piggybank.name, piggybank.amount)}
                      color="error"
                      title={`Excluir cofrinho "${piggybank.name}"`}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Dialog para criar cofrinho */}
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Criar Novo Cofrinho</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome do Cofrinho"
            fullWidth
            variant="outlined"
            value={newPiggybankName}
            onChange={(e) => setNewPiggybankName(e.target.value)}
            placeholder="Ex: Viagem, Casa Nova, Emergência..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowCreateDialog(false);
            setNewPiggybankName('');
          }}>
            Cancelar
          </Button>
          <Button onClick={handleCreatePiggybank} variant="contained">
            Criar Cofrinho
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para transferência */}
      <Dialog open={showTransferDialog} onClose={() => setShowTransferDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Transferir Entre Cofrinhos</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense" sx={{ mb: 2, mt: 2 }}>
            <InputLabel>De qual cofrinho</InputLabel>
            <Select
              value={transferForm.sourcePiggybankId}
              onChange={(e) => setTransferForm({ ...transferForm, sourcePiggybankId: e.target.value })}
              label="De qual cofrinho"
            >
              <MenuItem value="">
                <em>Selecione o cofrinho de origem</em>
              </MenuItem>
              {piggybanks.filter(p => p.amount > 0).map(piggybank => (
                <MenuItem key={piggybank.id} value={piggybank.id}>
                  {piggybank.name} - {formatCurrency(piggybank.amount)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Para qual cofrinho</InputLabel>
            <Select
              value={transferForm.destinationPiggybankId}
              onChange={(e) => setTransferForm({ ...transferForm, destinationPiggybankId: e.target.value })}
              label="Para qual cofrinho"
            >
              <MenuItem value="">
                <em>Selecione o cofrinho de destino</em>
              </MenuItem>
              {piggybanks
                .filter(p => p.id.toString() !== transferForm.sourcePiggybankId)
                .map(piggybank => (
                  <MenuItem key={piggybank.id} value={piggybank.id}>
                    {piggybank.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="Valor a transferir"
            fullWidth
            variant="outlined"
            type="number"
            value={transferForm.amount}
            onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
            sx={{ mb: 2 }}
            inputProps={{ min: 0.01, step: 0.01 }}
            placeholder="0,00"
          />

          <TextField
            margin="dense"
            label="Descrição (opcional)"
            fullWidth
            variant="outlined"
            value={transferForm.description}
            onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
            placeholder="Motivo da transferência..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowTransferDialog(false);
            setTransferForm({ sourcePiggybankId: '', destinationPiggybankId: '', amount: '', description: '' });
          }}>
            CANCELAR
          </Button>
          <Button onClick={handleTransfer} variant="contained">
            TRANSFERIR
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PiggybanksManager;