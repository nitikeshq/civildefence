import cmPhoto from "@assets/cm-photo.jpg";
import civilDefenceLogo from "@assets/civil-defence-logo.jpg";

export default function Header() {
  return (
    <div className="bg-background border-b-4 border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <img
              src={civilDefenceLogo}
              alt="Civil Defence Department Logo"
              className="h-16 md:h-20 w-auto"
              data-testid="img-civil-defence-logo"
            />
            <div className="text-left">
              <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-foreground leading-tight">
                Directorate General
              </h1>
              <p className="text-xs sm:text-sm md:text-base font-semibold text-foreground">
                Fire Services, Civil Defence & Home Guards
              </p>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                Ministry of Home Affairs, Government of India
              </p>
            </div>
          </div>

          <div className="text-center flex-1">
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground">
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
