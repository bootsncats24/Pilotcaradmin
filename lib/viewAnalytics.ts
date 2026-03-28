import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export { VISITOR_COOKIE_NAME } from '@/lib/analyticsConstants';

const BLOB_STORE_NAME = 'site-analytics';
const BLOB_KEY = 'stats';
const DATA_DIR = join(process.cwd(), 'data');
const STATS_FILE = join(DATA_DIR, 'view-stats.json');

export type PersistedViewStats = {
  totalPageViews: number;
  uniqueVisitorIds: string[];
};

const emptyStats = (): PersistedViewStats => ({
  totalPageViews: 0,
  uniqueVisitorIds: [],
});

function normalizeStats(raw: unknown): PersistedViewStats {
  if (!raw || typeof raw !== 'object') return emptyStats();
  const r = raw as Record<string, unknown>;
  const total =
    typeof r.totalPageViews === 'number' && r.totalPageViews >= 0
      ? Math.floor(r.totalPageViews)
      : 0;
  const ids = Array.isArray(r.uniqueVisitorIds)
    ? r.uniqueVisitorIds.filter((x): x is string => typeof x === 'string' && x.length > 0)
    : [];
  return { totalPageViews: total, uniqueVisitorIds: ids };
}

async function readStatsFromFile(): Promise<PersistedViewStats> {
  try {
    if (!existsSync(STATS_FILE)) return emptyStats();
    const raw = await readFile(STATS_FILE, 'utf-8');
    return normalizeStats(JSON.parse(raw));
  } catch {
    return emptyStats();
  }
}

async function writeStatsToFile(stats: PersistedViewStats): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STATS_FILE, JSON.stringify(stats, null, 2), 'utf-8');
}

function useNetlifyBlobs(): boolean {
  return process.env.NETLIFY === 'true';
}

async function readStatsFromBlobs(): Promise<PersistedViewStats | null> {
  if (!useNetlifyBlobs()) return null;
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore(BLOB_STORE_NAME);
    const data = await store.get(BLOB_KEY, { type: 'json' });
    return normalizeStats(data);
  } catch {
    return null;
  }
}

async function writeStatsToBlobs(stats: PersistedViewStats): Promise<boolean> {
  if (!useNetlifyBlobs()) return false;
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore(BLOB_STORE_NAME);
    await store.setJSON(BLOB_KEY, stats);
    return true;
  } catch {
    return false;
  }
}

async function readStats(): Promise<PersistedViewStats> {
  const fromBlob = await readStatsFromBlobs();
  if (fromBlob !== null) return fromBlob;
  return readStatsFromFile();
}

async function writeStats(stats: PersistedViewStats): Promise<void> {
  if (useNetlifyBlobs()) {
    const wroteBlob = await writeStatsToBlobs(stats);
    if (wroteBlob) return;
  }
  await writeStatsToFile(stats);
}

export async function getViewStats(): Promise<{
  totalPageViews: number;
  uniqueVisitors: number;
}> {
  const s = await readStats();
  return {
    totalPageViews: s.totalPageViews,
    uniqueVisitors: s.uniqueVisitorIds.length,
  };
}

export async function recordPageView(visitorId: string): Promise<{
  totalPageViews: number;
  uniqueVisitors: number;
  isNewUnique: boolean;
}> {
  const maxAttempts = 6;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const stats = await readStats();
    const isNew = !stats.uniqueVisitorIds.includes(visitorId);
    const next: PersistedViewStats = {
      totalPageViews: stats.totalPageViews + 1,
      uniqueVisitorIds: isNew
        ? [...stats.uniqueVisitorIds, visitorId]
        : stats.uniqueVisitorIds,
    };
    try {
      await writeStats(next);
      return {
        totalPageViews: next.totalPageViews,
        uniqueVisitors: next.uniqueVisitorIds.length,
        isNewUnique: isNew,
      };
    } catch {
      await new Promise((r) => setTimeout(r, 40 * (attempt + 1)));
    }
  }
  throw new Error('recordPageView: failed after retries');
}
