import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { Refresh as RefreshIcon, Email as EmailIcon } from '@mui/icons-material';
import axios from 'axios';

// Define the API base URL (use environment variables in a real app)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminContactView = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    setError('');

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = user?.token;

      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/contact`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setMessages(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch messages. Please check your network or server status.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon color="primary" />
                <Typography variant="h5" component="h1" fontWeight="500">
                  Contact Messages
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                View and manage all incoming contact requests
              </Typography>
            </Box>
            <Tooltip title="Refresh messages">
              <IconButton 
                onClick={fetchMessages}
                disabled={loading}
                color="primary"
                size="small"
                sx={{ bgcolor: 'action.hover', '&:hover': { bgcolor: 'action.selected' } }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Divider />

          {error && (
            <Box sx={{ p: 2 }}>
              <Alert severity="error" variant="filled">{error}</Alert>
            </Box>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={40} />
            </Box>
          ) : messages.length === 0 && !error ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="body1" color="text.secondary">
                No messages found.
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ 
              maxHeight: '70vh',
              width: '100%',
              overflowX: 'auto'
            }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Subject</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper', width: '40%' }}>Message</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {messages.map((msg) => (
                    <TableRow 
                      key={msg._id}
                      hover
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body2" fontWeight="medium">
                            {msg.user?.name || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {msg.user?.email || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={msg.subject} 
                          size="small" 
                          sx={{ 
                            bgcolor: 'primary.light', 
                            color: 'primary.contrastText',
                            fontWeight: 'medium'
                          }} 
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical' 
                        }}>
                          {msg.message}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {formatDate(msg.date)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminContactView;