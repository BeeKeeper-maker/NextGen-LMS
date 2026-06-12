'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/app-store';

/**
 * Convert a hex color string (#RRGGBB) to oklch() CSS value.
 * This is needed because Tailwind v4 + shadcn/ui use oklch format for CSS variables.
 */
function hexToOklch(hex: string): string {
  // Parse hex to RGB
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  // sRGB -> linear RGB
  const linearize = (c: number) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const lr = linearize(r);
  const lg = linearize(g);
  const lb = linearize(b);

  // Linear RGB -> XYZ (D65)
  const x = 0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb;
  const y = 0.2126729 * lr + 0.7151522 * lg + 0.0721750 * lb;
  const z = 0.0193339 * lr + 0.1191920 * lg + 0.9503041 * lb;

  // XYZ -> OKLab
  const l_ = 0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z;
  const m_ = 0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z;
  const s_ = 0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z;

  const l = Math.cbrt(l_);
  const m = Math.cbrt(m_);
  const s = Math.cbrt(s_);

  const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const bVal = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;

  // OKLab -> OKLCh
  const C = Math.sqrt(a * a + bVal * bVal);
  let H = Math.atan2(bVal, a) * (180 / Math.PI);
  if (H < 0) H += 360;

  return `oklch(${L.toFixed(4)} ${C.toFixed(4)} ${H.toFixed(2)})`;
}

/**
 * Determine if a color is light or dark for contrast purposes.
 */
function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Relative luminance
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.5;
}

/**
 * Generate a range of shades from a base hex color.
 * Returns an object with shade levels (50-950) as oklch values.
 */
function generateShades(hex: string): Record<string, string> {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Parse to oklch
  const rf = r / 255, gf = g / 255, bf = b / 255;
  const linearize = (c: number) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const lr = linearize(rf), lg = linearize(gf), lb = linearize(bf);
  const x = 0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb;
  const y = 0.2126729 * lr + 0.7151522 * lg + 0.0721750 * lb;
  const z = 0.0193339 * lr + 0.1191920 * lg + 0.9503041 * lb;
  const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
  const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
  const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z);
  const baseL = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const aVal = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bVal = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  const C = Math.sqrt(aVal * aVal + bVal * bVal);
  let H = Math.atan2(bVal, aVal) * (180 / Math.PI);
  if (H < 0) H += 360;

  // Map shade levels to lightness values
  const lightnessMap: Record<string, number> = {
    '50': 0.97, '100': 0.93, '200': 0.87, '300': 0.78,
    '400': 0.68, '500': baseL, '600': Math.max(0.3, baseL - 0.08),
    '700': Math.max(0.22, baseL - 0.16), '800': Math.max(0.16, baseL - 0.24),
    '900': Math.max(0.12, baseL - 0.30), '950': Math.max(0.08, baseL - 0.36),
  };

  const shades: Record<string, string> = {};
  for (const [level, lightness] of Object.entries(lightnessMap)) {
    // Scale chroma based on lightness to keep colors looking natural
    const chromaScale = level === '500' ? 1 : Math.min(1, 0.3 + 0.7 * (1 - Math.abs(lightness - baseL) / 0.5));
    const chroma = C * chromaScale;
    shades[level] = `oklch(${lightness.toFixed(4)} ${chroma.toFixed(4)} ${H.toFixed(2)})`;
  }
  return shades;
}

export function ThemeSync() {
  const { currentTenant } = useAppStore();

  useEffect(() => {
    if (!currentTenant) return;

    const root = document.documentElement;

    // Apply tenant branding to CSS variables
    if (currentTenant.primaryColor) {
      root.style.setProperty('--primary', hexToOklch(currentTenant.primaryColor));
      root.style.setProperty('--primary-foreground', isLightColor(currentTenant.primaryColor) ? 'oklch(0.145 0 0)' : 'oklch(0.985 0 0)');
    }
    if (currentTenant.secondaryColor) {
      root.style.setProperty('--secondary', hexToOklch(currentTenant.secondaryColor));
      root.style.setProperty('--secondary-foreground', isLightColor(currentTenant.secondaryColor) ? 'oklch(0.145 0 0)' : 'oklch(0.985 0 0)');
    }
    if (currentTenant.accentColor) {
      root.style.setProperty('--accent', hexToOklch(currentTenant.accentColor));
      root.style.setProperty('--accent-foreground', isLightColor(currentTenant.accentColor) ? 'oklch(0.145 0 0)' : 'oklch(0.985 0 0)');
      root.style.setProperty('--brand-primary', hexToOklch(currentTenant.accentColor));

      // Override emerald color palette with accent color shades
      // This makes the entire app's emerald usage reflect the new accent color
      const shades = generateShades(currentTenant.accentColor);
      let emeraldCSS = '';
      for (const [level, value] of Object.entries(shades)) {
        root.style.setProperty(`--color-emerald-${level}`, value);
        emeraldCSS += `--color-emerald-${level}: ${value}; `;
      }

      // Inject dynamic style for any remaining emerald overrides
      let styleEl = document.getElementById('theme-emerald-override') as HTMLStyleElement | null;
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'theme-emerald-override';
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = `
        :root, :root:not(.dark) {
          ${emeraldCSS}
        }
        .dark {
          ${Object.entries(shades).map(([level, value]) => `--color-emerald-${level}: ${value};`).join('\n')}
        }
      `;
    }
    if (currentTenant.fontFamily) {
      root.style.setProperty('--font-family', currentTenant.fontFamily);
      root.style.fontFamily = `${currentTenant.fontFamily}, ui-sans-serif, system-ui, sans-serif`;
    }
  }, [currentTenant]);

  return null;
}
