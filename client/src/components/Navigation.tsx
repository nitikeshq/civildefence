import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-card border-b border-card-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="hidden md:flex items-center gap-1">
            <Button variant="ghost" className="text-base font-medium" data-testid="button-nav-home">
              Home
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-base font-medium" data-testid="button-nav-about">
                  About Us <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem data-testid="menu-mission">Mission & Vision</DropdownMenuItem>
                <DropdownMenuItem data-testid="menu-organization">Organization Structure</DropdownMenuItem>
                <DropdownMenuItem data-testid="menu-history">History</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-base font-medium" data-testid="button-nav-services">
                  Services <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem data-testid="menu-volunteer">Volunteer Registration</DropdownMenuItem>
                <DropdownMenuItem data-testid="menu-incident">Incident Reporting</DropdownMenuItem>
                <DropdownMenuItem data-testid="menu-training">Training Programs</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" className="text-base font-medium" data-testid="button-nav-gallery">
              Gallery
            </Button>

            <Button variant="ghost" className="text-base font-medium" data-testid="button-nav-contact">
              Contact Us
            </Button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/signin">
              <a>
                <Button variant="ghost" data-testid="button-signin">
                  Sign In
                </Button>
              </a>
            </Link>
            <Link href="/signup">
              <a>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-signup">
                  Sign Up
                </Button>
              </a>
            </Link>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start" data-testid="button-mobile-home">
              Home
            </Button>
            <Button variant="ghost" className="w-full justify-start" data-testid="button-mobile-about">
              About Us
            </Button>
            <Button variant="ghost" className="w-full justify-start" data-testid="button-mobile-services">
              Services
            </Button>
            <Button variant="ghost" className="w-full justify-start" data-testid="button-mobile-gallery">
              Gallery
            </Button>
            <Button variant="ghost" className="w-full justify-start" data-testid="button-mobile-contact">
              Contact Us
            </Button>
            <Link href="/signin">
              <a className="w-full">
                <Button variant="ghost" className="w-full justify-start" data-testid="button-mobile-signin">
                  Sign In
                </Button>
              </a>
            </Link>
            <Link href="/signup">
              <a className="w-full">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-mobile-signup">
                  Sign Up
                </Button>
              </a>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
