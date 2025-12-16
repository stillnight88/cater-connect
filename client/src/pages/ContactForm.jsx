import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Alert,
  ThemeProvider,
  createTheme,
  alpha,
  Divider,
  Slide,
  Snackbar
} from '@mui/material';
import { Send as SendIcon, Chat as ChatIcon } from '@mui/icons-material';
import axios from 'axios';

// Define the API base URL (use environment variables in a real app)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'; // Default to localhost for dev

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
});

const ContactForm = () => {
  const [formData, setFormData] = useState({ subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = user?.token;

      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/contact`, // Use the defined base URL
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess('Message sent successfully!');
      setFormData({ subject: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please check your network or server status.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess('');
    setError('');
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 2, 
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            background: 'linear-gradient(145deg, #ffffff 0%, #f5f7ff 100%)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ChatIcon sx={{ mr: 1.5, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" color="primary.main">
              Contact Admin
            </Typography>
          </Box>
          
          <Typography 
            variant="subtitle1" 
            color="text.secondary" 
            sx={{ mb: 3, fontWeight: 400 }}
          >
            Send a message to the administration team
          </Typography>
          
          <Divider sx={{ mb: 3 }} />

          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ mt: 2 }}
          >
            <TextField
              fullWidth
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined"
              disabled={loading}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                  },
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined"
              multiline
              rows={5}
              disabled={loading}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                  },
                }
              }}
              placeholder="How can we help you today?"
            />
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ 
                mt: 2, 
                py: 1.5, 
                fontWeight: 500,
                boxShadow: '0 4px 12px rgba(63, 81, 181, 0.2)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(63, 81, 181, 0.3)',
                }
              }}
              disabled={loading}
              endIcon={loading ? undefined : <SendIcon />}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Message'}
            </Button>
          </Box>
        </Paper>
      </Container>
      
      <Snackbar 
        open={!!error || !!success} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        TransitionComponent={Slide}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={error ? "error" : "success"} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default ContactForm;