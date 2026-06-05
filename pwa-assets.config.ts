import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

/**
 * Source-of-truth config for regenerating the PWA icon set.
 *
 * Run `npx pwa-assets-generator` after editing `public/logo.svg` to rebuild
 * the favicon/apple-touch/maskable/PWA PNGs from the single source image.
 */
export default defineConfig({
  headLinkOptions: { preset: "2023" },
  preset: minimal2023Preset,
  images: ["public/logo.svg"],
});
