# split, bill tracker

split bills without the awkward chasing. create a bill, share a payment link via whatsapp, and track who paid. no accounts required.

built for the [kracked devs split bill & payment tracker bounty](https://krackeddevs.com/code/bounty/split-bill-payment-tracker-web-app).

## how it works

1. **create a bill**, title, total amount (rm), participants, optional due date and description
2. **share the link**, copy or send via whatsapp. each participant gets a unique payment page
3. **members confirm**, one tap to mark "i paid". no login needed
4. **track progress**, dashboard shows collected, remaining, paid/unpaid list. auto-refreshes every 10s

## tech stack

- **frontend**: next.js 16 (app router), tailwind css, typescript
- **backend**: appwrite (database + document storage, singapore region)
- **deployment**: vercel
- **fonts**: inter + geist mono

## design

dark theme with orange accent (#f97316). lowercase text throughout. green for paid, orange for pending. confetti animation when all participants have settled.

## pages

| route | description |
|---|---|
| `/` | create a new bill |
| `/bill/[slug]` | public payment page for participants |
| `/dashboard/[slug]` | organizer dashboard with live tracking |

## local dev

```bash
npm install
cp .env.example .env.local  # add your appwrite credentials
npm run dev
```

## env vars

```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_BILLS_COLLECTION=sb_bills
NEXT_PUBLIC_APPWRITE_PARTICIPANTS_COLLECTION=sb_participants
```

## features

- bill creation with participants management
- unique shareable payment link per bill
- one-tap payment confirmation (simulated)
- real-time dashboard with auto-refresh
- progress bar with collected/remaining stats
- whatsapp share integration
- confetti celebration when all paid
- dark mode, mobile-friendly
- staggered animations, toast notifications
- no accounts or login required

## license

mit
