import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { 
  Box, 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Stack,
  Divider,
  CircularProgress,
  Chip,
  Fade,
  Container,
  Avatar,
  Tooltip
} from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const CateringServiceHeader = () => {
  const { cateringServiceId } = useParams();
  const [cateringData, setCateringData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCateringService = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/catering-services/${cateringServiceId}`);
        setCateringData(response.data);
      } catch (error) {
        console.error("Error fetching catering service:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCateringService();
  }, [cateringServiceId]);

  if (loading) return (
    <Box sx={{ 
      minHeight: '50vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <CircularProgress size={60} thickness={4} color="primary" />
    </Box>
  );
  
  if (!cateringData) return (
    <Container maxWidth="md">
      <Typography 
        variant="h6" 
        color="error" 
        align="center" 
        sx={{ 
          p: 4, 
          bgcolor: 'grey.100', 
          borderRadius: 2,
          mt: 4
        }}
      >
        Catering Service Not Found
      </Typography>
    </Container>
  );

  return (
    <Container maxWidth="lg">
      <Fade in={true} timeout={800}>
        <Card 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            mt: 6,
            mb: 8,
            boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
            borderRadius: 4,
            overflow: 'hidden',
            bgcolor: 'background.paper',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-6px)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
            }
          }}
        >
          <CardMedia
            component="img"
            sx={{ 
              width: { xs: '100%', md: 340 },
              height: { xs: 280, md: '100%' },
              objectFit: 'cover',
              filter: 'brightness(0.95)',
              transition: 'all 0.3s ease',
              '&:hover': {
                filter: 'brightness(1)',
              }
            }}
            image={`http://localhost:5000${cateringData.image}` || "https://via.placeholder.com/340"}
            alt={`${cateringData.name} catering`}
          />
          
          <CardContent 
            sx={{ 
              flex: 1, 
              p: { xs: 3, md: 4 },
              display: 'flex',
              flexDirection: 'column',
              gap: 3
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar 
                sx={{ 
                  bgcolor: 'primary.main',
                  width: 56,
                  height: 56,
                  fontSize: '1.5rem'
                }}
              >
                {cateringData.name[0]}
              </Avatar>
              <Box>
                <Typography 
                  component="h1" 
                  variant="h4" 
                  fontWeight={700} 
                  color="text.primary"
                >
                  {cateringData.name}
                </Typography>
                <Chip 
                  label={`Managed by ${cateringData.manager?.name || "Unknown"}`}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ 
                    mt: 1,
                    borderRadius: 1,
                    fontWeight: 500,
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText'
                  }}
                />
              </Box>
            </Stack>

            <Stack 
              spacing={2} 
              sx={{ 
                p: 3,
                bgcolor: 'grey.50',
                borderRadius: 2,
                transition: 'all 0.3s',
                '&:hover': {
                  bgcolor: 'grey.100',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }
              }}
            >
              <Tooltip title="Call us" arrow>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <PhoneIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      '&:hover': { color: 'primary.main' },
                      transition: 'color 0.2s'
                    }}
                  >
                    {cateringData.manager?.phoneNumber || cateringData.phone || "N/A"}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title="Email us" arrow>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <EmailIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                  <Typography 
                    variant="body1" 
                    component="a" 
                    href={`mailto:${cateringData.manager?.email || cateringData.email}`}
                    sx={{ 
                      textDecoration: 'none',
                      color: 'text.primary',
                      '&:hover': { color: 'primary.main' },
                      transition: 'color 0.2s'
                    }}
                  >
                    {cateringData.manager?.email || cateringData.email || "N/A"}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title="Find us" arrow>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <LocationOnIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                  <Typography variant="body1">
                    {cateringData.location || "Location not specified"}
                  </Typography>
                </Box>
              </Tooltip>
            </Stack>

            <Divider sx={{ borderColor: 'grey.200', opacity: 0.7 }} />

            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                lineHeight: 1.8,
                fontSize: '1.05rem'
              }}
            >
              {cateringData.description}
            </Typography>
          </CardContent>
        </Card>
      </Fade>
    </Container>
  );
};

export default CateringServiceHeader;