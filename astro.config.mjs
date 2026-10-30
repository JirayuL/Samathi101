import { defineConfig } from 'astro/config';

/**
 * Where the site is served from (GitHub Pages).
 *
 * false → https://jirayul.github.io/samathi101/  (for review, before the domain switch)
 * true  → https://english.samathi101.com/        (after the domain switch)
 *
 * When switching to true, also rename public/CNAME.disabled to public/CNAME
 * (see README → "Switching english.samathi101.com to GitHub Pages").
 */
const USE_CUSTOM_DOMAIN = true;

// https://docs.astro.build/en/guides/deploy/github/
export default defineConfig(
  USE_CUSTOM_DOMAIN
    ? { site: 'https://english.samathi101.com' }
    : { site: 'https://jirayul.github.io', base: '/samathi101' }
);
