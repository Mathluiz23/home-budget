import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Grid,
  Paper,
  Typography,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { categoriesService } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useConfirmation } from '../context/ConfirmationContext';

// Paleta de cores pré-definidas para facilitar a escolha
const colorPalette = [
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Vermelho', value: '#EF4444' },
  { name: 'Amarelo', value: '#F59E0B' },
  { name: 'Roxo', value: '#8B5CF6' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Ciano', value: '#06B6D4' },
  { name: 'Laranja', value: '#F97316' },
  { name: 'Cinza', value: '#6B7280' },
  { name: 'Índigo', value: '#6366F1' },
];

function CategoryManager({ open, onClose, onCategoryChange }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const { showNotification } = useNotification();
  const { confirm } = useConfirmation();
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: 'category',
  });

  // Carrega as categorias quando o diálogo abre
  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  const loadCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await categoriesService.getAll();
      setCategories(response.data || []);
    } catch (err) {
      setError('Erro ao carregar categorias: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (editingCategory) {
        await categoriesService.update(editingCategory.id, formData);
        showNotification('Categoria atualizada com sucesso!', { severity: 'success' });
      } else {
        await categoriesService.create(formData);
        showNotification('Categoria criada com sucesso!', { severity: 'success' });
      }
      
      await loadCategories();
      resetForm();
      
      // Notifica o componente pai que as categorias mudaram
      if (onCategoryChange) {
        onCategoryChange();
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Erro ao salvar categoria';
      setError(message);
      showNotification(message, { severity: 'error' });
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color,
      icon: category.icon,
    });
    setShowForm(true);
  };

  const handleDelete = async (category) => {
    const confirmed = await confirm({
      title: 'Excluir categoria',
      description: `Tem certeza que deseja excluir "${category.name}"? Essa ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      confirmColor: 'error',
    });

    if (!confirmed) {
      return;
    }

    setError('');
    try {
      await categoriesService.delete(category.id);
      await loadCategories();
      showNotification('Categoria excluída com sucesso!', { severity: 'success' });
      
      if (onCategoryChange) {
        onCategoryChange();
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Erro ao excluir categoria';
      setError(message);
      showNotification(message, { severity: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6',
      icon: 'category',
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <CategoryIcon />
            <span>Gerenciar Categorias</span>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {!showForm ? (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Minhas Categorias</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowForm(true)}
              >
                Nova Categoria
              </Button>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {categories.map((category) => (
                  <React.Fragment key={category.id}>
                    <ListItem
                      secondaryAction={
                        !category.isDefault && (
                          <Box>
                            <IconButton
                              edge="end"
                              aria-label="edit"
                              onClick={() => handleEdit(category)}
                              sx={{ mr: 1 }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => handleDelete(category)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        )
                      }
                    >
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: category.color,
                          mr: 2,
                        }}
                      />
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            {category.name}
                            {category.isDefault && (
                              <Chip label="Padrão" size="small" color="default" />
                            )}
                          </Box>
                        }
                        secondary={category.description}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" mb={2}>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </Typography>

            <TextField
              fullWidth
              label="Nome"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              margin="normal"
              inputProps={{ maxLength: 100 }}
            />

            <TextField
              fullWidth
              label="Descrição (opcional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={2}
              inputProps={{ maxLength: 255 }}
            />

            <Box mt={3} mb={2}>
              <Typography variant="subtitle2" gutterBottom>
                Escolha uma cor:
              </Typography>
              <Grid container spacing={1}>
                {colorPalette.map((color) => (
                  <Grid item key={color.value}>
                    <Paper
                      elevation={formData.color === color.value ? 8 : 1}
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: color.value,
                        cursor: 'pointer',
                        border: formData.color === color.value ? '3px solid #000' : 'none',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        },
                      }}
                      onClick={() => setFormData({ ...formData, color: color.value })}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box display="flex" gap={2} mt={3}>
              <Button
                variant="outlined"
                onClick={resetForm}
                fullWidth
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
              >
                {editingCategory ? 'Salvar' : 'Criar'}
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}

export default CategoryManager;
