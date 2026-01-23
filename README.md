# Labubu Locator 🐰

> **The specialized market tracker for Pop Mart Labubu collectors.**  
> Aggregate market data, manage your personal collection, and track real-time pricing across platforms.

![Labubu Locator Hero](https://labubulocator.me/assets/hero-banner-BYcVz-xF.jpg)

## 🚀 Overview

**Labubu Locator** is a dedicated tracker built to streamline how collectors follow the Labubu market. By pulling data from marketplaces like eBay and StockX, it provides a unified interface for checking current values, comparing prices, and keeping an organized inventory of variants.

The project is built on a modern **TypeScript Monorepo** architecture, emphasizing end-to-end type safety, reliable data synchronization, and a clean, responsive user experience. It’s designed to be a practical tool for collectors while showcasing a robust full-stack development workflow.

---

## 🛠️ Technology & Architecture

Built with a focus on **Type Safety**, **Reliable Syncing**, and **Clean State Management**.

### 🏗️ TypeScript Monorepo
The project uses a shared `common` package to sync schemas between the API and the UI. This ensures that data structures are consistent across the entire stack, making the development process more predictable and reducing runtime errors.

### 🎨 Frontend: Fast & Responsive
- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/) for a high-performance development environment and optimized production builds.
- **State & Data**: [TanStack Query v5](https://tanstack.com/query/latest) for efficient data fetching, caching, and state synchronization.
- **UI & Styling**: 
  - **Tailwind CSS**: For custom, responsive layouts.
  - **Shadcn/UI**: High-quality, accessible UI components.
  - **GSAP**: Subtle animations to enhance the interface feel.

### ⚙️ Backend: Data Management
- **Runtime**: [Node.js](https://nodejs.org/) (ESNext) with strict TypeScript.
- **API Engine**: Express.js with a modular repository pattern to keep business logic organized.
- **Sync Engine**: A managed background service using `node-cron` and `p-limit` to pull marketplace data from the eBay Browse API while respecting rate limits.
- **Validation**: [Zod](https://zod.dev/) for schema-based data validation at the API boundary.
- **Storage**: SQLite for a fast, portable, and reliable data layer.

---

## ✨ Key Features

1.  **Cross-Platform Pricing**: Track current "Floor Prices" and estimated values aggregated from multiple secondary markets.
2.  **Collection Tracking**: Manage your personal collection and favorites with local storage persistence and shareable links.
3.  **Market Value Estimation**: An internal logic layer that helps filter and weight marketplace listings to provide a realistic "market value" for each variant.
4.  **Advanced Filtering**: Search and filter by series, rarity grade, SKU, or availability status.
5.  **Admin Tools**: Integrated dashboard for managing the product catalog, updating prices manually, and handling image assets.

---

## 🏁 Getting Started

### Prerequisites
- **Node.js** (v18.0+)
- **NPM** (v9.0+)

### Installation

1.  **Clone and Install:**
    ```bash
    git clone https://github.com/thijsvndmeer/labubulocator.git
    cd labubulocator
    npm install
    ```

2.  **Environment Setup:**
    Create a `.env` file in `backend/`:
    ```bash
    PORT=3001
    EBAY_APP_ID=your_id
    EBAY_CERT_ID=your_cert
    ADMIN_SECRET_TOKEN=your_token
    KICKS_DEV_API_KEY=your_key
    ```

### Running the Project

The workspace manages all components from the root.

**Start Backend:**
```bash
npm run dev:backend
```

**Start Frontend:**
```bash
npm run dev:frontend
```

---

## 📂 Project Structure

```text
labubulocator/
├── backend/          # API, database management, and sync services
├── frontend/         # React application and UI components
├── common/           # Shared types, interfaces, and Zod schemas
└── package.json      # Monorepo configuration
```

---

## 📄 License
This project is licensed under the ISC License.
