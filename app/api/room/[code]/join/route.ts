import { NextRequest, NextResponse } from "next/server";
import { joinTeam, serializeRoom, StoreError } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const body = (await request.json()) as { teamId?: number; playerName?: string };

  try {
    const room = await joinTeam(code, Number(body.teamId), String(body.playerName));
    return NextResponse.json({ room: serializeRoom(room, "team") });
  } catch (error) {
    if (error instanceof StoreError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Không tham gia được xưởng." }, { status: 500 });
  }
}
