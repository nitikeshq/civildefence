import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Languages, 
  Image, 
  Info, 
  Briefcase,
  Settings,
  Users,
  LogOut
} from "lucide-react";
import { Button } from "./ui/button";

const menuItems = [
  {
    title: "Dashboard",
    href: "/cms/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Translations",
    href: "/cms/translations",
    icon: Languages,
  },
  {
    title: "Hero Banners",
    href: "/cms/banners",
    icon: Image,
  },
  {
    title: "About Content",
    href: "/cms/about",
    icon: Info,
  },
  {
    title: "Services",
    href: "/cms/services",
    icon: Briefcase,
  },
  {
    title: "Site Settings",
    href: "/cms/settings",
    icon: Settings,
  },
];

export default function CMSSidebar() {
  const [location] = useLocation();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/signin";
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">CMS Manager</h2>
        <p className="text-sm text-muted-foreground">Content Management</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.title}</span>
              </a>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
