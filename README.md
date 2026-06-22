# 💸 EMI Dashboard — Debt & Repayment Analytics

A private, installable (PWA) personal debt dashboard built with **Next.js 14 + TypeScript**.
Clean, **Google data-studio style** light UI. Sign in → see exactly how much you owe, what's
due, **when each loan closes**, and **when your monthly burden drops**. Everything updates
automatically as the months pass.

## ✨ Features

- 🔐 **Login** — single password, only you can see your data
- 📱 **PWA** — installable, app-like on mobile ("Add to Home Screen")
- 📊 **Multiple views everywhere** — Chart view, Graph view and Table view for the same data
- 🟢 **Status on everything** — every loan, payment and month carries a live status chip
- 🎯 **Relief timeline** — when each loan closes and how much EMI you free up
- 🗓️ **Month-by-month schedule** — every EMI from now until you are debt-free, fully detailed
- 📈 Bar, stacked-area, line and donut charts (Recharts) + Framer Motion animations
- 💡 Light, accessible Material/Google-style design, fully responsive

## 🚀 Run it

```bash
cd emi-dashboard
npm install
npm run dev
```

Open **http://localhost:3000** → the sign-in page appears.

**Default password:** `kishan`

The dev server also binds to your local network, so you can open it on your phone (same Wi-Fi)
at `http://<your-PC-IP>:3000`.

### Change the password (recommended)

Edit `.env.local`:

```env
APP_PASSWORD=your-strong-password
APP_SESSION_SECRET=any-long-random-string
```

Restart `npm run dev` after changing.

## ✏️ Update your data

Everything lives in one file → **`lib/data.ts`**

```ts
{ id: "ring", name: "Ring", short: "RG",
  emi: 2969, dueDay: 24, remaining: 12, asOf: "2026-06-22",
  color: "#9334e6", accent: "#d7aefb" }
```

- `emi` — monthly amount
- `dueDay` — day of the month the EMI is debited
- `remaining` — how many EMIs are left (as of the `asOf` date)
- `asOf` — the date on which `remaining` was correct

The dashboard counts forward from `asOf`, so numbers update on their own as months pass.
Finished a loan? Set `remaining: 0`.

## 📱 Install as an app (PWA)

1. `npm run build && npm run start` (or deploy to Vercel)
2. Open the site in your phone/laptop browser
3. **Add to Home Screen** / **Install app**

> A fully installable, offline PWA needs HTTPS (or localhost). Over a plain-HTTP LAN address you
> get a basic home-screen shortcut. For a real installable app from anywhere, deploy to Vercel.

## 🌐 Deploy (Vercel — free, HTTPS)

```bash
npm i -g vercel
vercel
```

Add the environment variables `APP_PASSWORD` and `APP_SESSION_SECRET` in the Vercel dashboard.

## 🛠 Tech

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Recharts · lucide-react

---
*Amounts are EMI × remaining installments = total cash payable. (Interest is not modelled separately
because the data is given as EMI × count.)*
