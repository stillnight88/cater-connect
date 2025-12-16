import React, { useRef } from "react";
import HS from "../Images/HS.webp";

const HeroSection = () => {
  const searchSectionRef = useRef(null);

  const handleScroll = () => {
    if (searchSectionRef.current) {
      searchSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <div
        style={{
          position: "relative",
          height: "100vh", // Changed from minHeight to height
          width: "100%", // Added width 100%
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: `url(${HS})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat", // Added to prevent repeating
          color: "white",
          textAlign: "center",
          margin: 0, // Added to remove any default margins
          padding: 0, // Added to remove any default padding
          overflow: "hidden", // Added to prevent scrollbars
        }}
      >
        {/* Darker overlay for better text visibility */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          }}
        ></div>

        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: "45rem",
            padding: "0 2rem",
          }}
        >
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: 700,
              marginBottom: "1.5rem",
              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
              animation: "fadeInUp 0.5s ease-out",
            }}
          >
            Explore the Future
          </h1>

          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 300,
              marginBottom: "2.5rem",
              animation: "fadeInUp 0.5s ease-out 0.2s",
              animationFillMode: "backwards",
              lineHeight: "1.5",
            }}
          >
            Find the Best Catering Services for Your Events!
          </h2>

          <button
            style={{
              backgroundColor: "#D4A373", // Original color
              color: "white",
              padding: "0.75rem 2.5rem",
              fontSize: "1.25rem",
              fontWeight: "500",
              borderRadius: "0.5rem",
              transition: "all 0.3s ease",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
            }}
            onClick={handleScroll}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.05)";
              e.target.style.backgroundColor = "#C69366"; // Darker shade of original color
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.backgroundColor = "#D4A373"; // Back to original color
            }}
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Reference SearchBar Section */}
      <div ref={searchSectionRef}>
        {/* SearchBar Component (Import it here if not already in App.js) */}
      </div>

      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          /* Reset body and html to ensure full coverage */
          html, body {
            margin: 0;
            padding: 0;
            overflow-x: hidden;
            width: 100%;
            height: 100%;
          }
          
          @media (max-width: 768px) {
            h1 {
              font-size: 2.25rem !important;
            }
            h2 {
              font-size: 1.25rem !important;
            }
          }
        `}
      </style>
    </>
  );
};

export default HeroSection;