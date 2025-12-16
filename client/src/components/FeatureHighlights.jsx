import React from "react";
import { Box, Container, Grid, Typography, Card, CardContent, IconButton } from "@mui/material";
import { styled } from "@mui/system";
import { FaUtensils, FaCalendarAlt, FaShieldAlt, FaStar } from "react-icons/fa";

const FeatureCard = styled(Card)(({ theme }) => ({
  height: "100%",
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)"
  },
  background: "#ffffff",
  borderRadius: "16px"
}));

const IconWrapper = styled(IconButton)(({ theme }) => ({
  background: "rgba(255, 126, 95, 0.1)",
  marginBottom: "20px",
  "&:hover": {
    background: "rgba(255, 126, 95, 0.2)"
  }
}));

const StyledSection = styled(Box)(({ theme }) => ({
  padding: "80px 0",
  background: "#fafafa"
}));

const FeatureHighlights = () => {
  const features = [
    {
      icon: <FaUtensils size={24} color="#FF7E5F" />,
      title: "Wide Variety of Services",
      description: "From intimate gatherings to grand celebrations, we offer diverse cuisine options tailored to your event."
    },
    {
      icon: <FaCalendarAlt size={24} color="#FF7E5F" />,
      title: "Easy Booking Process",
      description: "Simple and streamlined reservation system that puts you in control of your event planning."
    },
    {
      icon: <FaShieldAlt size={24} color="#FF7E5F" />,
      title: "Trusted Catering Partners",
      description: "Connect with reliable caterers and arrange payments directly with confidence."
    },
    {
      icon: <FaStar size={24} color="#FF7E5F" />,
      title: "Customer Reviews & Ratings",
      description: "Join thousands of satisfied customers who trust us with their special occasions."
    }
  ];

  return (
    <StyledSection>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          component="h2"
          align="center"
          gutterBottom
          sx={{
            mb: 6,
            fontWeight: 700,
            color: "#2D3748"
          }}
        >
          Why Choose Our Catering Services?
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <FeatureCard>
                <CardContent sx={{ textAlign: "center", padding: "32px 24px" }}>
                  <IconWrapper
                    aria-label={feature.title}
                    size="large"
                  >
                    {feature.icon}
                  </IconWrapper>
                  <Typography
                    variant="h5"
                    component="h3"
                    gutterBottom
                    sx={{ fontWeight: 600, color: "#2D3748" }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ lineHeight: 1.7 }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </StyledSection>
  );
};

export default FeatureHighlights;