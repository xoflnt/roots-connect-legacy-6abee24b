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

async function callFamilyApi(action: string, body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("family-api/" + action, {
    body,
  });
  if (error) throw error;
  return data;
}

// ─── Members (from cloud DB) ───

export async function getMembers(): Promise<FamilyMember[]> {
  const { data, error } = await supabase
    .from("family_members")
    .select("*")
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
    phone: row.phone,
    notes: row.notes,
  }));
}

export async function updateMember(id: string, data: Partial<FamilyMember>): Promise<void> {
  await callFamilyApi("update-member", { id, data });
}

export async function addMember(member: FamilyMember): Promise<void> {
  await callFamilyApi("add-member", { member });
}

// ─── Requests (cloud DB) ───

export async function submitRequest(req: Omit<FamilyRequest, "id" | "status" | "createdAt">): Promise<FamilyRequest> {
  const { data, error } = await supabase
    .from("family_requests")
    .insert({
      type: req.type,
      target_member_id: req.targetMemberId,
      data: req.data,
      notes: req.notes || null,
      submitted_by: req.submittedBy || null,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    type: data.type as RequestType,
    targetMemberId: data.target_member_id,
    data: data.data as Record<string, string>,
    notes: data.notes || undefined,
    status: data.status as "pending" | "completed",
    submittedBy: data.submitted_by || undefined,
    createdAt: data.created_at,
  };
}

export async function getRequests(): Promise<FamilyRequest[]> {
  const { data, error } = await supabase
    .from("family_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[dataService] getRequests error:", error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    type: row.type as RequestType,
    targetMemberId: row.target_member_id,
    data: row.data as Record<string, string>,
    notes: row.notes || undefined,
    status: row.status as "pending" | "completed",
    submittedBy: row.submitted_by || undefined,
    createdAt: row.created_at,
  }));
}

export async function markRequestDone(requestId: string): Promise<boolean> {
  try {
    await callFamilyApi("mark-done", { requestId });
    return true;
  } catch {
    return false;
  }
}

// ─── Verified Users (cloud DB) ───

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

export async function getVerifiedUsers(): Promise<VerifiedUser[]> {
  const { data, error } = await supabase
    .from("verified_users")
    .select("*");

  if (error) {
    console.error("[dataService] getVerifiedUsers error:", error);
    return [];
  }

  return (data || []).map((row: any) => ({
    memberId: row.member_id,
    memberName: row.member_name,
    phone: row.phone,
    hijriBirthDate: row.hijri_birth_date || undefined,
    verifiedAt: row.verified_at,
  }));
}

// ─── Verified Member IDs (cached) ───

let verifiedIdsCache: Set<string> | null = null;

export async function loadVerifiedMemberIds(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("verified_users")
    .select("member_id");

  if (error) {
    console.error("[dataService] loadVerifiedMemberIds error:", error);
    return verifiedIdsCache || new Set();
  }

  verifiedIdsCache = new Set((data || []).map((row: any) => row.member_id));
  return verifiedIdsCache;
}

export function getVerifiedMemberIds(): Set<string> {
  return verifiedIdsCache || new Set();
}

// ─── Visit Tracking (cloud DB) ───

export async function trackVisit(): Promise<void> {
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
