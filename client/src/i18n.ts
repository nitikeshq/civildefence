import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import enTranslations from "./translations/en.json";
import orTranslations from "./translations/or.json";

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    // Fallback to static translations if API fails
    resources: {
      en: { translation: enTranslations },
      or: { translation: orTranslations },
    },
    lng: localStorage.getItem('language') || "en", // Persist language choice
    fallbackLng: "en",
    
    backend: {
      loadPath: '/api/locales/{{lng}}/{{ns}}',
      allowMultiLoading: false,
      crossDomain: false,
      // Parse response to handle nested namespace format
      parse: (data: string) => {
        try {
          const parsed = JSON.parse(data);
          // If response is nested { namespace: {...} }, extract the namespace
          if (parsed && typeof parsed === 'object' && 'translation' in parsed) {
            return parsed.translation;
          }
          // Otherwise return as-is (should be a flat object or empty)
          return parsed;
        } catch (e) {
          return {};
        }
      },
      // Handle 404 gracefully - return empty object to use fallback
      request: async (options: any, url: string, payload: any, callback: any) => {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            // On 404 or error, return empty object to trigger fallback
            if (response.status === 404) {
              callback(null, { status: 200, data: '{}' });
              return;
            }
            callback(null, { status: response.status });
            return;
          }
          const data = await response.text();
          callback(null, { status: 200, data });
        } catch (error) {
          console.error('i18next backend error:', error);
          callback(null, { status: 500, data: '{}' });
        }
      },
    },
    
    interpolation: {
      escapeValue: false, // React already escapes
    },
    
    // Load only language, not region-specific (e.g., 'en' not 'en-US')
    load: 'languageOnly',
    
    // React already handles the updates
    react: {
      useSuspense: false,
    },
    
    // Merge backend translations with fallback instead of replacing
    partialBundledLanguages: true,
  });

// Save language preference when it changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;
