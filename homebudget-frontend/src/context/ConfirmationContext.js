import React, { createContext, useCallback, useContext, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Slide,
  Box,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const ConfirmationContext = createContext();

const SlideTransition = React.forwardRef(function SlideTransition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

export const ConfirmationProvider = ({ children }) => {
  const [confirmationState, setConfirmationState] = useState({ open: false });

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmationState({
        open: true,
        title: options.title || 'Confirmação',
        description: options.description || 'Tem certeza que deseja continuar?',
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        confirmColor: options.confirmColor || 'primary',
        resolve,
      });
    });
  }, []);

  const handleClose = (result) => {
    if (confirmationState.resolve) {
      confirmationState.resolve(result);
    }
    setConfirmationState((prev) => ({ ...prev, open: false, resolve: null }));
  };

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      <Dialog
        open={confirmationState.open}
        onClose={() => handleClose(false)}
        TransitionComponent={SlideTransition}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <WarningAmberIcon color="warning" />
            <Typography variant="h6">{confirmationState.title}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary">
            {confirmationState.description}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => handleClose(false)}>{confirmationState.cancelText}</Button>
          <Button
            onClick={() => handleClose(true)}
            variant="contained"
            color={confirmationState.confirmColor}
          >
            {confirmationState.confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmationContext.Provider>
  );
};

export const useConfirmation = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirmation must be used within ConfirmationProvider');
  }
  return context;
};
