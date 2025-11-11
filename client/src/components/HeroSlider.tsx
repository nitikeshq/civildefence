import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import trainingImg from "@assets/generated_images/Civil_Defence_training_f1298099.png";
import emergencyImg from "@assets/generated_images/Emergency_response_operations_6dd70f83.png";
import controlRoomImg from "@assets/generated_images/Civil_Defence_control_room_fe29f826.png";

const slides = [
  {
    image: trainingImg,
    title: "Building Resilient Communities",
    subtitle: "Professional training for Civil Defence volunteers across Odisha",
  },
  {
    image: emergencyImg,
    title: "Emergency Response Excellence",
    subtitle: "Rapid disaster relief and community protection services",
  },
  {
    image: controlRoomImg,
    title: "Modern Emergency Operations",
    subtitle: "State-of-the-art control room for coordinated response",
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                  {slide.title}
                </h2>
                <p className="text-lg md:text-xl text-white/90 mb-6">
                  {slide.subtitle}
                </p>
                <Button
                  variant="outline"
                  className="bg-white/20 backdrop-blur-sm border-white text-white hover:bg-white hover:text-foreground"
                  data-testid="button-learn-more"
                >
                  Learn More
                </Button>
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
