/**
 * Easy Resources - AdSense Configuration
 * Centralized management for monetization.
 * Replace the publisher ID below with your actual ca-pub ID.
 */

const ADSENSE_CONFIG = {
  publisherId: 'ca-pub-7733316723224114', // UPDATED WITH REAL ID
  enableAutoAds: true,
  adSlots: {
    leaderboard: '0000000000', // Optional: Specific slot ID
    sidebar: '0000000000',
    article: '0000000000'
  }
};

// AdSense script is now manually loaded in <head> for better crawler verification.

// Function to initialize ads on a page
window.initEasyAds = function() {
  try {
    (adsbygoogle = window.adsbygoogle || []).push({});
  } catch (e) {
    console.error('AdSense initialization failed:', e);
  }
};
