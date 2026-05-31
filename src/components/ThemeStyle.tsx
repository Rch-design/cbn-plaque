import { getSettings } from '@/lib/data';

const GOOGLE_FONTS: Record<string, string> = {
  system: '',
  Inter: 'Inter',
  Roboto: 'Roboto',
  Poppins: 'Poppins',
  Montserrat: 'Montserrat',
  'Open Sans': 'Open+Sans',
  Lato: 'Lato',
  Nunito: 'Nunito',
  Raleway: 'Raleway',
  'Playfair Display': 'Playfair+Display',
  'Merriweather': 'Merriweather'
};

export default async function ThemeStyle() {
  const settings = await getSettings();

  const g = (key: string, fallback = '') =>
    settings[key]?.value_fr || fallback;

  const primary      = g('design_primary',      '#f97316');
  const primaryDark  = g('design_primary_dark',  '#ea580c');
  const primaryText  = g('design_primary_text',  '#ffffff');
  const secondary    = g('design_secondary',     '#3b82f6');
  const secondaryDark = g('design_secondary_dark', '#2563eb');
  const headerBg     = g('design_header_bg',     '#ffffff');
  const headerText   = g('design_header_text',   '#111827');
  const headerBorder = g('design_header_border', '#f3f4f6');
  const heroFrom     = g('design_hero_from',     '#f97316');
  const heroVia      = g('design_hero_via',      '#ea580c');
  const heroTo       = g('design_hero_to',       '#3b82f6');
  const footerBg     = g('design_footer_bg',     '#111827');
  const footerText   = g('design_footer_text',   '#d1d5db');
  const fontName     = g('design_font',          'system');

  const gfSlug = GOOGLE_FONTS[fontName];
  const fontImport = gfSlug
    ? `@import url('https://fonts.googleapis.com/css2?family=${gfSlug}:wght@400;500;600;700;800;900&display=swap');`
    : '';
  const fontStack = gfSlug ? `'${fontName}', system-ui, sans-serif` : 'var(--font-sans)';

  const css = `
${fontImport}
:root {
  --c-primary:       ${primary};
  --c-primary-dark:  ${primaryDark};
  --c-primary-text:  ${primaryText};
  --c-secondary:     ${secondary};
  --c-secondary-dark:${secondaryDark};
  --c-header-bg:     ${headerBg};
  --c-header-text:   ${headerText};
  --c-header-border: ${headerBorder};
  --c-hero-from:     ${heroFrom};
  --c-hero-via:      ${heroVia};
  --c-hero-to:       ${heroTo};
  --c-footer-bg:     ${footerBg};
  --c-footer-text:   ${footerText};
  --font-sans:       ${fontStack};
}
body { font-family: var(--font-sans); }
`.trim();

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
