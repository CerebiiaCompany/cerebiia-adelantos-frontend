import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

// Packages banned from the agnostic shared layers (future @cerebiia/core)
const REACT_ROUTING_PATTERNS = [
  { group: ["react-router*", "react-router-dom*"], message: "shared/* must be framework-agnostic (no React Router). Move navigation logic to features/ or pages/." },
  { group: ["react-dom*"], message: "shared/* must be framework-agnostic (no react-dom). Only pure TS/Zod allowed here." },
  { group: ["next*"], message: "shared/* must be framework-agnostic (no Next.js)." },
];

export default tseslint.config(
  { ignores: ["dist"] },

  // ── Base rules (all TS/TSX files) ────────────────────────────────────────
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // ── FSD layer: shared/api — must stay framework-agnostic ─────────────────
  {
    files: ["src/shared/api/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: REACT_ROUTING_PATTERNS }],
    },
  },

  // ── FSD layer: shared/validations — must stay framework-agnostic ─────────
  {
    files: ["src/shared/validations/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: REACT_ROUTING_PATTERNS }],
    },
  },

  // ── FSD layer: shared/lib — must stay framework-agnostic ─────────────────
  {
    files: ["src/shared/lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: REACT_ROUTING_PATTERNS }],
    },
  },

  // ── FSD layer: entities — no features, no pages, no app ──────────────────
  // (full path-based enforcement requires eslint-plugin-import or eslint-plugin-boundaries)
  // Install: npm i -D eslint-plugin-boundaries  then configure FSD zones there.
);
