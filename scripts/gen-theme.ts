import { themeFromSourceColor, argbFromHex, hexFromArgb } from '@material/material-color-utilities';
import * as fs from 'fs';
import * as path from 'path';

const sourceHex = '#1F6F5F';
const theme = themeFromSourceColor(argbFromHex(sourceHex));

function formatTokens(scheme: Record<string, number>, isDark: boolean) {
  // convert camelCase to kebab-case
  const lines: string[] = [];
  for (const [key, value] of Object.entries(scheme)) {
    const kebab = key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    const hex = hexFromArgb(value);
    lines.push(`  --md-sys-color-${kebab}: ${hex};`);
  }
  return lines.join('\n');
}

// Generate CSS
const lightTokens = formatTokens(theme.schemes.light.toJSON(), false);
const darkTokens = formatTokens(theme.schemes.dark.toJSON(), true);

const matkulColorsLight = [
  '#006A60', '#1B6B50', '#2E6A38', '#00677D', '#436815',
  '#6750A4', '#8C4E61', '#904D00', '#006874', '#556500'
];

const matkulColorsDark = [
  '#53DBC9', '#70D7B0', '#85D78E', '#56D6F5', '#A7D46E',
  '#CFBCFF', '#FFB1C8', '#FFB77C', '#4FD8EB', '#BDCE5E'
];

const css = `:root {
  /* Material Design 3 Dynamic Color Tokens (Source: ${sourceHex}) */
  /* Light Theme */
${lightTokens}

  --md-sys-color-surface-dim: #d8dad7;
  --md-sys-color-surface-bright: #f8faf8;
  --md-sys-color-surface-container-lowest: #ffffff;
  --md-sys-color-surface-container-low: #f2f5f2;
  --md-sys-color-surface-container: #ecefec;
  --md-sys-color-surface-container-high: #e6e9e6;
  --md-sys-color-surface-container-highest: #e0e3e0;

  /* Custom KuliahKu Semantic Tokens */
  --kk-status-terlambat: #BA1A1A;
  --kk-status-terlambat-container: #FFDAD6;
  --kk-status-on-terlambat: #FFFFFF;
  --kk-status-on-terlambat-container: #410002;

  --kk-status-mendesak: #7D5700;
  --kk-status-mendesak-container: #FFDEA5;
  --kk-status-on-mendesak: #FFFFFF;
  --kk-status-on-mendesak-container: #271900;

  --kk-status-selesai: #1F6F5F;
  --kk-status-selesai-container: #A6F2DF;
  --kk-status-on-selesai: #FFFFFF;
  --kk-status-on-selesai-container: #00201A;

  /* Matkul Pastel/Distinct Palette (Light) */
  --kk-matkul-1: ${matkulColorsLight[0]};
  --kk-matkul-2: ${matkulColorsLight[1]};
  --kk-matkul-3: ${matkulColorsLight[2]};
  --kk-matkul-4: ${matkulColorsLight[3]};
  --kk-matkul-5: ${matkulColorsLight[4]};
  --kk-matkul-6: ${matkulColorsLight[5]};
  --kk-matkul-7: ${matkulColorsLight[6]};
  --kk-matkul-8: ${matkulColorsLight[7]};
  --kk-matkul-9: ${matkulColorsLight[8]};
  --kk-matkul-10: ${matkulColorsLight[9]};

  /* Shape tokens */
  --md-sys-shape-corner-none: 0px;
  --md-sys-shape-corner-extra-small: 4px;
  --md-sys-shape-corner-small: 8px;
  --md-sys-shape-corner-medium: 12px;
  --md-sys-shape-corner-large: 16px;
  --md-sys-shape-corner-extra-large: 28px;
  --md-sys-shape-corner-full: 9999px;

  /* Typography family */
  --md-ref-typeface-brand: 'Plus Jakarta Sans', sans-serif;
  --md-ref-typeface-plain: 'Plus Jakarta Sans', sans-serif;
  --md-sys-typescale-body-large-font: 'Plus Jakarta Sans', sans-serif;
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Dark Theme */
${darkTokens}

    --md-sys-color-surface-dim: #111413;
    --md-sys-color-surface-bright: #373a39;
    --md-sys-color-surface-container-lowest: #0c0f0e;
    --md-sys-color-surface-container-low: #191c1b;
    --md-sys-color-surface-container: #1d201f;
    --md-sys-color-surface-container-high: #272b29;
    --md-sys-color-surface-container-highest: #323634;

    --kk-status-terlambat: #FFB4AB;
    --kk-status-terlambat-container: #93000A;
    --kk-status-on-terlambat: #690005;
    --kk-status-on-terlambat-container: #FFDAD6;

    --kk-status-mendesak: #F9BD38;
    --kk-status-mendesak-container: #5D4000;
    --kk-status-on-mendesak: #422D00;
    --kk-status-on-mendesak-container: #FFDEA5;

    --kk-status-selesai: #8AD6C3;
    --kk-status-selesai-container: #005144;
    --kk-status-on-selesai: #00382E;
    --kk-status-on-selesai-container: #A6F2DF;

    /* Matkul Palette (Dark) */
    --kk-matkul-1: ${matkulColorsDark[0]};
    --kk-matkul-2: ${matkulColorsDark[1]};
    --kk-matkul-3: ${matkulColorsDark[2]};
    --kk-matkul-4: ${matkulColorsDark[3]};
    --kk-matkul-5: ${matkulColorsDark[4]};
    --kk-matkul-6: ${matkulColorsDark[5]};
    --kk-matkul-7: ${matkulColorsDark[6]};
    --kk-matkul-8: ${matkulColorsDark[7]};
    --kk-matkul-9: ${matkulColorsDark[8]};
    --kk-matkul-10: ${matkulColorsDark[9]};
  }
}
`;

const outputPath = path.resolve('src/theme.css');
fs.writeFileSync(outputPath, css, 'utf-8');
console.log(`Successfully generated ${outputPath}`);
