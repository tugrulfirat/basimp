# rapidlander.com reboot recovery

`rapidlander.com` and `bimp.us` resolve to the same server (`89.167.35.53`). If nginx is returning `502` for rapidlander while bimp works, nginx is up but rapidlander's upstream process is not listening.

## Restore access

Use the Hetzner Cloud Console first, because SSH port 22 is currently timing out:

1. Open the server in https://console.hetzner.cloud.
2. Check firewall rules for inbound TCP 22 from your current IP.
3. If SSH still fails, open the browser console or boot rescue mode.

## Diagnose on the server

```bash
sudo nginx -t
sudo systemctl status nginx --no-pager
sudo grep -R "rapidlander" /etc/nginx/sites-enabled /etc/nginx/sites-available
sudo ss -ltnp
pm2 list || true
```

The nginx config shows which local port rapidlander proxies to. `ss -ltnp` should show a Node process listening on that port. If it does not, start the app.

## Quick PM2 recovery

```bash
pm2 resurrect || true
pm2 list
```

If rapidlander appears and the site starts working:

```bash
pm2 save
pm2 startup systemd -u "$USER" --hp "$HOME"
```

Run the exact command printed by `pm2 startup`.

If rapidlander is not in PM2:

```bash
cd /var/www/rapidlander
npm install --omit=dev
pm2 start ecosystem.config.js || pm2 start npm --name rapidlander -- start
pm2 save
pm2 startup systemd -u "$USER" --hp "$HOME"
```

Run the exact command printed by `pm2 startup`.

## systemd alternative

Copy the service template from this repo:

```bash
sudo cp ops/systemd/rapidlander.service /etc/systemd/system/rapidlander.service
sudo systemctl daemon-reload
sudo systemctl enable --now rapidlander
sudo systemctl status rapidlander --no-pager
```

If rapidlander does not live at `/var/www/rapidlander` or does not start with `npm start`, edit `WorkingDirectory` and `ExecStart` before enabling the service.

Validate:

```bash
curl -I http://127.0.0.1:<rapidlander-upstream-port>
curl -I https://rapidlander.com
```
