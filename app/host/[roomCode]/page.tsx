import { HostScreen } from "@/components/HostScreen";

export default async function HostPage({
  params
}: {
  params: Promise<{ roomCode: string }>;
}) {
  const { roomCode } = await params;
  return <HostScreen roomCode={roomCode.toUpperCase()} />;
}
