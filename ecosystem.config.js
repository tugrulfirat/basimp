module.exports = {
  apps: [{
    name: 'bimp-api',
    script: '/var/www/basimp/server.js',
    env: {
      NODE_ENV: 'production',
      // STRIPE_WEBHOOK_SECRET is intentionally not set here — export it in the
      // shell/service environment before `pm2 start` (e.g. from /etc/bimp-api.env)
      // so the secret never lands in this committed file.
    }
  }]
};
