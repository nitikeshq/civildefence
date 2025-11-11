import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import trainingImg from "@assets/generated_images/Civil_Defence_training_f1298099.png";
import emergencyImg from "@assets/generated_images/Emergency_response_operations_6dd70f83.png";
import controlRoomImg from "@assets/generated_images/Civil_Defence_control_room_fe29f826.png";
import outreachImg from "@assets/generated_images/Community_outreach_program_21bbb7e7.png";
import volunteerImg from "@assets/generated_images/Volunteer_team_formation_098742a6.png";
import fireImg from "@assets/generated_images/Fire_safety_demonstration_3c09099e.png";

const galleryImages = [
  { src: trainingImg, caption: "Civil Defence Training Program" },
  { src: emergencyImg, caption: "Emergency Response Operations" },
  { src: controlRoomImg, caption: "Modern Control Room Facility" },
  { src: outreachImg, caption: "Community Outreach Initiative" },
  { src: volunteerImg, caption: "Volunteer Team Formation" },
  { src: fireImg, caption: "Fire Safety Demonstration" },
];

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  return (
    <div className="py-16 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Photo Gallery
          </h2>
          <p className="text-lg text-muted-foreground">
            Capturing moments of service, training, and community protection
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className="aspect-square overflow-hidden rounded-lg cursor-pointer hover-elevate"
              onClick={() => setSelectedImage(index)}
              data-testid={`img-gallery-${index}`}
            >
              <img
                src={image.src}
                alt={image.caption}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
              />
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" data-testid="button-view-all-gallery">
            View All Photos
          </Button>
        </div>

        {selectedImage !== null && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
            data-testid="lightbox-overlay"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setSelectedImage(null)}
              data-testid="button-close-lightbox"
            >
              <X className="h-6 w-6" />
            </Button>
            <div className="max-w-5xl w-full">
              <img
                src={galleryImages[selectedImage].src}
                alt={galleryImages[selectedImage].caption}
                className="w-full h-auto rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
              <p className="text-white text-center mt-4 text-lg">
                {galleryImages[selectedImage].caption}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
