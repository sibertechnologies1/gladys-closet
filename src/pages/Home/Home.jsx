import Navbar from "../../components/Navbar/Navbar";
import HomeHeroSection from "../../components/HomeHeroSection/HomeHeroSection";
import Footer from "../../components/Footer/Footer";
import FeaturedCategories from "../../components/FeaturedCategories/FeaturedCategories";
import ProductGrid from "../../components/ProductGrid/ProductGrid";

export default function Home() {
  return (
    <div>
      <Navbar />
      <HomeHeroSection />
      <FeaturedCategories />
      <ProductGrid />
      <Footer />
    </div>
  );
}