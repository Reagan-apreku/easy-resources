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

// Load AdSense Script Tag
(function() {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CONFIG.publisherId}`;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
})();

// Function to initialize ads on a page
window.initEasyAds = function() {
  try {
    (adsbygoogle = window.adsbygoogle || []).push({});
  } catch (e) {
    console.error('AdSense initialization failed:', e);
  }
};
