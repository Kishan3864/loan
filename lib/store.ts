import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_LOANS, Loan } from "./data";
import { hashPassword } from "./password";

export type StoredCredential = {
  id: string; // base64url credential id
  publicKey: string; // base64url
  counter: number;
  transports?: string[];
  name: string;
  createdAt: string;
};

export type Settings = {
  autoLockMinutes: number;
};

export type StoreData = {
  passwordHash: string;
  loans: Loan[];
  credentials: StoredCredential[];
  settings: Settings;
};

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "server-data");
const FILE = path.join(DATA_DIR, "store.json");

let cache: StoreData | null = null;

function seed(): StoreData {
  return {
    passwordHash: hashPassword(process.env.APP_PASSWORD || "kishan"),
    loans: DEFAULT_LOANS.map((l) => ({ ...l })),
    credentials: [],
    settings: { autoLockMinutes: 5 },
  };
}

async function persist(): Promise<void> {
  if (!cache) return;
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(cache, null, 2), "utf8");
  await fs.rename(tmp, FILE);
}

async function ensure(): Promise<StoreData> {
  if (cache) return cache;
  try {
    cache = JSON.parse(await fs.readFile(FILE, "utf8")) as StoreData;
  } catch {
    cache = seed();
    await persist();
  }
  // backfill any missing fields for forward-compat
  if (!cache.settings) cache.settings = { autoLockMinutes: 5 };
  if (typeof cache.settings.autoLockMinutes !== "number") cache.settings.autoLockMinutes = 5;
  if (!Array.isArray(cache.credentials)) cache.credentials = [];
  if (!Array.isArray(cache.loans)) cache.loans = DEFAULT_LOANS.map((l) => ({ ...l }));
  if (!cache.passwordHash) cache.passwordHash = hashPassword(process.env.APP_PASSWORD || "kishan");
  return cache;
}

export async function getStore(): Promise<StoreData> {
  return ensure();
}

export async function updateStore(mut: (s: StoreData) => void): Promise<StoreData> {
  const s = await ensure();
  mut(s);
  await persist();
  return s;
}
