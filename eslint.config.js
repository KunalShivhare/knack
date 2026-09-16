// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // Server code holds API keys and prompts. Only API routes may import it, so
    // none of it can be bundled into the app.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/server/**", "src/app/api/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/server", "@/server/*"],
              message: "Server-only code. Call it through an API route instead.",
            },
            {
              group: ["@/shared/contracts/schemas"],
              message: "Pulls zod into the app bundle. Import types from @/shared/contracts.",
            },
          ],
        },
      ],
    },
  },
]);
