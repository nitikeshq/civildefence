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

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { UserPlus, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <AccessibilityBar />
      <Header />
      <Navigation />
      <main id="main-content">
        <HeroSlider />
        
        {/* Volunteer Registration CTA */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Join as a Volunteer
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Be a part of Odisha's Civil Defence force. Register now to serve your community during emergencies.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/volunteer/register" asChild>
                  <Button size="lg" className="text-lg px-8" data-testid="button-register-volunteer">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Register as Volunteer
                  </Button>
                </Link>
                <Link href="/signin" asChild>
                  <Button size="lg" variant="outline" className="text-lg px-8" data-testid="button-admin-login">
                    <Users className="mr-2 h-5 w-5" />
                    Admin Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

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
