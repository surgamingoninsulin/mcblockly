import { defineConfig } from 'vite';

// Served from https://<user>.github.io/mcblockly/ on GitHub Pages, so all
// asset URLs need the repo name as a base path.
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/mcblockly/' : '/',
});
