import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  LightbulbOutlined, 
  RestaurantOutlined,
  VerifiedOutlined,
  CreditCardOutlined,
  AccessTimeOutlined
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import FeatureHighlights from '../components/FeatureHighlights';
import MissionImage from '../Images/Mission.png';

const AboutPage = () => {
  const navigate = useNavigate(); // Hook for navigation

  const handleGetStarted = () => {
    navigate('/'); // Navigate to the home page
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Introduction Section */}
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" component="h1" gutterBottom>
          About CaterConnect
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Your one-stop platform for all catering needs
        </Typography>
        <Typography variant="body1" paragraph sx={{ maxWidth: 800, mx: 'auto' }}>
          Welcome to CaterConnect, where we bring together catering services and customers in one seamless platform. 
          Whether you're planning a wedding, corporate event, or family gathering, we make finding and booking the perfect 
          catering service simple and stress-free.
        </Typography>
      </Box>

      {/* Our Mission Section */}
      <Box mb={8}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h4" component="h2" gutterBottom>
                Our Mission
              </Typography>
              <Typography variant="body1" paragraph>
                At CaterConnect, our mission is to revolutionize how people discover, compare, and book catering services. 
                We believe that finding quality food for your events shouldn't be complicated or time-consuming.
              </Typography>
              <Typography variant="body1" paragraph>
                We strive to create a transparent marketplace where customers can make informed decisions based on real reviews, 
                detailed menus, and clear pricing, while giving caterers the tools they need to showcase their unique offerings.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                sx={{ mt: 2 }}
              >
                Learn More
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardMedia
                component="img"
                image={MissionImage}
                alt="Mission illustration"
                sx={{ 
                  width: '100%',
                  objectFit: 'contain',
                }}
              />
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* How It Works Section */}
      <Box mb={8}>
        <Typography variant="h4" component="h2" gutterBottom textAlign="center" mb={4}>
          How It Works
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  For Customers
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <LightbulbOutlined />
                    </ListItemIcon>
                    <ListItemText primary="Browse caterers by location, cuisine, and budget" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <RestaurantOutlined />
                    </ListItemIcon>
                    <ListItemText primary="Compare menus and read verified reviews" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CreditCardOutlined />
                    </ListItemIcon>
                    <ListItemText primary="Book directly with caterers and arrange payment offline" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  For Caterers
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <LightbulbOutlined />
                    </ListItemIcon>
                    <ListItemText primary="Create a professional profile with photos and menus" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AccessTimeOutlined />
                    </ListItemIcon>
                    <ListItemText primary="Manage availability and bookings in one place" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CreditCardOutlined />
                    </ListItemIcon>
                    <ListItemText primary="Coordinate payments directly with customers" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  For Admins
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <VerifiedOutlined />
                    </ListItemIcon>
                    <ListItemText primary="Verify caterer credentials and food safety" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LightbulbOutlined />
                    </ListItemIcon>
                    <ListItemText primary="Monitor platform activity and resolve issues" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AccessTimeOutlined />
                    </ListItemIcon>
                    <ListItemText primary="Analyze trends and optimize user experience" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Why Choose Us Section */}
      <FeatureHighlights></FeatureHighlights>
      {/* Call to Action */}
      <Box textAlign="center" mt={8} p={4} bgcolor="primary.light" borderRadius={2}>
        <Typography variant="h5" component="p" gutterBottom>
          Ready to find the perfect catering service for your next event?
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          sx={{ mt: 2 }}
          onClick={handleGetStarted} // Add onClick handler
        >
          Get Started Now
        </Button>
      </Box>
    </Container>
  );
};

export default AboutPage;