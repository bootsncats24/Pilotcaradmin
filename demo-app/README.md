# Pilot Car Admin - Web Demo

This is a web-compatible version of Pilot Car Admin that runs in the browser using IndexedDB and SQL.js.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Architecture

- **Database**: SQL.js with IndexedDB backend
- **API Mock**: `src/api/electronMock.ts` - Mocks all Electron APIs
- **Database Service**: `src/services/databaseWeb.ts` - Web-compatible database operations
- **Demo Data**: `src/data/demoSeeder.ts` - Pre-populated sample data

## Integration with Full App

To use the full app components from `src/renderer/`, copy them to `demo-app/src/` and ensure:

1. All imports use the web-compatible services
2. Replace `DatabaseService` imports with the web version
3. Update any Electron-specific code to use the mocked APIs
4. Test all features work in the browser

## Demo Features

- Full database functionality using SQL.js
- Pre-populated demo data
- All Electron APIs mocked for browser compatibility
- Receipt storage in IndexedDB
- Authentication using localStorage
