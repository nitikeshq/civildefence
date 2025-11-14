import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SiteSetting } from "@shared/schema";

interface SiteSettingsContextValue {
  settings: Record<string, string>;
  getSetting: (key: string, defaultValue?: string) => string;
  isLoading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const { data: settingsArray = [], isLoading } = useQuery<SiteSetting[]>({
    queryKey: ['/api/cms/settings'],
    // Don't fail the whole app if settings fail to load
    retry: 1,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Convert array to key-value object for easy lookup
  const settings = settingsArray.reduce((acc, setting) => {
    acc[setting.key] = setting.value || '';
    return acc;
  }, {} as Record<string, string>);

  const getSetting = (key: string, defaultValue: string = '') => {
    return settings[key] || defaultValue;
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, getSetting, isLoading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
}
