/**
 * Data service — localStorage-backed, structured for future DB migration.
 */

import { familyMembers, type FamilyMember } from "@/data/familyData";

// ─── Request Types ───

export type RequestType = "add_child" | "update_info" | "add_spouse" | "correction" | "other";

export interface FamilyRequest {
  id: string;
  type: RequestType;
  targetMemberId: string;
  data: Record<string, string>;
  notes?: string;
  status: "pending" | "approved" | "rejected";
  submittedBy?: string;
  createdAt: string;
}

export interface VerifiedUser {
  memberId: string;
  memberName: string;
  phone: string;
  hijriBirthDate?: string;
  verifiedAt: string;
}

// ─── Storage Keys ───

const REQUESTS_KEY = "khunaini-requests";
const VERIFIED_USERS_KEY = "khunaini-verified-users";
const VISITS_KEY = "khunaini-visits";
const MEMBER_OVERRIDES_KEY = "khunaini-member-overrides";

// ─── Helpers ───

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Members (read from static data + overrides) ───

export async function getMembers(): Promise<FamilyMember[]> {
  const overrides: Record<string, Partial<FamilyMember>> = loadJSON(MEMBER_OVERRIDES_KEY, {});
  const additions: FamilyMember[] = loadJSON("khunaini-added-members", []);

  const merged = familyMembers.map((m) => {
    const ov = overrides[m.id];
    return ov ? { ...m, ...ov } : m;
  });

  return [...merged, ...additions];
}

export async function updateMember(id: string, data: Partial<FamilyMember>): Promise<void> {
  const overrides: Record<string, Partial<FamilyMember>> = loadJSON(MEMBER_OVERRIDES_KEY, {});
  overrides[id] = { ...(overrides[id] || {}), ...data };
  saveJSON(MEMBER_OVERRIDES_KEY, overrides);
}

export async function addMember(member: FamilyMember): Promise<void> {
  const additions: FamilyMember[] = loadJSON("khunaini-added-members", []);
  additions.push(member);
  saveJSON("khunaini-added-members", additions);
}

// ─── Requests ───

export async function submitRequest(req: Omit<FamilyRequest, "id" | "status" | "createdAt">): Promise<FamilyRequest> {
  const requests: FamilyRequest[] = loadJSON(REQUESTS_KEY, []);
  const newReq: FamilyRequest = {
    ...req,
    id: crypto.randomUUID(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  requests.push(newReq);
  saveJSON(REQUESTS_KEY, requests);
  return newReq;
}

export async function getRequests(): Promise<FamilyRequest[]> {
  return loadJSON(REQUESTS_KEY, []);
}

export async function approveRequest(requestId: string): Promise<boolean> {
  const requests: FamilyRequest[] = loadJSON(REQUESTS_KEY, []);
  const req = requests.find((r) => r.id === requestId);
  if (!req || req.status !== "pending") return false;

  // Apply the change
  if (req.type === "add_child") {
    await addMember({
      id: `REQ-${req.id.slice(0, 8)}`,
      name: req.data.childName || "غير محدد",
      gender: (req.data.gender as "M" | "F") || "M",
      father_id: req.targetMemberId,
      birth_year: req.data.birthYear,
      spouses: req.data.spouses,
    });
  } else if (req.type === "update_info" || req.type === "correction") {
    await updateMember(req.targetMemberId, req.data as Partial<FamilyMember>);
  } else if (req.type === "add_spouse") {
    const members = await getMembers();
    const member = members.find((m) => m.id === req.targetMemberId);
    const currentSpouses = member?.spouses || "";
    const newSpouse = req.data.spouseName || "";
    await updateMember(req.targetMemberId, {
      spouses: currentSpouses ? `${currentSpouses}، ${newSpouse}` : newSpouse,
    });
  }

  req.status = "approved";
  saveJSON(REQUESTS_KEY, requests);
  return true;
}

export async function rejectRequest(requestId: string): Promise<boolean> {
  const requests: FamilyRequest[] = loadJSON(REQUESTS_KEY, []);
  const req = requests.find((r) => r.id === requestId);
  if (!req || req.status !== "pending") return false;
  req.status = "rejected";
  saveJSON(REQUESTS_KEY, requests);
  return true;
}

// ─── Verified Users ───

export async function registerVerifiedUser(user: Omit<VerifiedUser, "verifiedAt">): Promise<void> {
  const users: VerifiedUser[] = loadJSON(VERIFIED_USERS_KEY, []);
  const existing = users.findIndex((u) => u.memberId === user.memberId);
  const entry: VerifiedUser = { ...user, verifiedAt: new Date().toISOString() };
  if (existing >= 0) users[existing] = entry;
  else users.push(entry);
  saveJSON(VERIFIED_USERS_KEY, users);

  // Auto-update birth date if provided
  if (user.hijriBirthDate) {
    await updateMember(user.memberId, { birth_year: user.hijriBirthDate });
  }
}

export async function getVerifiedUsers(): Promise<VerifiedUser[]> {
  return loadJSON(VERIFIED_USERS_KEY, []);
}

// ─── Visit Tracking ───

export function trackVisit() {
  const count = parseInt(localStorage.getItem(VISITS_KEY) || "0", 10);
  localStorage.setItem(VISITS_KEY, String(count + 1));
}

export function getVisitCount(): number {
  return parseInt(localStorage.getItem(VISITS_KEY) || "0", 10);
}
