import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'LOAD_USER':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'STOP_LOADING':
      return { ...state, loading: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          const user = JSON.parse(userStr);
          dispatch({
            type: 'LOAD_USER',
            payload: { token, user },
          });
        } else {
          dispatch({ type: 'STOP_LOADING' });
        }
      } catch (error) {
        console.error('Erro ao carregar dados de autenticação:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: 'STOP_LOADING' });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await authService.login(credentials);
      const { token, email, firstName, lastName } = response.data;
      
      const user = { email, firstName, lastName };
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
      
      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      dispatch({ type: 'LOGIN_FAILURE' });
      
      let message = 'Erro ao fazer login';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.status === 400) {
        message = 'Email ou senha inválidos';
      } else if (error.response?.status === 500) {
        message = 'Erro interno do servidor. Tente novamente mais tarde.';
      }
      
      return {
        success: false,
        message: message,
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Iniciando registro...', { email: userData.email });
      console.log('🌐 API URL:', process.env.REACT_APP_API_URL || 'http://localhost:5021/api');
      
      dispatch({ type: 'LOGIN_START' });
      const response = await authService.register(userData);
      
      console.log('✅ Resposta da API:', response.status, response.data);
      
      const { token, email, firstName, lastName } = response.data;
      
      const user = { email, firstName, lastName };
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erro completo no registro:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method,
        }
      });
      
      dispatch({ type: 'LOGIN_FAILURE' });
      
      let message = 'Erro ao registrar usuário';
      
      if (!error.response) {
        // Erro de conexão/rede
        message = 'Não foi possível conectar ao servidor. Verifique sua conexão ou tente novamente.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.status === 400) {
        if (error.response?.data?.errors) {
          // Erros de validação do ModelState
          const errors = Object.values(error.response.data.errors).flat();
          message = errors.join('. ');
        } else {
          message = 'Dados inválidos. Verifique os campos e tente novamente.';
        }
      } else if (error.response?.status === 409) {
        message = 'Este email já está cadastrado. Tente fazer login ou use outro email.';
      } else if (error.response?.status === 500) {
        message = 'Erro interno do servidor. Tente novamente mais tarde.';
      }
      
      return {
        success: false,
        message: message,
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}