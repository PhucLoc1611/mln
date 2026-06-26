import { NextRequest, NextResponse } from "next/server";
import { closeRound, serializeRoom, StoreError } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { demand?: number };

  try {
    const room = await closeRound(code, typeof body.demand === "number" ? Number(body.demand) : undefined);
    return NextResponse.json({ room: serializeRoom(room, "host") });
  } catch (error) {
    if (error instanceof StoreError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Không khóa được vòng." }, { status: 500 });
  }
}
