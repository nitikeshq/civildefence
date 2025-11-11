import { Card } from "@/components/ui/card";
import { Users, AlertCircle, Package, Award } from "lucide-react";

const stats = [
  {
    icon: Users,
    number: "15,420",
    label: "Registered Volunteers",
    color: "text-chart-1",
  },
  {
    icon: AlertCircle,
    number: "2,847",
    label: "Incidents Responded",
    color: "text-chart-2",
  },
  {
    icon: Package,
    number: "8,650",
    label: "Equipment Items",
    color: "text-chart-3",
  },
  {
    icon: Award,
    number: "30",
    label: "Districts Covered",
    color: "text-chart-4",
  },
];

export default function QuickStats() {
  return (
    <div className="bg-muted py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="p-6 hover-elevate"
                data-testid={`card-stat-${index}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-4xl font-bold text-foreground mb-2" data-testid={`text-stat-number-${index}`}>
                      {stat.number}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      {stat.label}
                    </p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
