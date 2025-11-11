import { Card } from "@/components/ui/card";
import { Target, Eye, Shield, Heart } from "lucide-react";

export default function AboutSection() {
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
                <Target className="h-12 w-12 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
                <ul className="space-y-3 text-lg text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <span>Save lives during emergencies and disasters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <span>Minimize loss of property and assets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <span>Maintain continuity of production and services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <span>Keep high morale of the people</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-8 border-l-4 border-l-chart-2">
            <div className="flex items-start gap-4">
              <div className="bg-chart-2/10 p-3 rounded-lg">
                <Eye className="h-12 w-12 text-chart-2" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  To build a resilient and disaster-ready Odisha through a network of trained volunteers
                  and modern emergency response systems.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We envision communities empowered with knowledge and resources to protect themselves
                  and support others during times of crisis.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-8 bg-primary/5">
          <div className="flex items-start gap-4">
            <Heart className="h-16 w-16 text-primary flex-shrink-0" />
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-3">About the Department</h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                The Civil Defence Department of Odisha operates under the Directorate General of Fire Services,
                Home Guards & Civil Defence. Established under the Civil Defence Act, 1968, our mandate includes
                disaster management, emergency response, and community preparedness.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                With a network of trained volunteers across all 30 districts, we work before, during, and after
                emergencies to protect lives, property, and maintain community resilience. Our volunteers include
                ex-servicemen and dedicated civilians committed to public service.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
