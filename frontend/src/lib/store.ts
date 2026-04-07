import { readFileSync, writeFileSync } from "fs";
import path from "path";

export interface Product {
  id: number;
  sku: string;
  name: string;
  unit: string;
  totalQty: number;
  warehouseQty: number;
  lowStockThreshold: number;
  unitPrice: number;
  createdAt: string;
  invoiceNo?: string;
  billUrl?: string;
}

export interface SystemUser {
  id: string; // The email will act as the unique ID for simplicity, but we can also use a string UUID
  email: string;
  name: string;
  image?: string;
  role: "ADMIN" | "USER" | "PENDING" | "REJECTED";
  createdAt: string;
}

export interface Project {
  id: number;
  name: string;
  siteAddress: string;
  status: "ACTIVE" | "COMPLETED" | "ON_HOLD";
  createdAt: string;
  budget?: number; // optional estimated project budget (₹)
  electricalPlans?: {
    id: string;
    name: string;
    url: string;
    addedAt: string;
  }[];
}

export interface Allocation {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  productUnit: string;
  projectId: number;
  projectName: string;
  quantity: number;
  allocatedDate: string;
  notes: string;
}

/** Records actual on-site consumption of an item at a project */
export interface Usage {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  productUnit: string;
  projectId: number;
  projectName: string;
  quantity: number;
  usedDate: string;
  notes: string;
}

/** A worker / labourer employed by CMM Electricals */
export interface Worker {
  id: number;
  name: string;
  phone: string;
  trade: string;
  dailyRate: number;
  createdAt: string;
  isActive?: boolean; // defaults to true if undefined
}

/** Assignment of a worker to a project site */
export interface Assignment {
  id: number;
  workerId: number;
  workerName: string;
  workerTrade: string;
  projectId: number;
  projectName: string;
  startDate: string;
  endDate: string;
  notes: string;
}

/** A single day attendance record for a worker */
export interface Attendance {
  id: number;
  workerId: number;
  workerName: string;
  date: string;
  present: boolean;
  projectId: number;
  projectName: string;
  notes: string;
}

/** A payment made to a worker (weekly basis) */
export interface Payment {
  id: number;
  workerId: number;
  workerName: string;
  amount: number;        // ₹ TOTAL amount paid (base + allowances)
  baseWage: number;      // ₹ days worked × daily rate
  foodAllowance: number; // ₹ food allowance
  travelAllowance: number; // ₹ travel/conveyance allowance
  otherAllowance: number;  // ₹ any other extras
  weekStart: string;
  weekEnd: string;
  paidDate: string;
  daysWorked: number;
  notes: string;
}

export interface ClientPayment {
  id: number;
  projectId: number;
  projectName: string;
  amount: number;       // ₹ amount received
  paymentDate: string;  // YYYY-MM-DD
  invoiceNo: string;    // optional invoice/challan reference
  notes: string;
  billUrl?: string;
}

/** An expense purchased directly for a project (bypassing warehouse) */
export interface DirectPurchase {
  id: number;
  projectId: number;
  projectName: string;
  description: string;
  amount: number;       // ₹ total cost
  date: string;
  invoiceNo?: string;
  notes: string;
  billUrl?: string;
}

interface StoreMeta {
  nextProductId: number;
  nextProjectId: number;
  nextAllocationId: number;
  nextUsageId: number;
  nextWorkerId: number;
  nextAssignmentId: number;
  nextAttendanceId: number;
  nextPaymentId: number;
  nextClientPaymentId: number;
  nextDirectPurchaseId: number;
}

interface Store {
  products: Product[];
  projects: Project[];
  allocations: Allocation[];
  usages: Usage[];
  workers: Worker[];
  assignments: Assignment[];
  attendance: Attendance[];
  payments: Payment[];
  clientPayments: ClientPayment[];
  directPurchases: DirectPurchase[];
  users: SystemUser[];
  _meta: StoreMeta;
}


const STORE_PATH = path.join(process.cwd(), "src", "data", "store.json");

export function readStore(): Store {
  try {
    const raw = readFileSync(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    // Migrate older store files
    if (!parsed.usages)          parsed.usages = [];
    if (!parsed.workers)         parsed.workers = [];
    if (!parsed.assignments)     parsed.assignments = [];
    if (!parsed.attendance)      parsed.attendance = [];
    if (!parsed.payments)        parsed.payments = [];
    if (!parsed.clientPayments)  parsed.clientPayments = [];
    if (!parsed.directPurchases) parsed.directPurchases = [];
    if (!parsed.users)           parsed.users = [];
    if (!parsed._meta.nextUsageId)         parsed._meta.nextUsageId = 1;
    if (!parsed._meta.nextWorkerId)        parsed._meta.nextWorkerId = 1;
    if (!parsed._meta.nextAssignmentId)    parsed._meta.nextAssignmentId = 1;
    if (!parsed._meta.nextAttendanceId)    parsed._meta.nextAttendanceId = 1;
    if (!parsed._meta.nextPaymentId)       parsed._meta.nextPaymentId = 1;
    if (!parsed._meta.nextClientPaymentId) parsed._meta.nextClientPaymentId = 1;
    if (!parsed._meta.nextDirectPurchaseId) parsed._meta.nextDirectPurchaseId = 1;
    return parsed as Store;
  } catch {
    return {
      products: [], projects: [], allocations: [], usages: [],
      workers: [], assignments: [], attendance: [], payments: [],
      clientPayments: [], directPurchases: [], users: [],
      _meta: {
        nextProductId: 1, nextProjectId: 1, nextAllocationId: 1,
        nextUsageId: 1, nextWorkerId: 1, nextAssignmentId: 1,
        nextAttendanceId: 1, nextPaymentId: 1, nextClientPaymentId: 1,
        nextDirectPurchaseId: 1,
      },
    };
  }
}

export function writeStore(store: Store): void {
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export function nextId(store: Store, key: keyof StoreMeta): number {
  const id = store._meta[key];
  store._meta[key] = id + 1;
  return id;
}
