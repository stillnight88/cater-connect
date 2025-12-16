import React from "react";
import HeroSection from "../../components/HeroSection";
import FeatureHighlights from "../../components/FeatureHighlights";
import Footer from "../../components/Footer";
import SearchBar from "../../components/SearchBar";

export default function UserDashboard(props, ref) {
  return (
    <>
    <HeroSection />
    <SearchBar ref={ref} />
    <FeatureHighlights/>
   <Footer/>
   </>
  )
}
