const { join } = require('path')

/**
 * Store Puppeteer's downloaded Chromium inside node_modules/.cache so it is
 * cached together with dependencies on Vercel (and other CI). Without this,
 * Puppeteer downloads to ~/.cache/puppeteer, which is not preserved across
 * cached builds, causing "Could not find Chrome" failures during prerender.
 * See https://pptr.dev/guides/configuration
 */
module.exports = {
  cacheDirectory: join(__dirname, 'node_modules', '.cache', 'puppeteer'),
}
