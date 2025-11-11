import AccessibilityBar from "@/components/AccessibilityBar";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import HeroSlider from "@/components/HeroSlider";
import QuickStats from "@/components/QuickStats";
import KeyPersonnel from "@/components/KeyPersonnel";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import Gallery from "@/components/Gallery";
import VideoSection from "@/components/VideoSection";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <AccessibilityBar />
      <Header />
      <Navigation />
      <main id="main-content">
        <HeroSlider />
        <QuickStats />
        <KeyPersonnel />
        <AboutSection />
        <ServicesSection />
        <Gallery />
        <VideoSection />
      </main>
      <Footer />
    </div>
  );
}
