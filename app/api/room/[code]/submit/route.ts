import { NextRequest, NextResponse } from "next/server";
import { serializeRoom, submitOutput, StoreError } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const body = (await request.json()) as { teamId?: number; output?: number };

  try {
    const room = await submitOutput(code, Number(body.teamId), Number(body.output));
    return NextResponse.json({ room: serializeRoom(room, "team") });
  } catch (error) {
    if (error instanceof StoreError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Không nộp được sản lượng." }, { status: 500 });
  }
}
