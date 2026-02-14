# FuelEU Maritime Compliance Dashboard

A full-stack web application for managing FuelEU Maritime regulation compliance, featuring route tracking, GHG intensity monitoring, compliance banking, and pooling.

Built with **Hexagonal Architecture** (Ports & Adapters) to ensure domain logic isolation and testability.

---

## 🚀 Tech Stack

### Frontend
- **Framework:** React 18 + Vite
- **Language:** TypeScript
- **Styling:** TailwindCSS + Custom Design System
- **State Management:** React Hooks
- **Testing:** Vitest + React Testing Library
- **Icons:** Lucide React
- **Charts:** Recharts

### Backend
- **Runtime:** Node.js
- **Framework:** Express
- **Language:** TypeScript
- **Architecture:** Hexagonal (Core / Ports / Adapters)
- **Database:** PostgreSQL (simulated with in-memory repository for assignment)
- **Testing:** Vitest + Supertest

---

## 🏛️ Architecture

The backend follows strictly decoupled **Hexagonal Architecture**:

```
src/
├── core/                  # Pure Domain Logic (No dependencies on database/HTTP)
│   ├── domain/            # Entities (Route, ComplianceBalance) & Services
│   ├── application/       # Use Cases (GetRoutes, BankSurplus)
│   └── ports/             # Interfaces for Inbound/Outbound adapters
├── adapters/              # Infrastructure Layer
│   ├── inbound/           # HTTP Controllers (Express)
│   └── outbound/          # Repositories (Postgres/Memory)
└── infrastructure/        # Dependency Injection & App Setup
```

The frontend mirrors this structure for maintainability, separating UI components from domain logic and API integration.

---

## 🛠️ Setup & Running

### Prerequisites
- Node.js (v18+)
- npm

### 1. Backend
```bash
cd backend
npm install
npm run dev
```
Runs on `http://localhost:3000`.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`.

---

## ✅ Running Tests

The project includes comprehensive unit and integration tests (97 tests total).

### Backend Tests (68 tests)
```bash
cd backend
npm test
```

### Frontend Tests (29 tests)
```bash
cd frontend
npm test
```

---

## 📦 Features

### 1. Routes & Voyage Data
- View all vessel routes.
- Filter by **Year**, **Vessel Type**, and **Fuel Type**.
- Set a **Baseline Route** for comparison.
- Distance displayed in **km**.

### 2. Compliance Comparison
- Compare any route against the selected baseline.
- Visual **Bar Chart** showing GHG intensity vs 89.34 Target.
- Key metrics: **% Difference**, **Savings**, and **Compliant Status (✅/❌)**.

### 3. Banking (Article 20)
- View current **Compliance Balance (CB)** for each ship.
- **Deposit**: Bank surplus CB to the compliance bank.
- **Withdraw**: Apply banked CB to offset deficits.
- Validates that you cannot bank negative stats or withdraw more than you have.

### 4. Pooling (Article 21)
- Create pools of vessels to average their GHG intensity.
- Validates that the total pool compliance is positive.
- Visual indicator of total pooled balance.

---

## 🎨 Design System

The UI features a custom "Coastal Warmth" palette:
- **Primary:** Deep Oceanic Blue (`#0f172a`)
- **Accent:** Signal Orange (`#f97316`)
- **Surface:** Sand & Warm Greys (`#fefdfb`, `#f5f5f4`)

Includes full accessibility support (ARIA roles, focus states, keyboard navigation).
