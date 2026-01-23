# Labubu Locator 🐰

> **The definitive analytics platform for Pop Mart Labubu collectors.**  
> Aggregate market data, optimize your collection, and gain cross-platform pricing insights.

![Labubu Locator Hero](https://labubulocator.me/assets/hero-banner-BYcVz-xF.jpg)

## 🚀 Overview

**Labubu Locator** is a high-performance, full-stack ecosystem engineered to solve the fragmentation of the collectible market. By orchestrating data from major marketplaces like eBay and StockX, it provides collectors with a unified command center for tracking market values and managing high-value inventory.

This project demonstrates an enterprise-grade **TypeScript Monorepo** architecture, focusing on strict type safety across the network boundary, automated data harvesting, and a high-fidelity reactive user interface.

---

## 🛠️ Technology & Infrastructure

Built with a focus on **Type Safety**, **Predictable State**, and **Scalable Data Flows**.

### 🏗️ Unified TypeScript Monorepo
Leverages a shared `common` package to enforce contract consistency between the API and the UI. This ensures that every field in the data layer is perfectly mirrored in the frontend, eliminating runtime type mismatches.

### 🎨 Frontend: Reactive Performance
- **Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/) for sub-second hot module replacement.
- **Server-State Orchestration**: [TanStack Query v5](https://tanstack.com/query/latest) for robust caching, background synchronization, and optimistic UI updates.
- **Design System**: 
  - **Tailwind CSS**: Precision utility-first styling.
  - **Shadcn/UI**: Accessible Radix-based primitives.
  - **GSAP**: High-performance cinematic animations and micro-interactions.

### ⚙️ Backend: Automated Data Pipelines
- **Runtime**: [Node.js](https://nodejs.org/) (ESNext) with strict TypeScript compilation.
- **API Engine**: Express.js with structured repository patterns and middleware-driven security.
- **Intelligent Sync Engine**: A custom-built scheduler utilizing `node-cron` and `p-limit` for controlled, rate-limited aggregation of marketplace data via the eBay Browse API.
- **Validation Layer**: [Zod](https://zod.dev/) schema enforcement for total runtime data integrity.
- **Storage**: Light-weight, high-concurrency SQLite database with custom repository abstractions.

---

## ✨ Key Capabilities

1.  **Cross-Platform Market Insights**: Real-time aggregation of "Floor Price" and "Estimated Market Value" across multiple secondary markets.
2.  **Inventory Management**: Advanced system to track personal collections, watchlists, and acquisition status.
3.  **Algorithmic Value Estimation**: Proprietary logic that sanitizes and weighs inconsistent marketplace listings to provide a reliable "true value" metric.
4.  **Complex Multi-Criteria Filtering**: Sophisticated search architecture allowing granular discovery by series, rarity, SKU, and availability.
5.  **Administrative Command Center**: Enterprise dashboard for full catalog control, image asset management, and system-wide settings.

---

## 🏁 Installation & Development

### Prerequisites
- **Node.js** (v18.0+)
- **NPM** (v9.0+)

### Setup

1.  **Clone and Install:**
    ```bash
    git clone https://github.com/thijsvndmeer/labubulocator.git
    cd labubulocator
    npm install
    ```

2.  **Environment Configuration:**
    Create a `.env` file in `backend/`:
    ```bash
    PORT=3001
    EBAY_APP_ID=your_id
    EBAY_CERT_ID=your_cert
    ADMIN_SECRET_TOKEN=your_token
    KICKS_DEV_API_KEY=your_key
    ```

### Running the Ecosystem

The project uses NPM workspaces to manage all components from the root.

**Start Backend:**
```bash
npm run dev:backend
```

**Start Frontend:**
```bash
npm run dev:frontend
```

**Full Production Build:**
```bash
npm run build
```

---

## 📂 Architecture Layout

```text
labubulocator/
├── backend/          # Enterprise API & Data Synchronization
│   ├── src/
│   │   ├── services/ # Business Logic & API Aggregation
│   │   ├── routes/   # Express Controller Layer
│   │   └── lib/      # Infrastructure & Database
├── frontend/         # Reactive UI & Client State Management
│   ├── src/
│   │   ├── pages/    # Optimized View Layers
│   │   ├── hooks/    # Reusable Component Logic
│   │   └── lib/      # Managed API Clients
├── common/           # Shared Schema & Interface Registry
└── package.json      # Monorepo Orchestration
```

---

## 📄 License
This project is licensed under the ISC License.
