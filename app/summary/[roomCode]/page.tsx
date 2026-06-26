import { SummaryScreen } from "@/components/SummaryScreen";

export default async function SummaryPage({
  params
}: {
  params: Promise<{ roomCode: string }>;
}) {
  const { roomCode } = await params;
  return <SummaryScreen roomCode={roomCode.toUpperCase()} />;
}
