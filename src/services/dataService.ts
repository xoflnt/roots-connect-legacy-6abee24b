/**
 * Data service — Cloud-backed via Supabase.
 * localStorage is ONLY used for device-local preferences.
 */

import { supabase } from "@/integrations/supabase/client";
import type { FamilyMember } from "@/data/familyData";

// ─── Request Types ───

export type RequestType = "other";

export interface FamilyRequest {
  id: string;
  type: RequestType;
  targetMemberId: string;
  data: Record<string, string>;
  notes?: string;
  status: "pending" | "completed";
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

// ─── Edge function helper ───

async function callFamilyApi(action: string, body: Record<string, unknown>, headers?: Record<string, string>) {
  const { data, error } = await supabase.functions.invoke("family-api/" + action, {
    body,
    headers,
  });
  if (error) throw error;
  return data;
}

// ─── Members (from cloud DB — phone excluded) ───

export async function getMembers(): Promise<FamilyMember[]> {
  const { data, error } = await supabase
    .from("family_members")
    .select("id, name, gender, father_id, birth_year, death_year, spouses, notes")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[dataService] getMembers error:", error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    gender: row.gender as "M" | "F",
    father_id: row.father_id,
    birth_year: row.birth_year,
    death_year: row.death_year,
    spouses: row.spouses,
    phone: null,
    notes: row.notes,
  }));
}

export async function updateMember(id: string, data: Partial<FamilyMember>): Promise<void> {
  await callFamilyApi("update-member", { id, data });
}

export async function addMember(member: FamilyMember, adminToken?: string): Promise<void> {
  const headers = adminToken ? { "x-admin-token": adminToken } : undefined;
  await callFamilyApi("add-member", { member }, headers);
}

// ─── Requests (via edge function for admin reads) ───

export async function submitRequest(req: Omit<FamilyRequest, "id" | "status" | "createdAt">): Promise<FamilyRequest> {
  const { error } = await supabase
    .from("family_requests")
    .insert({
      type: req.type,
      target_member_id: req.targetMemberId,
      data: req.data,
      notes: req.notes || null,
      submitted_by: req.submittedBy || null,
      status: "pending",
    });

  if (error) throw error;

  // RLS blocks SELECT, so we return a synthetic object
  return {
    id: crypto.randomUUID(),
    type: req.type as RequestType,
    targetMemberId: req.targetMemberId,
    data: req.data as Record<string, string>,
    notes: req.notes,
    status: "pending",
    submittedBy: req.submittedBy,
    createdAt: new Date().toISOString(),
  };
}

/** Admin-only: get all requests via edge function */
export async function getRequests(adminToken: string): Promise<FamilyRequest[]> {
  try {
    const result = await callFamilyApi("get-requests", {}, { "x-admin-token": adminToken });
    const rows = result?.requests || [];
    return rows.map((row: any) => ({
      id: row.id,
      type: row.type as RequestType,
      targetMemberId: row.target_member_id,
      data: row.data as Record<string, string>,
      notes: row.notes || undefined,
      status: row.status as "pending" | "completed",
      submittedBy: row.submitted_by || undefined,
      createdAt: row.created_at,
    }));
  } catch (e) {
    console.error("[dataService] getRequests error:", e);
    return [];
  }
}

export async function markRequestDone(requestId: string, adminToken: string): Promise<boolean> {
  try {
    await callFamilyApi("mark-done", { requestId }, { "x-admin-token": adminToken });
    return true;
  } catch {
    return false;
  }
}

// ─── Verified Users (via edge function) ───

export async function registerVerifiedUser(user: Omit<VerifiedUser, "verifiedAt">): Promise<void> {
  await callFamilyApi("register-user", {
    memberId: user.memberId,
    memberName: user.memberName,
    phone: user.phone,
    hijriBirthDate: user.hijriBirthDate,
  });

  // Also update member phone in DB
  if (user.hijriBirthDate) {
    await updateMember(user.memberId, { birth_year: user.hijriBirthDate });
  }
}

/** Admin-only: get all verified users via edge function */
export async function getVerifiedUsers(adminToken: string): Promise<VerifiedUser[]> {
  try {
    const result = await callFamilyApi("get-verified-users", {}, { "x-admin-token": adminToken });
    const rows = result?.users || [];
    return rows.map((row: any) => ({
      memberId: row.member_id,
      memberName: row.member_name,
      phone: row.phone,
      hijriBirthDate: row.hijri_birth_date || undefined,
      verifiedAt: row.verified_at,
    }));
  } catch (e) {
    console.error("[dataService] getVerifiedUsers error:", e);
    return [];
  }
}

// ─── Verified Member IDs (public — no PII) ───

let verifiedIdsCache: Set<string> | null = null;

export async function loadVerifiedMemberIds(): Promise<Set<string>> {
  try {
    const result = await callFamilyApi("get-verified-ids", {});
    const ids: string[] = result?.ids || [];
    verifiedIdsCache = new Set(ids);
    return verifiedIdsCache;
  } catch (e) {
    console.error("[dataService] loadVerifiedMemberIds error:", e);
    return verifiedIdsCache || new Set();
  }
}

export function getVerifiedMemberIds(): Set<string> {
  return verifiedIdsCache || new Set();
}

// ─── Visit Tracking (cloud DB) ───

export async function trackVisit(): Promise<void> {
  if (sessionStorage.getItem("khunaini-visit-tracked")) return;
  sessionStorage.setItem("khunaini-visit-tracked", "true");
  try {
    await callFamilyApi("track-visit", {});
  } catch (e) {
    console.error("[dataService] trackVisit error:", e);
  }
}

export async function getVisitCount(): Promise<number> {
  const { data, error } = await supabase
    .from("visit_stats")
    .select("count")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("[dataService] getVisitCount error:", error);
    return 0;
  }

  return data?.count || 0;
}

// ─── Passcode verification (server-side) ───

export async function verifyFamilyPasscode(passcode: string): Promise<boolean> {
  try {
    const result = await callFamilyApi("verify-passcode", { passcode });
    return result?.valid === true;
  } catch {
    return false;
  }
}
