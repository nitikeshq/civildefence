import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Type, Contrast, AudioLines } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AccessibilityBar() {
  const { toast } = useToast();
  const [fontSize, setFontSize] = useState<"normal" | "large" | "larger">(() => {
    const saved = localStorage.getItem("fontSize");
    return (saved as "normal" | "large" | "larger") || "normal";
  });
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem("highContrast") === "true";
  });
  const [language, setLanguage] = useState<"english" | "odia">(() => {
    const saved = localStorage.getItem("language");
    return (saved as "english" | "odia") || "english";
  });
  const [screenReaderMode, setScreenReaderMode] = useState(() => {
    return localStorage.getItem("screenReaderMode") === "true";
  });

  useEffect(() => {
    document.documentElement.classList.remove("font-normal", "font-large", "font-larger");
    document.documentElement.classList.add(`font-${fontSize}`);
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
    localStorage.setItem("highContrast", String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  useEffect(() => {
    if (screenReaderMode) {
      document.documentElement.setAttribute("data-screen-reader", "true");
    } else {
      document.documentElement.removeAttribute("data-screen-reader");
    }
    localStorage.setItem("screenReaderMode", String(screenReaderMode));
  }, [screenReaderMode]);

  const increaseFontSize = () => {
    if (fontSize === "normal") {
      setFontSize("large");
      toast({ title: "Font size increased to Large" });
    } else if (fontSize === "large") {
      setFontSize("larger");
      toast({ title: "Font size increased to Extra Large" });
    }
  };

  const decreaseFontSize = () => {
    if (fontSize === "larger") {
      setFontSize("large");
      toast({ title: "Font size decreased to Large" });
    } else if (fontSize === "large") {
      setFontSize("normal");
      toast({ title: "Font size reset to Normal" });
    }
  };

  const resetFontSize = () => {
    setFontSize("normal");
    toast({ title: "Font size reset to Normal" });
  };

  const toggleContrast = () => {
    setHighContrast(!highContrast);
    toast({
      title: !highContrast ? "High Contrast Enabled" : "Normal Contrast Enabled",
    });
  };

  const toggleScreenReader = (e: React.MouseEvent) => {
    e.preventDefault();
    setScreenReaderMode(!screenReaderMode);
    toast({
      title: !screenReaderMode ? "Screen Reader Mode Enabled" : "Screen Reader Mode Disabled",
      description: !screenReaderMode ? "Enhanced accessibility features activated" : "Standard mode restored",
    });
  };

  const switchLanguage = (lang: "english" | "odia") => {
    setLanguage(lang);
    toast({
      title: lang === "english" ? "Language: English" : "ଭାଷା: ଓଡ଼ିଆ",
      description: lang === "english" ? "Language switched to English" : "ଓଡ଼ିଆରେ ବଦଳାଯାଇଛି",
    });
  };

  return (
    <div className="bg-muted border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">
              Government of Odisha
            </span>
            <span className="text-muted-foreground">|</span>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
              data-testid="link-skip-content"
            >
              Skip to Main Content
            </a>
            <button
              onClick={toggleScreenReader}
              className={`text-xs font-medium flex items-center gap-1 transition-colors ${
                screenReaderMode 
                  ? "text-primary font-semibold" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="link-screen-reader"
              aria-pressed={screenReaderMode}
            >
              <AudioLines className="h-3 w-3" />
              Screen Reader {screenReaderMode && "✓"}
            </button>
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
                onClick={() => switchLanguage("english")}
                className={`text-xs font-medium transition-colors ${
                  language === "english" 
                    ? "text-primary font-semibold underline" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="button-lang-english"
              >
                English
              </button>
              <span className="text-muted-foreground">/</span>
              <button
                onClick={() => switchLanguage("odia")}
                className={`text-xs font-medium transition-colors ${
                  language === "odia" 
                    ? "text-primary font-semibold underline" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
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
