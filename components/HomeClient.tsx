"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Crown, Factory, QrCode, Smartphone } from "lucide-react";
import { ROUND_DURATION_SECONDS, TOTAL_ROUNDS, TEAMS } from "@/lib/game";
import { postRoomAction } from "./use-room";

export function HomeClient() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [teamId, setTeamId] = useState("1");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createRoom() {
    setBusy(true);
    setError(null);
    try {
      const payload = await postRoomAction<{ room: { code: string } }>("/api/room");
      router.push(`/host/${payload.room.code}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không tạo được phòng.");
    } finally {
      setBusy(false);
    }
  }

  function joinTeam(event: FormEvent) {
    event.preventDefault();
    const code = roomCode.trim().toUpperCase();
    if (!code) {
      setError("Nhập mã phòng trước khi vào xưởng.");
      return;
    }
    router.push(`/team/${code}?team=${teamId}`);
  }

  return (
    <main className="home-shell">
      <section className="panel" style={{ padding: 22 }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.05fr) minmax(320px, 0.65fr)", gap: 22 }}>
          <div style={{ display: "grid", alignContent: "space-between", gap: 24, minHeight: 560 }}>
            <div>
              <div className="badge hot">
                <Factory size={15} />
                Game ôn kinh tế chính trị
              </div>
              <h1 className="title" style={{ marginTop: 18 }}>
                Vòng sản xuất
                <br />
                Vòng giá
              </h1>
              <p className="muted" style={{ maxWidth: 660, fontSize: "1.1rem", lineHeight: 1.7 }}>
                7 xưởng làng nghề cùng chọn sản lượng, thị trường gom Cung - Cầu rồi kéo Giá thị trường xoay quanh trục Giá trị lao động.
              </p>
            </div>

            <div className="stat-grid">
              <div className="stat">
                <div className="label">Số xưởng</div>
                <div className="value">7</div>
              </div>
              <div className="stat">
                <div className="label">Số vòng</div>
                <div className="value">{TOTAL_ROUNDS}</div>
              </div>
              <div className="stat">
                <div className="label">Thời gian</div>
                <div className="value">{ROUND_DURATION_SECONDS}s</div>
              </div>
              <div className="stat">
                <div className="label">Giá trị gốc</div>
                <div className="value">10</div>
              </div>
            </div>
          </div>

          <div className="panel tight" style={{ padding: 18, display: "grid", gap: 16, background: "rgba(10, 14, 12, 0.78)" }}>
            <button className="button primary" onClick={createRoom} disabled={busy}>
              <Crown size={18} />
              Tạo phòng host
            </button>

            <form onSubmit={joinTeam} style={{ display: "grid", gap: 12 }}>
              <div>
                <div className="label">Vào phòng bằng điện thoại</div>
                <input
                  className="input data"
                  value={roomCode}
                  onChange={(event) => setRoomCode(event.target.value)}
                  placeholder="Mã phòng"
                  autoCapitalize="characters"
                />
              </div>

              <div>
                <div className="label">Chọn xưởng</div>
                <select className="select" value={teamId} onChange={(event) => setTeamId(event.target.value)}>
                  {TEAMS.map((team) => (
                    <option key={team.id} value={team.id}>
                      Xưởng {team.id}: {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <button className="button teal" type="submit">
                <Smartphone size={18} />
                Vào màn nộp sản lượng
                <ArrowRight size={18} />
              </button>
            </form>

            {error ? <p className="negative" style={{ margin: 0 }}>{error}</p> : null}

            <div className="qr-box">
              <div className="team-icon">
                <QrCode size={19} />
              </div>
              <div>
                <strong>Luồng chơi nhanh</strong>
                <p className="muted" style={{ margin: "6px 0 0", lineHeight: 1.55 }}>
                  Host tạo phòng, chiếu QR. Mỗi nhóm chọn đúng xưởng trên điện thoại và nộp sản lượng trong 90 giây.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
