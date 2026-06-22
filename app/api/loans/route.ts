import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { OWNER } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = await getStore();
  return NextResponse.json({ loans: s.loans, settings: s.settings, owner: OWNER });
}
