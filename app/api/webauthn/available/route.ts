import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

// Public: lets the login page know whether to show the fingerprint button.
export async function GET() {
  const s = await getStore();
  return NextResponse.json({ available: s.credentials.length > 0 });
}
