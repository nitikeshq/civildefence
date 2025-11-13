import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  className?: string;
}

export default function DashboardLayout({ children, sidebar, className }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        {sidebar && (
          <aside className="w-64 bg-card border-r border-border">
            {sidebar}
          </aside>
        )}
        
        <main id="main-content" className={cn("flex-1 bg-muted/30", className)}>
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
}
