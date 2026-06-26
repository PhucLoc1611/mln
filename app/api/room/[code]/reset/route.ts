import { NextResponse } from "next/server";
import { resetRoom, serializeRoom, StoreError } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;

  try {
    const room = resetRoom(code);
    return NextResponse.json({ room: serializeRoom(room, "host") });
  } catch (error) {
    if (error instanceof StoreError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Không reset được phòng." }, { status: 500 });
  }
}
