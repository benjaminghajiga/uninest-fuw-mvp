import { useState, useEffect } from 'react';

const STORAGE_KEY = 'uninest_fuw_mvp_v1';
const API_BASE = '/api';

const emptyState = {
  beds: [],          // { id, block, gender, room, bedNum, status, occupant: null }
  applications: [],  // { id, matric, name, year, gender, state, disability, status, allocatedBedId }
  listings: [],      // { id, title, price, type, distance, landlordId, status, features }
  landlords: [],     // { id, name, phone, nin, address, kycStatus }
  transactions: [],  // { id, name, type, amount, status, escrow, date }
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(emptyState);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(emptyState), ...parsed };
  } catch {
    return structuredClone(emptyState);
  }
}

function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors (quota, privacy mode, etc.)
  }
}

let listeners = [];
let state = load();
let initialized = false;
let initPromise = null;

function notify() {
  listeners.forEach((l) => l(state));
}

function setState(updater) {
  state = typeof updater === 'function' ? updater(state) : updater;
  save(state);
  notify();
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message = json?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }
  return json;
}

async function refreshState() {
  try {
    const remote = await fetchJson(`${API_BASE}/state`);
    state = { ...structuredClone(emptyState), ...remote };
    save(state);
    notify();
  } catch (error) {
    console.warn('Failed to hydrate backend state:', error.message);
  } finally {
    initialized = true;
  }
}

function ensureInitialized() {
  if (!initPromise) {
    initPromise = refreshState();
  }
  return initPromise;
}

function postJson(path, body) {
  return fetchJson(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function putJson(path, body) {
  return fetchJson(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function useStore() {
  const [local, setLocal] = useState(state);

  useEffect(() => {
    listeners.push(setLocal);
    ensureInitialized();
    return () => {
      listeners = listeners.filter((l) => l !== setLocal);
    };
  }, []);

  return local;
}

let idCounter = Date.now();
export function genId(prefix) {
  idCounter += 1;
  return `${prefix}_${idCounter}`;
}

// ---- Bed inventory ----
export async function addBeds({ block, gender, roomsFrom, roomsTo, bedsPerRoom }) {
  const newBeds = await postJson('/beds', { block, gender, roomsFrom, roomsTo, bedsPerRoom });
  setState((s) => ({ ...s, beds: [...s.beds, ...newBeds] }));
  return newBeds;
}

export function resetAll() {
  setState(() => structuredClone(emptyState));
}

// ---- Applications & Allocation Engine ----
const PRIORITY_VALUE = (app) => {
  let score = 0;
  if (app.disability && app.disability !== 'None') score += 100;
  if (app.year === 'Year 1') score += 50;
  if (app.state === 'Other (distant)') score += 25;
  return score;
};

export async function submitApplication(app) {
  const application = await postJson('/applications', {
    matric: app.matric,
    name: app.name,
    year: app.year,
    gender: app.gender,
    state: app.state,
    disability: app.disability,
  });
  setState((s) => ({ ...s, applications: [...s.applications, application] }));
  return application;
}

// Core allocation algorithm: runs against real bed inventory
export async function runAllocationEngine(applicationId) {
  const result = await postJson(`/allocate/${applicationId}`, {});
  await refreshState();
  return result;
}

// Returns pending applications sorted by priority (highest first), FIFO within same priority
export function getPendingQueue() {
  return state.applications
    .filter((a) => a.status === 'pending')
    .map((a) => ({ ...a, _priority: PRIORITY_VALUE(a) }))
    .sort((a, b) => {
      if (b._priority !== a._priority) return b._priority - a._priority;
      return new Date(a.submittedAt) - new Date(b.submittedAt);
    });
}

export async function processAllPending() {
  const results = await postJson('/process-all', {});
  await refreshState();
  return results;
}

// ---- Landlords ----
export async function addLandlord({ name, phone, nin, address }) {
  const landlord = await postJson('/landlords', { name, phone, nin, address });
  setState((s) => ({ ...s, landlords: [...s.landlords, landlord] }));
  return landlord;
}

export async function verifyLandlord(landlordId) {
  const landlord = await putJson(`/landlords/${landlordId}/verify`);
  setState((s) => ({
    ...s,
    landlords: s.landlords.map((l) => (l.id === landlordId ? landlord : l)),
  }));
  return landlord;
}

// ---- Listings ----
export async function addListing({ title, price, type, distance, landlordId, features }) {
  const listing = await postJson('/listings', { title, price, type, distance, landlordId, features });
  setState((s) => ({ ...s, listings: [...s.listings, listing] }));
  return listing;
}

// ---- Payments / Escrow ----
export async function recordTransaction({ name, type, amount }) {
  const transaction = await postJson('/transactions', { name, type, amount });
  setState((s) => ({ ...s, transactions: [...s.transactions, transaction] }));
  return transaction;
}

export async function releaseEscrow(txId) {
  const transaction = await putJson(`/transactions/${txId}/release`);
  setState((s) => ({
    ...s,
    transactions: s.transactions.map((t) => (t.id === txId ? transaction : t)),
  }));
  return transaction;
}

export async function disputeEscrow(txId) {
  const transaction = await putJson(`/transactions/${txId}/dispute`);
  setState((s) => ({
    ...s,
    transactions: s.transactions.map((t) => (t.id === txId ? transaction : t)),
  }));
  return transaction;
}

export async function payWithPayStripe({ name, type, amount }) {
  const response = await postJson('/paystripe/charge', { name, type, amount });
  setState((s) => ({ ...s, transactions: [...s.transactions, response.transaction] }));
  return response;
}

export async function confirmPayStripeSession(sessionId) {
  const response = await fetchJson(`${API_BASE}/paystripe/confirm?sessionId=${encodeURIComponent(sessionId)}`);
  try {
    await refreshState();
  } catch (e) {
    // ignore refresh errors but still return the response
  }
  return response;
}

export { PRIORITY_VALUE };
