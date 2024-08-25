import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Arimo", ...defaultTheme.fontFamily.sans],
        mono: ["Comic Mono", ...defaultTheme.fontFamily.mono],
      },
      colors: {
        "#e9e8e7": "#e9e8e7",
        "#8b8685": "#8b8685",
        "#656463": "#656463",
        "#454443": "#454443",
        "#353433": "#353433",
        "#252423": "#252423",
        "#090807": "#090807",
        "#bbeeff": "#bbeeff",
        "#d7fc70": "#d7fc70",
        "#ffffbb": "#ffffbb",
      },
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "#e9e8e7",
            "--tw-prose-headings": "#e9e8e7",
            "--tw-prose-bullets": "#8b8685",
            "--tw-prose-counters": "#8b8685",
            "--tw-prose-hr": "#656463",
            "--tw-prose-pre-bg": "#252423",
            "--tw-prose-pre-code": "#e9d7c5",
            "--tw-prose-code": "#e9d7c5",
            "--tw-prose-links": "#ffffbb",
            "--tw-prose-bold": "#fff",
            letterSpacing: ".01em",
            maxWidth: "none",
            a: {
              textDecoration: "none",
              fontWeight: "inherit",
            },
            "a:hover": {
              textDecoration: "underline",
            },
            code: {
              boxShadow: "0 1px 0 #252423",
              borderRadius: "2px",
              border: "solid #555453",
              borderWidth: "1px 1px 2px",
              background: "#252423",
              padding: "2.5px 5px",
              fontWeight: "inherit",
            },
            "pre code": {
              boxShadow: "unset",
              borderRadius: "unset",
              border: "unset",
              borderWidth: "unset",
              background: "unset",
              padding: "unset",
            },
            "code::before": {
              content: "none",
            },
            "code::after": {
              content: "none",
            },
            h1: {
              color: "#8b8685",
              textShadow: "2px 2px #00000040",
            },
            h2: {
              color: "#d7fc70",
              textShadow: "2px 2px #d7fc7026",
            },
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    ({ addVariant }) => {
      addVariant("coarse", "@media (pointer: coarse)");
    },
  ],
};
