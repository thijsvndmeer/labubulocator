# Labubu Locator 🐰

> **The ultimate companion for Pop Mart Labubu collectors.**  
> Track prices, analyze trends, and manage your collection with real-time market data.

![Labubu Locator Hero](https://labubulocator.me/assets/hero-banner-BYcVz-xF.jpg)

## 🚀 Overview

**Labubu Locator** is a sophisticated full-stack application designed to aggregate, analyze, and visualize market data for Labubu collectibles. By integrating with major marketplaces like eBay, it provides collectors with actionable insights, historical price trends, and "volatility" metrics to make informed buying and selling decisions.

This project serves as a comprehensive portfolio piece demonstrating a modern, high-performance **TypeScript Monorepo** architecture using **Bun**, **React**, and **Node.js**.

---

## 🛠️ Tech Stack & Architecture

This project is built with a focus on **developer experience (DX)**, **type safety**, and **runtime performance**.

### 🏗️ Monorepo Structure (Bun Workspaces)
The codebase uses **Bun** as a connected runtime and package manager, managing `backend`, `frontend`, and `common` packages in a unified workspace. This ensures 100% type safety across the network boundary—types defined in `common` are consumed by both API and UI.

### 🎨 Frontend (Modern & Reactive)
- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/) for lightning-fast HMR and bundling.
- **State Management**: [TanStack Query](https://tanstack.com/query/latest) for robust server-state synchronization, caching, and optimistic updates.
- **UI System**:
  - **Tailwind CSS**: For utility-first, responsive styling.
  - **Shadcn/UI & Radix Primitives**: For accessible, reliable, unrestricted component design.
  - **Recharts**: For rendering complex price history and volatility charts.
  - **Framer Motion / GSAP**: For smooth, high-fidelity micro-interactions and improved UX.

### ⚙️ Backend (Robust & Scalable)
- **Runtime**: **Bun** (compatible with Node APIs) for superior startup times and script execution.
- **API Framework**: Express.js with custom middleware for high-performance routing.
- **Data Layer**:
  - **SQLite**: Lightweight yet powerful database solution, perfect for reading heavy workloads and rapid prototyping.
  - **Custom Repositories**: A clean abstraction layer separating business logic from direct DB access.
- **Validation**: [Zod](https://zod.dev/) for runtime schema validation, ensuring API inputs and outputs match TypeScript interfaces perfectly.
- **Sync Engine**: A custom-built scheduler (`node-cron`) that manages rate-limited scraping and API calls (eBay Browse API) using concurrency control (`p-limit`).

---

## ✨ Key Features

1.  **Live Market Data**: Automatically syncs listings from eBay and other sources to provide "Lowest Price" and "Average Price" metrics.
2.  **Price History Charts**: Visualizes value trends over time, helping identifying "dips" and "spikes".
3.  **Collection Management**: Users can "Watch" variants or add them to their personal collection.
4.  **Smart Filtering**: Advanced search by series, release date, and price range.
5.  **Admin Dashboard**: comprehensive control over product database, user roles, and system navigation.

---

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- **Bun** (v1.0+): [Install Bun](https://bun.sh/)
- **Node.js** (Optional, but recommended for some legacy tool compatibility)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/labubulocator.git
    cd labubulocator
    ```

2.  **Install dependencies:**
    Since this is a Bun workspace, one command installs everything.
    ```bash
    bun install
    ```

### Configuration

1.  **Backend Environment:**
    Create a `.env` file in `backend/`:
    ```env
    PORT=3001
    EBAY_APP_ID=your_ebay_app_id
    EBAY_CERT_ID=your_ebay_cert_id
    ADMIN_SECRET_TOKEN=secure_token_for_admin_access
    ```

2.  **Frontend Environment:**
    (Optional) Create a `.env` file in `frontend/` if you need to override API endpoints.

### Running the Project

You can run the frontend and backend independently or together.

**Backend Development:**
```bash
# From root
bun run dev:backend
```

**Frontend Development:**
```bash
# From root
bun run dev:frontend
```

**Build for Production:**
```bash
bun run build
```

---

## 📂 Project Structure

```text
labubulocator/
├── backend/          # Express API, Sync Logic, Database
│   ├── src/
│   │   ├── services/ # Business logic (Sync, Price Calc)
│   │   ├── routes/   # API endpoints
│   │   └── lib/      # DB Connection
├── frontend/         # React + Vite Application
│   ├── src/
│   │   ├── pages/    # Main Views
│   │   ├── components/ # Reusable UI components
│   │   └── lib/      # API Clients & Util
├── common/           # Shared TypeScript Types & interfaces
└── package.json      # Workspace configuration
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.
