import { Card } from "@/components/ui/card";
import { Target, Eye, Shield, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { AboutContent } from "@shared/schema";
import * as LucideIcons from "lucide-react";

export default function AboutSection() {
  const { data: cmsContent } = useQuery<AboutContent[]>({
    queryKey: ['/api/cms/about'],
  });

  const activeContent = (cmsContent || [])
    .filter(c => c.isActive)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const missionContent = activeContent.find(c => c.section === 'mission');
  const visionContent = activeContent.find(c => c.section === 'vision');
  const aboutContent = activeContent.find(c => c.section === 'about');

  const getIcon = (iconName?: string | null) => {
    if (!iconName) return Shield;
    const Icon = (LucideIcons as any)[iconName];
    return Icon || Shield;
  };

  return (
    <div className="py-16 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            About Civil Defence
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Protecting communities and saving lives through dedicated volunteer service and emergency preparedness
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="p-8 border-l-4 border-l-primary">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                {(() => {
                  const Icon = getIcon(missionContent?.iconName);
                  return <Icon className="h-12 w-12 text-primary" />;
                })()}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {missionContent?.titleEn || "Our Mission"}
                </h3>
                <div className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                  {missionContent?.contentEn || "Save lives during emergencies and disasters\nMinimize loss of property and assets\nMaintain continuity of production and services\nKeep high morale of the people"}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 border-l-4 border-l-chart-2">
            <div className="flex items-start gap-4">
              <div className="bg-chart-2/10 p-3 rounded-lg">
                {(() => {
                  const Icon = getIcon(visionContent?.iconName);
                  return <Icon className="h-12 w-12 text-chart-2" />;
                })()}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {visionContent?.titleEn || "Our Vision"}
                </h3>
                <div className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                  {visionContent?.contentEn || "To build a resilient and disaster-ready Odisha through a network of trained volunteers and modern emergency response systems.\n\nWe envision communities empowered with knowledge and resources to protect themselves and support others during times of crisis."}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-8 bg-primary/5">
          <div className="flex items-start gap-4">
            {(() => {
              const Icon = getIcon(aboutContent?.iconName);
              return <Icon className="h-16 w-16 text-primary flex-shrink-0" />;
            })()}
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                {aboutContent?.titleEn || "About the Department"}
              </h3>
              <div className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                {aboutContent?.contentEn || "The Civil Defence Department of Odisha operates under the Directorate General of Fire Services, Home Guards & Civil Defence. Established under the Civil Defence Act, 1968, our mandate includes disaster management, emergency response, and community preparedness.\n\nWith a network of trained volunteers across all 30 districts, we work before, during, and after emergencies to protect lives, property, and maintain community resilience. Our volunteers include ex-servicemen and dedicated civilians committed to public service."}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
