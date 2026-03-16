 ---
name: Live Demo Implementation
overview: ""
todos: []
---

# Live Demo Implementation Plan

## Overview

Create a fully interactive web demo of Pilot Car Admin that can be embedded in an iframe on the marketing website. The demo will run in the browser using mocked Electron APIs and IndexedDB for storage.

## Architecture

```mermaid
flowchart TD
    A[Marketing Website] -->|iframe| B[/demo Route]
    B --> C[Web Demo App]
    C --> D[Electron API Mock]
    C --> E[IndexedDB Storage]
    C --> F[Demo Data Seeder]
    D --> G[Browser File API]
    D --> H[License Mock Always Valid]
    E --> I[Pre-populated Sample Data]
```

## Implementation Steps

### 1. Create Demo Route Structure

**Files to create:**
- `marketing-website/app/demo/page.tsx` - Demo page wrapper with iframe controls
- `marketing-website/app/demo/layout.tsx` - Layout without Navbar/Footer for iframe
- `marketing-website/demo-app/` - New directory for web-compatible app

### 2. Create Web-Compatible App

**Location:** `marketing-website/demo-app/`

**Key components:**
- Copy React components from `src/renderer/` (pages, components, services)
- Create `demo-app/src/api/electronMock.ts` - Mock implementation of `window.electronAPI`
- Create `demo-app/src/services/databaseWeb.ts` - IndexedDB-based database service
- Create `demo-app/src/data/demoSeeder.ts` - Pre-populate demo data

### 3. Electron API Mock Implementation

**File:** `demo-app/src/api/electronMock.ts`

Mock all Electron APIs:
- **Database**: Use IndexedDB with SQL.js for SQLite compatibility
- **File System**: Use browser File API and IndexedDB for receipt storage
- **License**: Always return valid (skip validation for demo)
- **Sync**: Mock sync operations (no-op or simulated)
- **Auth**: Use localStorage for session management
- **OCR**: Use Tesseract.js directly (already browser-compatible)

### 4. Database Service for Web

**File:** `demo-app/src/services/databaseWeb.ts`

- Initialize SQL.js with IndexedDB backend
- Create all tables matching the Electron app schema
- Implement same query interface as `DatabaseService`
- Handle database initialization

### 5. Demo Data Seeder

**File:** `demo-app/src/data/demoSeeder.ts`

Pre-populate with realistic sample data:
- 5-10 sample customers
- 3-5 destinations
- 10-15 invoices (mix of statuses)
- 5-10 transactions/expenses
- 3-5 mileage entries
- Sample categories and receipts

### 6. Integration with Marketing Website

**Update files:**
- `marketing-website/components/sections/Hero.tsx` - Add "Try Live Demo" button
- `marketing-website/components/sections/Features.tsx` - Add demo links to features
- Create `marketing-website/components/demo/DemoEmbed.tsx` 