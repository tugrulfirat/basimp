/**
 * bimp.us API Server
 * Handles: auth (magic link), credits, BYOK, Stripe webhooks
 */

const http = require('http');
const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');

const loadEnvFile = (envPath) => {
  try {
    fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match || process.env[match[1]] !== undefined) return;
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    });
  } catch {}
};

loadEnvFile(path.join(__dirname, '.env'));

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const PORT = 3002;
const DB_PATH = path.join(__dirname, 'bimp.db');
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Tolerance window for Stripe webhook timestamp replay protection
const STRIPE_WEBHOOK_TOLERANCE_MS = 5 * 60 * 1000;

// Products are identified by their fixed price (in cents) rather than a
// Stripe price/product ID lookup — checkout.session.completed always carries
// amount_total with no extra API call, unlike line_items which needs expansion.
// Keep these in sync with whatever prices the Payment Links are created with.
const STRIPE_AMOUNT_PRO_CENTS = 2500;      // $25 one-time Pro unlock
const CREDITS_MAP = {
  500: 50,    // $5  = 50 credits
  1000: 120,  // $10 = 120 credits
};

// BYOK unlocks at $50 spent in credits (1 credit = $0.10, so 500 credits total spent)
const BYOK_CREDIT_THRESHOLD = 500;

// Magic link token TTL (15 minutes)
const TOKEN_TTL_MS = 15 * 60 * 1000;

// Session TTL (30 days)
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

// ── SQLite (bundled via better-sqlite3) ───────────────────────────────────────
let db;
try {
  const Database = require('better-sqlite3');
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      is_pro INTEGER DEFAULT 0,
      credits INTEGER DEFAULT 50,
      credits_spent INTEGER DEFAULT 0,
      byok_key TEXT DEFAULT NULL,
      byok_unlocked INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s','now'))
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS magic_tokens (
      token TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS orders (
      ls_order_id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      product_id TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s','now'))
    );
  `);
  console.log('✓ Database ready:', DB_PATH);
} catch (err) {
  console.error('Database init failed:', err.message);
  console.error('Run: npm install better-sqlite3');
  process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const rand = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

const json = (res, status, data) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
};

const parseBody = (req) => new Promise((resolve, reject) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try { resolve({ raw: body, parsed: JSON.parse(body || '{}') }); }
    catch { resolve({ raw: body, parsed: {} }); }
  });
  req.on('error', reject);
});

const getSession = (req) => {
  const auth = req.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '').trim();
  if (!token) return null;
  const now = Math.floor(Date.now() / 1000);
  const session = db.prepare('SELECT * FROM sessions WHERE token = ? AND expires_at > ?').get(token, now);
  if (!session) return null;
  return db.prepare('SELECT * FROM users WHERE id = ?').get(session.user_id);
};

const createSessionForUser = (userId) => {
  const sessionToken = rand();
  const expires = Math.floor((Date.now() + SESSION_TTL_MS) / 1000);
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(sessionToken, userId, expires);
  return sessionToken;
};

// ── Send magic link email via Resend ─────────────────────────────────────────
const sendMagicLink = (email, token) => {
  const link = `https://bimp.us/api/auth/verify?token=${token}`;

  if (!RESEND_API_KEY) {
    // Fallback: log to console for local dev
    console.log(`\n🔗 Magic link for ${email}:\n${link}\n`);
    return Promise.resolve(true);
  }

  const body = JSON.stringify({
    from: 'bimp.us <noreply@bimp.us>',
    to: [email],
    subject: 'Your bimp.us sign-in link',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0F0F1A;color:#E8E8F0;border-radius:12px">
        <div style="font-size:24px;font-weight:800;margin-bottom:8px;color:#fff">bimp.us</div>
        <div style="font-size:14px;color:#8888AA;margin-bottom:32px">Basic Image Manipulator</div>
        <div style="font-size:16px;font-weight:600;margin-bottom:12px">Your sign-in link</div>
        <div style="font-size:14px;color:#8888AA;margin-bottom:24px;line-height:1.6">
          Click the button below to sign in to bimp.us. This link expires in 15 minutes.
        </div>
        <a href="${link}" style="display:inline-block;padding:14px 28px;background:#6C63FF;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px">
          Sign in to bimp.us →
        </a>
        <div style="margin-top:24px;font-size:12px;color:#555">
          If you didn't request this, you can safely ignore this email.
        </div>
      </div>
    `
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      }
    }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✓ Magic link sent to ${email}`);
          resolve(true);
        } else {
          console.error(`Resend error ${res.statusCode}:`, data);
          resolve(false);
        }
      });
    });
    req.on('error', (e) => { console.error('Resend request error:', e); resolve(false); });
    req.write(body);
    req.end();
  });
};

// ── Routes ────────────────────────────────────────────────────────────────────
const routes = {

  // GET /api/auth/google/config — expose public Google client config
  'GET /api/auth/google/config': (req, res) => {
    json(res, 200, {
      enabled: !!GOOGLE_CLIENT_ID,
      client_id: GOOGLE_CLIENT_ID || null,
    });
  },

  // POST /api/auth/google — verify Google ID token and create a bimp session
  'POST /api/auth/google': async (req, res) => {
    if (!googleClient) return json(res, 503, { error: 'Google sign-in is not configured' });

    const { parsed } = await parseBody(req);
    const credential = (parsed.credential || '').trim();
    if (!credential) return json(res, 400, { error: 'Google credential required' });

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const email = (payload?.email || '').toLowerCase().trim();
      if (!email || payload.email_verified !== true) {
        return json(res, 401, { error: 'Google account email is not verified' });
      }

      db.prepare('INSERT OR IGNORE INTO users (email, credits) VALUES (?, 50)').run(email);
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      const sessionToken = createSessionForUser(user.id);

      json(res, 200, {
        ok: true,
        session: sessionToken,
        user: {
          email: user.email,
          is_pro: !!user.is_pro,
          credits: user.credits,
          credits_spent: user.credits_spent,
          byok_unlocked: !!user.byok_unlocked || !!user.is_pro || user.credits_spent >= BYOK_CREDIT_THRESHOLD,
        },
      });
    } catch (err) {
      console.warn('Google sign-in failed:', err.message);
      json(res, 401, { error: 'Invalid Google sign-in' });
    }
  },

  // POST /api/auth/login — send magic link
  'POST /api/auth/login': async (req, res) => {
    const { parsed } = await parseBody(req);
    const email = (parsed.email || '').toLowerCase().trim();
    if (!email || !email.includes('@')) return json(res, 400, { error: 'Valid email required' });

    // Upsert user
    db.prepare('INSERT OR IGNORE INTO users (email, credits) VALUES (?, 50)').run(email);

    // Create magic token
    const token = rand();
    const expires = Date.now() + TOKEN_TTL_MS;
    db.prepare('INSERT OR REPLACE INTO magic_tokens (token, email, expires_at) VALUES (?, ?, ?)').run(token, email, expires);

    sendMagicLink(email, token);
    json(res, 200, { ok: true, message: 'Magic link sent — check your email' });
  },

  // GET /api/auth/verify?token=xxx — verify magic link, return session
  'GET /api/auth/verify': (req, res, query) => {
    const token = query.get('token');
    if (!token) return json(res, 400, { error: 'Token required' });

    const now = Date.now();
    const magic = db.prepare('SELECT * FROM magic_tokens WHERE token = ? AND expires_at > ?').get(token, now);
    if (!magic) return json(res, 401, { error: 'Invalid or expired token' });

    db.prepare('DELETE FROM magic_tokens WHERE token = ?').run(token);

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(magic.email);
    const sessionToken = createSessionForUser(user.id);

    // Redirect to app with token in hash (client picks it up)
    res.writeHead(302, { Location: `https://bimp.us/app.html#session=${sessionToken}` });
    res.end();
  },

  // GET /api/user — get current user info
  'GET /api/user': (req, res) => {
    const user = getSession(req);
    if (!user) return json(res, 401, { error: 'Unauthorized' });

    const byokUnlocked = user.is_pro || user.credits_spent >= BYOK_CREDIT_THRESHOLD;
    json(res, 200, {
      email: user.email,
      is_pro: !!user.is_pro,
      credits: user.credits,
      credits_spent: user.credits_spent,
      byok_unlocked: byokUnlocked,
      byok_key: byokUnlocked ? user.byok_key : null,
      byok_threshold: BYOK_CREDIT_THRESHOLD,
    });
  },

  // POST /api/user/byok — save BYOK API key
  'POST /api/user/byok': async (req, res) => {
    const user = getSession(req);
    if (!user) return json(res, 401, { error: 'Unauthorized' });

    const byokUnlocked = user.is_pro || user.credits_spent >= BYOK_CREDIT_THRESHOLD;
    if (!byokUnlocked) return json(res, 403, { error: 'BYOK not unlocked yet' });

    const { parsed } = await parseBody(req);
    const key = (parsed.key || '').trim();
    if (!key) return json(res, 400, { error: 'API key required' });

    db.prepare('UPDATE users SET byok_key = ? WHERE id = ?').run(key, user.id);
    json(res, 200, { ok: true });
  },

  // POST /api/credits/use — deduct credits for AI feature use
  'POST /api/credits/use': async (req, res) => {
    const user = getSession(req);
    if (!user) return json(res, 401, { error: 'Unauthorized' });

    const { parsed } = await parseBody(req);
    const amount = parseInt(parsed.amount) || 1;

    if (user.credits < amount) return json(res, 402, { error: 'Insufficient credits', credits: user.credits });

    db.prepare('UPDATE users SET credits = credits - ?, credits_spent = credits_spent + ? WHERE id = ?').run(amount, amount, user.id);
    const updated = db.prepare('SELECT credits, credits_spent FROM users WHERE id = ?').get(user.id);

    const byokUnlocked = user.is_pro || updated.credits_spent >= BYOK_CREDIT_THRESHOLD;
    if (byokUnlocked && !user.byok_unlocked) {
      db.prepare('UPDATE users SET byok_unlocked = 1 WHERE id = ?').run(user.id);
    }

    json(res, 200, { ok: true, credits: updated.credits, credits_spent: updated.credits_spent, byok_unlocked: byokUnlocked });
  },

  // POST /api/webhook — Stripe webhook
  'POST /api/webhook': async (req, res) => {
    const { raw, parsed } = await parseBody(req);

    // Verify Stripe-Signature: header is "t=<timestamp>,v1=<hex hmac>"
    const sigHeader = req.headers['stripe-signature'] || '';
    const parts = Object.fromEntries(sigHeader.split(',').map(p => p.split('=')));
    const timestamp = parts.t;
    const expected = crypto.createHmac('sha256', STRIPE_WEBHOOK_SECRET).update(`${timestamp}.${raw}`).digest('hex');
    if (!timestamp || parts.v1 !== expected) {
      console.warn('Webhook signature mismatch');
      return json(res, 401, { error: 'Invalid signature' });
    }
    if (Math.abs(Date.now() - Number(timestamp) * 1000) > STRIPE_WEBHOOK_TOLERANCE_MS) {
      console.warn('Webhook timestamp outside tolerance');
      return json(res, 401, { error: 'Timestamp too old' });
    }

    if (parsed.type !== 'checkout.session.completed') return json(res, 200, { ok: true });

    const session = parsed.data?.object;
    if (!session) return json(res, 400, { error: 'Invalid payload' });

    const email = session.customer_details?.email?.toLowerCase().trim();
    const amountCents = session.amount_total || 0;
    const sessionId = String(session.id);

    if (!email) return json(res, 400, { error: 'No email in session' });

    // Upsert user
    db.prepare('INSERT OR IGNORE INTO users (email, credits) VALUES (?, 50)').run(email);
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    // Idempotency check
    const existing = db.prepare('SELECT * FROM orders WHERE ls_order_id = ?').get(sessionId);
    if (existing) return json(res, 200, { ok: true, duplicate: true });

    // Record order
    db.prepare('INSERT INTO orders (ls_order_id, user_id, product_id, amount_cents) VALUES (?, ?, ?, ?)').run(sessionId, user.id, String(amountCents), amountCents);

    if (amountCents === STRIPE_AMOUNT_PRO_CENTS) {
      // Pro purchase — unlock BYOK immediately
      db.prepare('UPDATE users SET is_pro = 1, byok_unlocked = 1 WHERE id = ?').run(user.id);
      console.log(`✓ Pro unlocked for ${email}`);
    } else if (CREDITS_MAP[amountCents]) {
      // Credits purchase
      const credits = CREDITS_MAP[amountCents];
      db.prepare('UPDATE users SET credits = credits + ? WHERE id = ?').run(credits, user.id);
      console.log(`✓ Added ${credits} credits for ${email}`);
    } else {
      console.warn(`Unrecognized checkout amount: ${amountCents} cents for ${email}`);
    }

    json(res, 200, { ok: true });
  },

  // POST /api/auth/logout
  'POST /api/auth/logout': (req, res) => {
    const auth = req.headers['authorization'] || '';
    const token = auth.replace('Bearer ', '').trim();
    if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    json(res, 200, { ok: true });
  },
};

// ── Server ────────────────────────────────────────────────────────────────────
http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    return res.end();
  }

  const url = new URL(req.url, 'http://localhost');
  const key = `${req.method} ${url.pathname}`;

  const handler = routes[key];
  if (handler) {
    try {
      await handler(req, res, url.searchParams);
    } catch (err) {
      console.error('Handler error:', err);
      json(res, 500, { error: 'Internal server error' });
    }
  } else {
    json(res, 404, { error: 'Not found' });
  }
}).listen(PORT, () => {
  console.log(`bimp.us API server running on port ${PORT}`);
});
