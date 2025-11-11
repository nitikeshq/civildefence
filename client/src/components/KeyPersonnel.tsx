import { Card } from "@/components/ui/card";
import dgPhoto from "@assets/generated_images/Director_General_portrait_f7179195.png";
import digPhoto from "@assets/generated_images/Deputy_Inspector_General_portrait_863c4b05.png";

const personnel = [
  {
    photo: dgPhoto,
    name: "Dr. Sudhanshu Sarangi, IPS",
    designation: "Director General",
    department: "Fire & ES, Home Guards & Civil Defence",
  },
  {
    photo: digPhoto,
    name: "Dr. Umashankar Dash, IPS",
    designation: "Deputy Inspector General",
    department: "Fire & Emergency Services and Home Guards",
  },
  {
    photo: dgPhoto,
    name: "Shri Prakash Kumar",
    designation: "Joint Director",
    department: "Civil Defence Operations",
  },
  {
    photo: digPhoto,
    name: "Smt. Anjali Patel",
    designation: "Deputy Director",
    department: "Training & Development",
  },
];

export default function KeyPersonnel() {
  return (
    <div className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Key Personnel
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Leadership committed to protecting communities and saving lives across Odisha
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {personnel.map((person, index) => (
            <Card
              key={index}
              className="overflow-hidden hover-elevate"
              data-testid={`card-personnel-${index}`}
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={person.photo}
                  alt={person.name}
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
                  data-testid={`img-personnel-${index}`}
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-foreground mb-1" data-testid={`text-name-${index}`}>
                  {person.name}
                </h3>
                <p className="text-sm font-medium text-primary uppercase tracking-wide mb-1">
                  {person.designation}
                </p>
                <p className="text-sm text-muted-foreground">{person.department}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
