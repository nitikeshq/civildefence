import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-card-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">
              Civil Defence Department
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Protecting communities and saving lives through dedicated volunteer service,
              emergency preparedness, and rapid disaster response across Odisha.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-footer-home">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-footer-about">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-footer-services">
                  Services
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-footer-volunteer">
                  Volunteer Registration
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-footer-contact">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Important Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://odisha.gov.in" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-footer-gov">
                  Government of Odisha
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-footer-fire">
                  Fire Services
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-footer-home-guards">
                  Home Guards
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-footer-rti">
                  RTI
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-footer-sitemap">
                  Sitemap
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Contact Information</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  Directorate of Civil Defence, Cuttack, Odisha - 753001
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  Emergency: 112<br />
                  Office: 0671-2xxx xxx
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  civildefence@odisha.gov.in
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © 2025 Civil Defence Department, Government of Odisha. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-privacy">
                Privacy Policy
              </a>
              <span className="text-muted-foreground">|</span>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-terms">
                Terms of Service
              </a>
              <span className="text-muted-foreground">|</span>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-accessibility">
                Accessibility Statement
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
