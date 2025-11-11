import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Type, Contrast, AudioLines } from "lucide-react";

export default function AccessibilityBar() {
  const [fontSize, setFontSize] = useState<"normal" | "large" | "larger">("normal");
  const [highContrast, setHighContrast] = useState(false);

  const increaseFontSize = () => {
    if (fontSize === "normal") setFontSize("large");
    else if (fontSize === "large") setFontSize("larger");
  };

  const decreaseFontSize = () => {
    if (fontSize === "larger") setFontSize("large");
    else if (fontSize === "large") setFontSize("normal");
  };

  const resetFontSize = () => setFontSize("normal");

  const toggleContrast = () => {
    setHighContrast(!highContrast);
    document.documentElement.classList.toggle("high-contrast");
  };

  return (
    <div className="bg-muted border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-10">
          <div className="flex items-center gap-2">
            <a
              href="#main-content"
              className="text-xs font-medium text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              data-testid="link-skip-content"
            >
              Skip to Main Content
            </a>
            <span className="text-muted-foreground">|</span>
            <a
              href="#"
              className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
              data-testid="link-screen-reader"
            >
              <AudioLines className="h-3 w-3" />
              Screen Reader
            </a>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-muted-foreground mr-2 flex items-center gap-1">
                <Type className="h-3 w-3" />
                Font Size:
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={increaseFontSize}
                disabled={fontSize === "larger"}
                data-testid="button-increase-font"
              >
                A+
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={resetFontSize}
                data-testid="button-reset-font"
              >
                A
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={decreaseFontSize}
                disabled={fontSize === "normal"}
                data-testid="button-decrease-font"
              >
                A-
              </Button>
            </div>

            <span className="text-muted-foreground">|</span>

            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-3 text-xs flex items-center gap-1"
              onClick={toggleContrast}
              data-testid="button-toggle-contrast"
            >
              <Contrast className="h-3 w-3" />
              {highContrast ? "Normal" : "High"} Contrast
            </Button>

            <span className="text-muted-foreground">|</span>

            <div className="flex items-center gap-2">
              <button
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
                data-testid="button-lang-english"
              >
                English
              </button>
              <span className="text-muted-foreground">/</span>
              <button
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
                data-testid="button-lang-odia"
              >
                ଓଡ଼ିଆ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
