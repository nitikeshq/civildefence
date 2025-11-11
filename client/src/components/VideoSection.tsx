import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

const videos = [
  {
    id: "dQw4w9WgXcQ",
    title: "Civil Defence Training Highlights 2024",
    description: "Overview of our comprehensive training programs and volunteer preparation",
  },
  {
    id: "dQw4w9WgXcQ",
    title: "Emergency Response in Action",
    description: "Real-world emergency response operations and community support",
  },
  {
    id: "dQw4w9WgXcQ",
    title: "Volunteer Success Stories",
    description: "Inspiring stories from our dedicated Civil Defence volunteers",
  },
  {
    id: "dQw4w9WgXcQ",
    title: "Disaster Preparedness Campaign",
    description: "Public awareness initiatives and community engagement programs",
  },
];

export default function VideoSection() {
  return (
    <div className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Video Gallery
          </h2>
          <p className="text-lg text-muted-foreground">
            Watch our initiatives, training programs, and community impact
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((video, index) => (
            <Card
              key={index}
              className="overflow-hidden hover-elevate"
              data-testid={`card-video-${index}`}
            >
              <div className="relative aspect-video bg-muted group cursor-pointer">
                <img
                  src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                  <div className="bg-primary rounded-full p-4 group-hover:scale-110 transition-transform">
                    <Play className="h-8 w-8 text-white fill-white" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {video.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {video.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" data-testid="button-view-all-videos">
            View All Videos
          </Button>
        </div>
      </div>
    </div>
  );
}
