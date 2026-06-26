import { NextRequest, NextResponse } from "next/server";
import { serializeRoom, StoreError, updateDemand } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const body = (await request.json()) as { demand?: number };

  try {
    const room = updateDemand(code, Number(body.demand));
    return NextResponse.json({ room: serializeRoom(room, "host") });
  } catch (error) {
    if (error instanceof StoreError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Không cập nhật được Cầu." }, { status: 500 });
  }
}
