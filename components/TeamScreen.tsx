"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Factory, Lock, Send, SlidersHorizontal } from "lucide-react";
import {
  OUTPUT_MAX,
  OUTPUT_MIN,
  calculateCost,
  formatGold,
  formatMeters,
  getCumulativeScores
} from "@/lib/game";
import { describeResult, getTeam, getTeamResult } from "./format";
import { postRoomAction, useRoom } from "./use-room";

type TeamScreenProps = {
  roomCode: string;
};

export function TeamScreen({ roomCode }: TeamScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamId = Number(searchParams.get("team"));
  const { room, setRoom, error, loading, refresh } = useRoom(roomCode, "team");
  const [output, setOutput] = useState(12);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const team = Number.isFinite(teamId) ? room?.teams.find((item) => item.id === teamId) : null;
  const submitted = room?.submittedTeamIds.includes(teamId) ?? false;
  const previous = room ? getTeamResult(room.history, teamId) : null;
  const cost = useMemo(() => calculateCost(output), [output]);
  const averageCost = output > 0 ? cost / output : 0;

  async function submit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = await postRoomAction<{ room: typeof room }>(`/api/room/${roomCode}/submit`, {
        teamId,
        output
      });
      if (payload.room) {
        setRoom(payload.room);
      }
      await refresh();
    } catch (caught) {
      setSubmitError(caught instanceof Error ? caught.message : "Không nộp được sản lượng.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <PhoneFrame><section className="panel phone-card">Đang tải phòng...</section></PhoneFrame>;
  }

  if (error || !room) {
    return (
      <PhoneFrame>
        <section className="panel phone-card">
          <h1 className="section-title">Không vào được phòng</h1>
          <p className="negative">{error ?? "Phòng không tồn tại."}</p>
          <Link className="button primary" href="/">Về màn tạo phòng</Link>
        </section>
      </PhoneFrame>
    );
  }

  if (!team) {
    return (
      <PhoneFrame>
        <section className="panel phone-card">
          <div className="badge hot">
            <Factory size={15} />
            Mã phòng <span className="data">{room.code}</span>
          </div>
          <h1 className="section-title">Chọn xưởng của nhóm</h1>
          <div className="team-picker">
            {room.teams.map((candidate) => (
              <button
                className="team-pick"
                key={candidate.id}
                onClick={() => router.push(`/team/${roomCode}?team=${candidate.id}`)}
              >
                <span className="team-icon" style={{ background: candidate.accent }}>
                  <Factory size={18} />
                </span>
                <span style={{ textAlign: "left" }}>
                  <strong>{candidate.name}</strong>
                  <span className="muted" style={{ display: "block", fontSize: ".85rem" }}>{candidate.craft}</span>
                </span>
                <ArrowRight size={18} style={{ marginLeft: "auto" }} />
              </button>
            ))}
          </div>
        </section>
      </PhoneFrame>
    );
  }

  const locked = room.phase !== "submitting" || submitted;
  const rank = getCumulativeScores(room.history).findIndex((row) => row.id === teamId) + 1;

  return (
    <PhoneFrame>
      <section className="panel phone-card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <div>
            <div className="badge hot">Vòng {room.currentRound}/6</div>
            <h1 className="section-title" style={{ marginTop: 10 }}>{team.name}</h1>
            <p className="muted" style={{ margin: "6px 0 0" }}>{team.craft}</p>
          </div>
          <span className="team-icon" style={{ width: 50, height: 50, background: team.accent }}>
            <Factory size={25} />
          </span>
        </div>

        <div className="stat-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
          <div className="stat">
            <div className="label">Hạng hiện tại</div>
            <div className="value">#{rank || "-"}</div>
          </div>
          <div className="stat">
            <div className="label">Kết quả trước</div>
            <div className={previous?.result.profit && previous.result.profit < 0 ? "value negative" : "value positive"}>
              {previous ? describeResult(previous.result.profit).replace("Gold", "") : "--"}
            </div>
          </div>
        </div>

        {locked ? (
          <div className="panel tight" style={{ padding: 16, background: "rgba(255,255,255,.055)" }}>
            <div className="badge done">
              <Lock size={15} />
              {submitted ? "Đã nộp sản lượng" : "Vòng đang khóa"}
            </div>
            <p className="muted" style={{ lineHeight: 1.6 }}>
              Chờ host khóa vòng và công bố Giá thị trường. Mỗi vòng chỉ được nộp một lần.
            </p>
          </div>
        ) : (
          <>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span className="label">Sản lượng muốn sản xuất</span>
                <strong className="data" style={{ color: "var(--gold)", fontSize: "1.8rem" }}>{formatMeters(output)}</strong>
              </div>
              <input
                className="slider"
                type="range"
                min={OUTPUT_MIN}
                max={OUTPUT_MAX}
                value={output}
                onChange={(event) => setOutput(Number(event.target.value))}
              />
            </div>

            <div className="panel tight" style={{ padding: 14, background: "rgba(255,255,255,.055)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div className="label">Tổng chi phí</div>
                  <strong className="data" style={{ fontSize: "1.5rem" }}>{formatGold(cost)}</strong>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="label">Chi phí TB</div>
                  <strong className="data" style={{ fontSize: "1.5rem" }}>{averageCost.toFixed(1)}</strong>
                </div>
              </div>
              <div className="cost-bars" style={{ marginTop: 12 }}>
                <div className="mini-row"><span>1-10 mét</span><strong>10 Gold/mét</strong></div>
                <div className="cost-bar"><span style={{ width: `${Math.min(output, 10) / 10 * 100}%` }} /></div>
                <div className="mini-row"><span>11-20 mét</span><strong>13 Gold/mét</strong></div>
                <div className="cost-bar"><span style={{ width: `${Math.min(Math.max(output - 10, 0), 10) / 10 * 100}%` }} /></div>
                <div className="mini-row"><span>21-30 mét</span><strong>17 Gold/mét</strong></div>
                <div className="cost-bar"><span style={{ width: `${Math.max(output - 20, 0) / 10 * 100}%` }} /></div>
              </div>
            </div>

            <button className="button primary" onClick={submit} disabled={submitting}>
              <Send size={18} />
              NỘP sản lượng
            </button>
          </>
        )}

        {submitError ? <p className="negative" style={{ margin: 0 }}>{submitError}</p> : null}

        <div className="qr-box">
          <div className="badge">
            <SlidersHorizontal size={15} />
            Chiến thuật
          </div>
          <p className="muted" style={{ margin: 0, lineHeight: 1.55 }}>
            Sản lượng cao giúp bán nhiều hơn nếu giá tăng, nhưng chi phí lao động tăng mạnh sau mốc 10 và 20 mét.
          </p>
        </div>

        {room.phase === "finished" ? (
          <Link className="button teal" href={`/summary/${roomCode}`}>
            <CheckCircle2 size={18} />
            Xem tổng kết
          </Link>
        ) : null}
      </section>
    </PhoneFrame>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return <main className="phone-shell">{children}</main>;
}
