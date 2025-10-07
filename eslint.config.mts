import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  {
    rules: {
      "max-len": ["error", { code: 120 }],
    },
  },
  { ignores: ["dist/*", "node_module/*"] },
]);
