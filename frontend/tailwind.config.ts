import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        savanna: {
          50: '#f6f7f4',
          100: '#e9ece3',
          200: '#d4dac9',
          500: '#7d8a63',
          800: '#3c452e',
          900: '#23291b',
        },
        earth: {
          50: '#fdf8f4',
          100: '#f9eee5',
          500: '#c27845',
          600: '#a55b2e',
          800: '#67361a',
        },
        clay: {
          600: '#9b3d2b',
          700: '#802f20',
        }
      },
    },
  },
  plugins: [],
};
export default config;

