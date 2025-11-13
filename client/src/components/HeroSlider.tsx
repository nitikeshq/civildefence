import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { HeroBanner } from "@shared/schema";
import trainingImg from "@assets/generated_images/Civil_Defence_training_f1298099.png";
import emergencyImg from "@assets/generated_images/Emergency_response_operations_6dd70f83.png";
import controlRoomImg from "@assets/generated_images/Civil_Defence_control_room_fe29f826.png";

const fallbackSlides = [
  {
    imageUrl: trainingImg,
    titleEn: "Building Resilient Communities",
    subtitleEn: "Professional training for Civil Defence volunteers across Odisha",
    buttonTextEn: "Learn More",
    buttonLink: "#",
    order: 0,
    isActive: true,
  },
  {
    imageUrl: emergencyImg,
    titleEn: "Emergency Response Excellence",
    subtitleEn: "Rapid disaster relief and community protection services",
    buttonTextEn: "Learn More",
    buttonLink: "#",
    order: 1,
    isActive: true,
  },
  {
    imageUrl: controlRoomImg,
    titleEn: "Modern Emergency Operations",
    subtitleEn: "State-of-the-art control room for coordinated response",
    buttonTextEn: "Learn More",
    buttonLink: "#",
    order: 2,
    isActive: true,
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const { data: cmsSlides } = useQuery<HeroBanner[]>({
    queryKey: ['/api/cms/hero-banners'],
  });

  const slides = (cmsSlides && cmsSlides.length > 0) 
    ? cmsSlides.filter(s => s.isActive).sort((a, b) => (a.order || 0) - (b.order || 0))
    : fallbackSlides;

  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [isPaused]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div
      className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      data-testid="container-hero-slider"
    >
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.imageUrl}
            alt={slide.titleEn}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                  {slide.titleEn}
                </h2>
                <p className="text-lg md:text-xl text-white/90 mb-6">
                  {slide.subtitleEn}
                </p>
                {slide.buttonTextEn && (
                  <Button
                    variant="outline"
                    className="bg-white/20 backdrop-blur-sm border-white text-white hover:bg-white hover:text-foreground"
                    data-testid="button-learn-more"
                    onClick={() => slide.buttonLink && window.location.href !== slide.buttonLink && (window.location.href = slide.buttonLink)}
                  >
                    {slide.buttonTextEn}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white"
        onClick={prevSlide}
        data-testid="button-prev-slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white"
        onClick={nextSlide}
        data-testid="button-next-slide"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/50"
            }`}
            onClick={() => setCurrentSlide(index)}
            data-testid={`button-slide-${index}`}
          />
        ))}
      </div>
    </div>
  );
}
