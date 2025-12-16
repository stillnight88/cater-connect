import React from "react";
import { Container, Grid, Typography, Link, IconButton, Box, Tooltip } from "@mui/material";
import { styled } from "@mui/system";
import { FaFacebook, FaTwitter, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt, FaLinkedin } from "react-icons/fa";
import logo from "../Images/logo.webp";

// Define elegant neutral colors
const COLORS = {
  background: "#1C1B1B", // Deep Espresso
  backgroundLight: "#2A2929", // Slightly lighter espresso tone
  accent: "#A67C52", // Bronze Gold
  accentLight: "#D7B899", // Soft Light Gold
  text: "#F5EFE6", // Soft Ivory
  textSecondary: "#C2B8B2" // Warm grayish beige
};



const StyledFooter = styled("footer")({
  background: COLORS.background,
  color: COLORS.text,
  padding: "48px 0 32px",
  marginTop: "auto",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "3px",
    background: COLORS.accent,
  }
});

const FooterLink = styled(Link)({
  color: COLORS.text,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateX(5px)",
    color: COLORS.accentLight
  }
});

const SocialIcon = styled(IconButton)({
  color: COLORS.text,
  marginRight: "12px",
  transition: "all 0.3s ease",
  backgroundColor: "rgba(255, 255, 255, 0.07)",
  padding: "10px",
  "&:hover": {
    transform: "translateY(-4px)",
    backgroundColor: COLORS.accent,
    color: "#fff"
  }
});

const FooterSection = styled(Box)({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  "& h6": {
    position: "relative",
    paddingBottom: "12px",
    marginBottom: "20px",
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "30px",
      height: "2px",
      backgroundColor: COLORS.accent,
      borderRadius: "10px"
    }
  }
});

const ContactItem = styled(Box)({
  display: "flex",
  alignItems: "flex-start",
  marginBottom: "12px",
  "& svg": {
    marginRight: "12px",
    marginTop: "4px",
    color: COLORS.accent
  }
});

const Logo = styled("img")({
  width: "150px",
  height: "auto",
  marginBottom: "16px",
  filter: "brightness(0.9) contrast(1.1)",
  transition: "opacity 0.3s ease",
  "&:hover": {
    opacity: 0.9
  }
});

const Divider = styled(Box)({
  height: "1px",
  backgroundColor: "rgba(255,255,255,0.1)",
  margin: "32px 0 24px",
  width: "100%"
});

const Footer = () => {
  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Our Services", path: "/services" },
    { name: "Contact Us", path: "/contact" }
  ];

  const legalLinks = [
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
    { name: "Cookie Policy", path: "/cookies" }
  ];

  return (
    <StyledFooter>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} sm={6} md={3}>
            <FooterSection>
              <Logo 
                src={logo} 
                alt="Company Logo"
              />
              <Typography variant="body2" sx={{ mb: 2.5, lineHeight: 1.8, opacity: 0.85 }}>
              Effortlessly discover, book, and manage top-notch catering services for every occasion
              </Typography>
            </FooterSection>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <FooterSection>
              <Typography variant="h6" fontWeight="500">Quick Links</Typography>
              {quickLinks.map((link) => (
                <Box key={link.name} sx={{ mb: 1.2 }}>
                  <FooterLink href={link.path}>
                    <Box component="span" sx={{ mr: 1, color: COLORS.accent }}>›</Box> {link.name}
                  </FooterLink>
                </Box>
              ))}
            </FooterSection>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={6} md={3}>
            <FooterSection>
              <Typography variant="h6" fontWeight="500">Contact Us</Typography>
              <ContactItem>
                <FaPhone />
                <FooterLink href="tel:+1234567890">+91 9322246245</FooterLink>
              </ContactItem>
              <ContactItem>
                <FaEnvelope />
                <FooterLink href="mailto:info@company.com">abc@gmail.com</FooterLink>
              </ContactItem>
              <ContactItem>
                <FaMapMarkerAlt />
                <Typography variant="body2" sx={{ lineHeight: 1.7, opacity: 0.85 }}>
                Mangalore ,Karnataka 
                  <br />
                  India
                </Typography>
              </ContactItem>
            </FooterSection>
          </Grid>

          {/* Social & Legal */}
          <Grid item xs={12} sm={6} md={3}>
            <FooterSection>
              <Typography variant="h6" fontWeight="500">Connect With Us</Typography>
              <Box sx={{ mb: 3, display: "flex" }}>
                <Tooltip title="Facebook" arrow>
                  <SocialIcon aria-label="facebook" href="https://facebook.com" target="_blank">
                    <FaFacebook />
                  </SocialIcon>
                </Tooltip>
                <Tooltip title="Twitter" arrow>
                  <SocialIcon aria-label="twitter" href="https://twitter.com" target="_blank">
                    <FaTwitter />
                  </SocialIcon>
                </Tooltip>
                <Tooltip title="Instagram" arrow>
                  <SocialIcon aria-label="instagram" href="https://instagram.com" target="_blank">
                    <FaInstagram />
                  </SocialIcon>
                </Tooltip>
                <Tooltip title="LinkedIn" arrow>
                  <SocialIcon aria-label="linkedin" href="https://linkedin.com" target="_blank">
                    <FaLinkedin />
                  </SocialIcon>
                </Tooltip>
              </Box>
              <Typography variant="body2" sx={{ mb: 2, fontWeight: "500" }}>
                Subscribe to our newsletter
              </Typography>
              {legalLinks.map((link) => (
                <Box key={link.name} sx={{ mb: 1.2 }}>
                  <FooterLink href={link.path} target="_blank">
                    <Box component="span" sx={{ mr: 1, color: COLORS.accent }}>›</Box> {link.name}
                  </FooterLink>
                </Box>
              ))}
            </FooterSection>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Divider />
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            © {new Date().getFullYear()} CaterConnect. All rights reserved.
          </Typography>
          {/* <Typography variant="body2" sx={{ opacity: 0.7, mt: { xs: 1, sm: 0 } }}>
            Designed with ♥ for better businesses
          </Typography> */}
        </Box>
      </Container>
    </StyledFooter>
  );
};

export default Footer;