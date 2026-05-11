/* ===== Quik QR Services — Clerk, Supabase, PostHog ===== */

const Services = (() => {
  // ─── Configuration (replace with your keys) ───
  const CONFIG = {
    CLERK_PUBLISHABLE_KEY: 'YOUR_CLERK_PUBLISHABLE_KEY',
    SUPABASE_URL: 'YOUR_SUPABASE_URL',
    SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
    POSTHOG_KEY: 'YOUR_POSTHOG_KEY',
    POSTHOG_HOST: 'https://us.i.posthog.com',
  };

  let clerkInstance = null;
  let supabaseClient = null;

  // ─── Clerk Auth ───
  async function initClerk() {
    if (CONFIG.CLERK_PUBLISHABLE_KEY === 'YOUR_CLERK_PUBLISHABLE_KEY') {
      console.info('[Quik QR] Clerk key not configured — auth disabled');
      return false;
    }
    try {
      const script = document.createElement('script');
      script.src = `https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.browser.js`;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
      await new Promise((res, rej) => { script.onload = res; script.onerror = rej; });
      clerkInstance = new window.Clerk(CONFIG.CLERK_PUBLISHABLE_KEY);
      await clerkInstance.load();
      const authEl = document.getElementById('clerk-auth');
      if (authEl) {
        if (clerkInstance.user) {
          authEl.innerHTML = `<div class="clerk-user" style="display:flex;align-items:center;gap:8px">
            <img src="${clerkInstance.user.imageUrl}" alt="" style="width:32px;height:32px;border-radius:50%">
            <span style="font-size:.875rem;font-weight:500">${clerkInstance.user.firstName || 'Account'}</span>
          </div>`;
        } else {
          const btn = document.createElement('button');
          btn.className = 'btn btn-sm btn-secondary';
          btn.textContent = 'Sign In';
          btn.addEventListener('click', () => clerkInstance.openSignIn());
          authEl.appendChild(btn);
        }
      }
      return true;
    } catch (e) {
      console.warn('[Quik QR] Clerk init failed:', e);
      return false;
    }
  }

  function isAuthenticated() {
    return clerkInstance?.user != null;
  }

  function getUserEmail() {
    return clerkInstance?.user?.primaryEmailAddress?.emailAddress || null;
  }

  // ─── Supabase ───
  async function initSupabase() {
    if (CONFIG.SUPABASE_URL === 'YOUR_SUPABASE_URL') {
      console.info('[Quik QR] Supabase not configured — using localStorage fallback');
      return false;
    }
    try {
      const { createClient } = await import(
        'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'
      );
      supabaseClient = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
      return true;
    } catch (e) {
      console.warn('[Quik QR] Supabase init failed:', e);
      return false;
    }
  }

  async function saveSignup(email, name = '', subscribe = false) {
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient
          .from('signups')
          .insert([{ email, name, subscribe, created_at: new Date().toISOString() }]);
        if (error) throw error;
        return true;
      } catch (e) {
        console.warn('[Quik QR] Supabase signup save failed:', e);
      }
    }
    // Fallback to localStorage
    const signups = JSON.parse(localStorage.getItem('quikqr_signups') || '[]');
    signups.push({ email, name, subscribe, created_at: new Date().toISOString() });
    localStorage.setItem('quikqr_signups', JSON.stringify(signups));
    return true;
  }

  async function getGenerationCount() {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('stats')
          .select('count')
          .eq('id', 'total_generated')
          .single();
        if (!error && data) return data.count;
      } catch (e) { /* fall through */ }
    }
    return parseInt(localStorage.getItem('quikqr_gen_count') || '127843', 10);
  }

  async function incrementGenerationCount() {
    const current = parseInt(localStorage.getItem('quikqr_gen_count') || '127843', 10);
    localStorage.setItem('quikqr_gen_count', String(current + 1));
    if (supabaseClient) {
      try {
        await supabaseClient.rpc('increment_stat', { stat_id: 'total_generated' });
      } catch (e) { /* silent */ }
    }
    return current + 1;
  }

  // ─── PostHog Analytics ───
  function track(event, properties = {}) {
    if (typeof window.posthog !== 'undefined' && window.posthog.capture) {
      window.posthog.capture(event, properties);
    }
  }

  // ─── Resend (Server-side note) ───
  // Resend CANNOT be called from the browser — API key would be exposed.
  // Use a Cloudflare Worker or Supabase Edge Function:
  //
  // // cloudflare-worker.js
  // export default {
  //   async fetch(request, env) {
  //     const { email, name } = await request.json();
  //     const res = await fetch('https://api.resend.com/emails', {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': `Bearer ${env.RESEND_API_KEY}`,
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         from: 'QRCraft <hello@yourdomain.com>',
  //         to: email,
  //         subject: 'Welcome to QRCraft!',
  //         html: '<h1>Your QR Code is ready</h1>',
  //       }),
  //     });
  //     return new Response(JSON.stringify({ ok: true }));
  //   }
  // };

  // ─── Init All ───
  async function init() {
    await Promise.allSettled([initClerk(), initSupabase()]);
  }

  return { init, isAuthenticated, getUserEmail, saveSignup, getGenerationCount, incrementGenerationCount, track, CONFIG };
})();
