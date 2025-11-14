import cmPhoto from "@assets/cm-photo.jpg";
import civilDefenceLogo from "@assets/civil-defence-logo.jpg";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  return (
    <div className="bg-background border-b-4 border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={civilDefenceLogo}
              alt="Civil Defence Department Logo"
              className="h-16 md:h-20 w-auto"
              data-testid="img-civil-defence-logo"
            />
          </div>

          <div className="flex-1 text-center">
            <div className="flex justify-end mb-2">
              <LanguageSwitcher />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              Civil Defence Department
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Government of Odisha
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <img
              src={cmPhoto}
              alt="Hon'ble Chief Minister of Odisha"
              className="h-20 md:h-28 w-auto rounded-md"
              data-testid="img-cm-photo"
            />
            <div className="text-center hidden sm:block">
              <p className="text-xs font-medium">Hon'ble Chief Minister</p>
              <p className="text-xs font-semibold text-primary">Mohan Ch. Majhi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
