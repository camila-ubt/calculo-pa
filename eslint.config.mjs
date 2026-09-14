import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import * as espree from "espree";
import { version as reactVersion } from "react";

export default defineConfig([
  ...nextVitals,
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    // O parser Babel incluído no Next.js ainda não suporta o ESLint 10.
    languageOptions: {
      parser: espree,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    // Evita a detecção automática que usa APIs removidas no ESLint 10.
    settings: { react: { version: reactVersion } },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);
