import { Suspense } from "react";
import { TeamScreen } from "@/components/TeamScreen";

export default async function TeamPage({
  params
}: {
  params: Promise<{ roomCode: string }>;
}) {
  const { roomCode } = await params;
  return (
    <Suspense fallback={<main className="phone-shell"><section className="panel phone-card">Đang mở màn nhóm...</section></main>}>
      <TeamScreen roomCode={roomCode.toUpperCase()} />
    </Suspense>
  );
}
