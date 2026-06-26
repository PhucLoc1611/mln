import { NextRequest, NextResponse } from "next/server";
import { RoomRole } from "@/lib/game";
import { getRoom, serializeRoom } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const room = getRoom(code);

  if (!room) {
    return NextResponse.json({ error: "Không tìm thấy phòng chơi." }, { status: 404 });
  }

  const requestedRole = request.nextUrl.searchParams.get("role");
  const role: RoomRole = requestedRole === "host" ? "host" : "team";
  return NextResponse.json({ room: serializeRoom(room, role) });
}
