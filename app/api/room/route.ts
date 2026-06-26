import { NextResponse } from "next/server";
import { createRoom, serializeRoom } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST() {
  const room = await createRoom();
  return NextResponse.json({ room: serializeRoom(room, "host") }, { status: 201 });
}
