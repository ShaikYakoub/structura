import { hexToHSL } from "@/lib/color-utils";

interface SiteStyles {
  primary?: string;
  background?: string;
  foreground?: string;
  muted?: string;
  mutedForeground?: string;
  fontHeading?: string;
  fontBody?: string;
  radius?: string;
}

interface StyleInjectorProps {
  styles: SiteStyles;
}

// Curated Google Fonts list
const GOOGLE_FONTS = {
  Inter: "Inter:wght@300;400;500;600;700;800",
  Roboto: "Roboto:wght@300;400;500;700",
  "Open Sans": "Open+Sans:wght@300;400;600;700",
  Lato: "Lato:wght@300;400;700",
  Montserrat: "Montserrat:wght@300;400;500;600;700",
  "Playfair Display": "Playfair+Display:wght@400;500;600;700",
  Poppins: "Poppins:wght@300;400;500;600;700",
  Raleway: "Raleway:wght@300;400;500;600;700",
  Merriweather: "Merriweather:wght@300;400;700",
  "Source Sans Pro": "Source+Sans+Pro:wght@300;400;600;700",
} as const;

export function StyleInjector({ styles }: StyleInjectorProps) {
  // Convert hex colors to HSL for Shadcn UI compatibility
  const primaryHSL = styles.primary ? hexToHSL(styles.primary) : "0 0% 0%";
  const backgroundHSL = styles.background ? hexToHSL(styles.background) : "0 0% 100%";
  const foregroundHSL = styles.foreground ? hexToHSL(styles.foreground) : "0 0% 0%";
  const mutedHSL = styles.muted ? hexToHSL(styles.muted) : "210 40% 96.1%";
  const mutedForegroundHSL = styles.mutedForeground ? hexToHSL(styles.mutedForeground) : "215.4 16.3% 46.9%";

  // Auto-generate foreground colors based on luminance
  const [, , primaryL] = primaryHSL.split(' ').map(v => parseFloat(v));
  const primaryForeground = primaryL > 50 ? '0 0% 0%' : '0 0% 100%';

  // Get font families
  const headingFont = styles.fontHeading || "Inter";
  const bodyFont = styles.fontBody || "Inter";

  // Get border radius (convert to rem)
  const radius = styles.radius ? `${styles.radius}rem` : "0.5rem";

  // Generate Google Fonts URLs
  const fontsToLoad = new Set([headingFont, bodyFont]);
  const fontUrls = Array.from(fontsToLoad)
    .filter(font => font in GOOGLE_FONTS)
    .map(font => GOOGLE_FONTS[font as keyof typeof GOOGLE_FONTS]);

  return (
    <>
      {/* Google Fonts Preconnect */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* Load Google Fonts */}
      {fontUrls.length > 0 && (
        <link
          href={`https://fonts.googleapis.com/css2?${fontUrls.map(f => `family=${f}`).join('&')}&display=swap`}
          rel="stylesheet"
        />
      )}

      {/* Inject CSS Variables */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              /* Colors */
              --background: ${backgroundHSL};
              --foreground: ${foregroundHSL};
              
              --primary: ${primaryHSL};
              --primary-foreground: ${primaryForeground};
              
              --secondary: 210 40% 96.1%;
              --secondary-foreground: 222.2 47.4% 11.2%;
              
              --muted: ${mutedHSL};
              --muted-foreground: ${mutedForegroundHSL};
              
              --accent: 210 40% 96.1%;
              --accent-foreground: 222.2 47.4% 11.2%;
              
              --destructive: 0 84.2% 60.2%;
              --destructive-foreground: 210 40% 98%;
              
              --border: 214.3 31.8% 91.4%;
              --input: 214.3 31.8% 91.4%;
              --ring: ${primaryHSL};
              
              /* Border Radius */
              --radius: ${radius};
              
              /* Fonts */
              --font-heading: "${headingFont}", sans-serif;
              --font-body: "${bodyFont}", sans-serif;
            }
            
            /* Apply fonts globally */
            body {
              font-family: var(--font-body);
            }
            
            h1, h2, h3, h4, h5, h6 {
              font-family: var(--font-heading);
            }
          `,
        }}
      />
    </>
  );
}
