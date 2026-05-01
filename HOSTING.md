# 🖥️ Self-Hosting Setup Guide (KOVA System)

## 📦 Project Structure

```
apps/
  backend/
  apply-web/
  admin-web/
  discord-bot/
```

* Each app has its own:

  * `package.json`
  * `.env`
  * fixed port

---

# 🌐 Goal

Make your local system publicly accessible using:

* Your own laptop
* Your domains
* Clean routing setup

---

# 🧠 Architecture Overview

```
Internet
   ↓
Domain (app/api/admin)
   ↓
NGINX (Port 80/443)
   ↓
Local Ports (3000 / 3001 / 3002)
   ↓
Your Apps
```

---

# 🔧 1. Router Setup (Port Forwarding)

Open only these ports:

| Port | Purpose |
| ---- | ------- |
| 80   | HTTP    |
| 443  | HTTPS   |

Forward them to your PC’s local IP (e.g. 192.168.x.x)

---

# 🌍 2. Domain Setup (Strato)

Set DNS A Records:

```
@      → YOUR_PUBLIC_IP
app    → YOUR_PUBLIC_IP
admin  → YOUR_PUBLIC_IP
api    → YOUR_PUBLIC_IP
```

---

# 🔁 3. Backend Usage

### ✅ Correct Setup

* Backend runs on: `localhost:3001`
* Websites call:

```
https://api.yourdomain.com
```

* Bot calls:

```
http://localhost:3001
```

### ❌ Do NOT expose:

```
http://your-ip:3001
```

---

# ⚡ 4. Next.js Setup

## Development (current)

```
npm run dev
```

## Production (IMPORTANT)

```
npm run build
npm start
```

---

# 🔀 5. NGINX Reverse Proxy

## Example config:

```
server {
    server_name app.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
    }
}

server {
    server_name admin.yourdomain.com;

    location / {
        proxy_pass http://localhost:3002;
    }
}

server {
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
    }
}
```

---

# 🔐 6. HTTPS (SSL)

Install Certbot and run:

```
certbot --nginx
```

This enables:

```
https://yourdomain.com
```

---

# ⚙️ 7. Process Manager (PM2)

## Install:

```
npm install -g pm2
```

---

## Create `ecosystem.config.js`

```
module.exports = {
  apps: [
    {
      name: "backend",
      cwd: "apps/backend",
      script: "npm",
      args: "start",
    },
    {
      name: "apply-web",
      cwd: "apps/apply-web",
      script: "npm",
      args: "start",
    },
    {
      name: "admin-web",
      cwd: "apps/admin-web",
      script: "npm",
      args: "start",
      env: {
        PORT: 3002
      }
    },
    {
      name: "discord-bot",
      cwd: "apps/discord-bot",
      script: "npm",
      args: "start",
    }
  ]
};
```

---

## Start everything:

```
pm2 start ecosystem.config.js
```

---

## Auto-start on reboot:

```
pm2 startup
pm2 save
```

---

## Useful commands:

```
pm2 list
pm2 logs
pm2 restart all
pm2 stop all
```

---

# ⚠️ Important Notes

## 🔸 Discord Bot

* Works globally without port forwarding
* No special setup needed

---

## 🔸 Backend Security

* Keep backend on localhost
* Only expose via NGINX

---

## 🔸 Next.js API Calls

❌ Wrong:

```
http://localhost:3001
```

✅ Correct:

```
https://api.yourdomain.com
```

---

## 🔸 Ports Example

| Service   | Port |
| --------- | ---- |
| apply-web | 3000 |
| backend   | 3001 |
| admin-web | 3002 |

---

## 🔸 5G Fallback Warning

* Some mobile networks use CGNAT
* Port forwarding may NOT work on 5G
* Main connection should be fine

---

# 🚀 Final Setup Summary

* Laptop runs all apps
* PM2 manages processes
* NGINX routes traffic
* Router exposes ports 80/443
* Domains point to your IP

---

# ✅ You’re Done

This setup is:

* Scalable
* Clean
* Production-ready
* Similar to real-world systems

---
