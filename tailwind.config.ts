import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0A0908",
          deep: "#050404",
          soft: "#161310",
        },
        bone: {
          DEFAULT: "#EBE3D2",
          mute: "#B6AD9A",
        },
        amber: {
          DEFAULT: "#C99A48",
          bright: "#DFB967",
        },
      },
      fontFamily: {
        serif: ["var(--font-vollkorn)", "Georgia", "serif"],
        mono: ["var(--font-plex)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      letterSpacing: {
        widexl: "0.32em",
      },
      transitionTimingFunction: {
        museum: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
