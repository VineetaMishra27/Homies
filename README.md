# Homies – PG Finder Platform

## Setup Instructions

### Requirements
- Node.js 18+ (download from https://nodejs.org)
- npm (comes with Node.js)

### Steps to Run

1. **Open this folder in VS Code**

2. **Open the Terminal** in VS Code (Ctrl+` or View → Terminal)

3. **Install dependencies:**
   ```
   npm install
   ```

4. **Start the development server:**
   ```
   npm run dev
   ```

5. **Open in browser:**
   The terminal will show a URL like `http://localhost:5173`
   Click it or paste it in your browser.

### That's it! The website should be running.

---

## Project Structure

```
homies/
├── index.html              # Entry HTML
├── package.json            # Dependencies
├── vite.config.js          # Vite config
└── src/
    ├── main.jsx            # React entry
    ├── App.jsx             # Root app + router
    ├── data.js             # All 18 Mumbai PG listings
    ├── styles.js           # Shared colors & styles
    ├── index.css           # Global CSS
    ├── components/
    │   ├── Navbar.jsx      # Top navigation
    │   ├── PGCard.jsx      # Property card
    │   ├── PGModal.jsx     # Property detail modal
    │   ├── AuthModal.jsx   # Login / Signup modal
    │   └── Toast.jsx       # Notification toast
    └── pages/
        ├── HomePage.jsx    # Landing page
        ├── ListingsPage.jsx # Browse all PGs
        ├── PricingPage.jsx # Owner subscription plans
        ├── ListPropertyPage.jsx # Owner listing form
        └── CitiesPage.jsx  # All cities
```

## Features
- 18 real Mumbai PGs (Zolo, individual owners) with real prices
- Student & Owner login/signup with OTP verification
- ID verification (Aadhaar/PAN/DL/Passport)
- Filters: area search, gender, BHK, max rent slider
- PG detail modal with image gallery, amenities, nearby colleges
- Contact owner (requires login)
- Owner listing flow (3-step)
- Subscription pricing: 1BHK ₹99/mo, 2BHK ₹199/mo, 3-4BHK ₹349/mo
- 10% discount on 3-month, 18% on yearly plans
- Cities page with 12 cities
