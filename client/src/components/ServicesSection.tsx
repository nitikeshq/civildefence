import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, AlertTriangle, GraduationCap, PackageCheck, FileText, Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Service } from "@shared/schema";
import * as LucideIcons from "lucide-react";

const fallbackServices = [
  {
    iconName: "UserPlus",
    titleEn: "Volunteer Registration",
    descriptionEn: "Join our network of dedicated Civil Defence volunteers. Register as an ex-serviceman or civilian volunteer to serve your community.",
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
  },
  {
    iconName: "AlertTriangle",
    titleEn: "Incident Reporting",
    descriptionEn: "Report emergencies and incidents in real-time. Our rapid response system ensures quick deployment and coordinated action.",
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
  },
  {
    iconName: "GraduationCap",
    titleEn: "Training Programs",
    descriptionEn: "Comprehensive training for volunteers in emergency response, disaster management, first aid, and rescue operations.",
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
  },
  {
    iconName: "PackageCheck",
    titleEn: "Equipment Management",
    descriptionEn: "Access to modern emergency equipment, medical supplies, communication devices, and rescue gear for effective operations.",
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
  {
    iconName: "FileText",
    titleEn: "Documentation & Verification",
    descriptionEn: "Streamlined document verification and approval process for volunteer applications at district level.",
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
  },
  {
    iconName: "Phone",
    titleEn: "Emergency Helpline",
    descriptionEn: "24/7 emergency helpline service. Call 112 for immediate assistance during disasters and emergencies.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

export default function ServicesSection() {
  const { data: cmsServices } = useQuery<Service[]>({
    queryKey: ['/api/cms/services'],
  });

  const services = (cmsServices && cmsServices.length > 0)
    ? cmsServices.filter(s => s.isActive).sort((a, b) => (a.order || 0) - (b.order || 0))
    : fallbackServices;

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon || UserPlus;
  };

  return (
    <div className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive emergency services and volunteer programs to protect and serve communities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = getIcon(service.iconName);
            return (
              <Card
                key={index}
                className="p-6 hover-elevate"
                data-testid={`card-service-${index}`}
              >
                <div className={`${service.bgColor || 'bg-primary/10'} p-4 rounded-lg inline-block mb-4`}>
                  <Icon className={`h-8 w-8 ${service.color || 'text-primary'}`} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {service.titleEn}
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {service.descriptionEn}
                </p>
                <Button variant="outline" size="sm" data-testid={`button-learn-${index}`}>
                  Learn More
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
