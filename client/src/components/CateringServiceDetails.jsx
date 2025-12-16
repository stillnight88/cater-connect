import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  CircularProgress, 
  Typography, 
  Button, 
  Box, 
  Container,
  Rating
} from "@mui/material";
import { styled } from '@mui/material/styles';
import FeedbackForm from "./FeedbackForm";
import CateringServiceHeader from "../pages/CateringServiceHeader";
import MenuList from "./MenuList";

// Styled components
const StyledBox = styled(Box)(({ theme }) => ({
  background: '#ffffff',
  borderRadius: 12,
  padding: theme.spacing(3),
  marginTop: theme.spacing(2),
  boxShadow: '0 2px 15px rgba(0,0,0,0.03)',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  fontWeight: 600,
  background: '#1976d2',
  '&:hover': {
    background: '#1565c0',
    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)',
  }
}));

const CateringServiceDetails = () => {
  const { cateringServiceId } = useParams();
  const navigate = useNavigate();
  const [cateringService, setCateringService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshFeedback, setRefreshFeedback] = useState(false);

  useEffect(() => {
    const fetchCateringService = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/catering-services/${cateringServiceId}`);
        setCateringService(response.data);
      } catch (error) {
        console.error("Error fetching catering service:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCateringService();
  }, [cateringServiceId, refreshFeedback]);

  if (loading) {
    return (
      <Container sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={40} thickness={4} />
        </Box>
      </Container>
    );
  }

  if (!cateringService) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography variant="h5" color="text.secondary">
          Catering Service Not Found
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 2 }}>
      <CateringServiceHeader />
      <MenuList />
      <StyledBox>
        {/* Title and Rating */}
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 600, 
            mb: 1.5,
            color: '#1a1a1a'
          }}
        >
          {cateringService.name}
        </Typography>
        
        {cateringService.rating && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating 
              value={cateringService.rating} 
              readOnly 
              precision={0.5} 
              sx={{ color: '#f5a623' }}
            />
            <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
              ({cateringService.reviews?.length || 0})
            </Typography>
          </Box>
        )}

        {/* Description */}
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 3, 
            color: 'text.secondary',
            lineHeight: 1.7,
            fontSize: '1rem'
          }}
        >
          {cateringService.description}
        </Typography>

        {/* Action Button */}
        <StyledButton
          variant="contained"
          onClick={() => navigate(`/book/${cateringServiceId}`)}
        >
          Book Now
        </StyledButton>

        {/* Reviews */}
        <Typography 
          variant="h5" 
          sx={{ 
            mt: 4, 
            mb: 2, 
            fontWeight: 500,
            color: '#1a1a1a'
          }}
        >
          Reviews
        </Typography>
        <FeedbackForm 
          cateringServiceId={cateringServiceId}
          onFeedbackSubmitted={() => setRefreshFeedback(!refreshFeedback)}
        />
      </StyledBox>
    </Container>
  );
};

export default CateringServiceDetails;