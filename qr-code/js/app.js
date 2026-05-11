/* ===== Quik QR — App Initialization ===== */

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize services (Clerk, Supabase, PostHog)
  await Services.init();
  // Initialize UI
  await UI.init();
  
  console.log('%c✨ Quik QR loaded successfully', 'color:#1B3A4B;font-weight:bold;font-size:14px');
});
