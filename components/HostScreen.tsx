"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Factory,
  Gauge,
  Play,
  RotateCcw,
  Save,
  Timer,
  Trophy
} from "lucide-react";
import {
  BASE_VALUE,
  ROUND_SCENARIOS,
  TOTAL_ROUNDS,
  formatGold,
  formatMeters,
  getCumulativeScores
} from "@/lib/game";
import { cumulativeRows, getLatestRound, getTeam, sortRoundResults } from "./format";
import { postRoomAction, useRoom } from "./use-room";

type HostScreenProps = {
  roomCode: string;
};

export function HostScreen({ roomCode }: HostScreenProps) {
  const { room, setRoom, error, loading, refresh } = useRoom(roomCode, "host");
  const [demand, setDemand] = useState(120);
  const [actionError, setActionError] = useState<string | null>(null);
  const closingRef = useRef(false);

  const joinUrl = typeof window === "undefined" ? "" : `${window.location.origin}/team/${roomCode}`;
  const latestRound = room ? getLatestRound(room.history) : null;
  const submittedCount = room?.submittedTeamIds.length ?? 0;
  const timeLeft = room ? Math.max(0, Math.ceil((room.roundEndsAt - Date.now()) / 1000)) : 0;
  const chartRows = useMemo(() => {
    return (room?.history ?? []).map((round) => ({
      round: `V${round.round}`,
      price: round.marketPrice,
      baseValue: BASE_VALUE,
      demand: round.demand,
      supply: round.totalSupply
    }));
  }, [room?.history]);

  useEffect(() => {
    if (room?.currentDemand) {
      setDemand(room.currentDemand);
    }
  }, [room?.currentDemand, room?.currentRound]);

  useEffect(() => {
    if (!room || room.phase !== "submitting" || closingRef.current) {
      return;
    }

    if (timeLeft <= 0) {
      closingRef.current = true;
      void closeCurrentRound().finally(() => {
        closingRef.current = false;
      });
    }
  }, [room, timeLeft]);

  async function runHostAction(action: () => Promise<{ room: typeof room }>) {
    setActionError(null);
    try {
      const payload = await action();
      if (payload.room) {
        setRoom(payload.room);
      }
      await refresh();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "Thao tác thất bại.");
    }
  }

  async function saveDemand() {
    await runHostAction(() =>
      postRoomAction(`/api/room/${roomCode}/demand`, {
        demand
      })
    );
  }

  async function closeCurrentRound() {
    await runHostAction(() =>
      postRoomAction(`/api/room/${roomCode}/round/close`, {
        demand
      })
    );
  }

  async function nextRound() {
    await runHostAction(() => postRoomAction(`/api/room/${roomCode}/round/next`));
  }

  async function resetRoom() {
    await runHostAction(() => postRoomAction(`/api/room/${roomCode}/reset`));
  }

  if (loading) {
    return <HostFrame><div className="panel" style={{ padding: 24 }}>Đang tải phòng chơi...</div></HostFrame>;
  }

  if (error || !room) {
    return (
      <HostFrame>
        <div className="panel" style={{ padding: 24 }}>
          <h1 className="section-title">Không mở được phòng</h1>
          <p className="negative">{error ?? "Phòng không tồn tại."}</p>
          <Link className="button primary" href="/">Tạo phòng mới</Link>
        </div>
      </HostFrame>
    );
  }

  const rankings = getCumulativeScores(room.history);
  const roundResults = latestRound ? sortRoundResults(latestRound.teamResults) : [];

  if (room.phase === "waiting") {
    const joinedTeams = room.teams.filter((t) => t.playerName);
    const joinedCount = joinedTeams.length;

    return (
      <HostFrame>
        <div className="host-layout" style={{ maxWidth: 1000, margin: "0 auto", padding: 20 }}>
          <div className="host-main" style={{ display: "grid", gap: 20 }}>
            <section className="panel host-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div className="badge hot">
                  <Factory size={15} />
                  Mã phòng <span className="data">{room.code}</span>
                </div>
                <h1 className="section-title" style={{ marginTop: 12, fontSize: "2.35rem" }}>
                  Phòng chờ trò chơi
                </h1>
                <p className="muted" style={{ margin: 0 }}>
                  Người chơi quét mã QR hoặc truy cập đường link để đặt tên và tham gia xưởng.
                </p>
              </div>
              <div className="stat" style={{ minWidth: 200, textAlign: "right" }}>
                <div className="label">Đại diện đã tham gia</div>
                <div className="value" style={{ color: "var(--teal)" }}>{joinedCount} / 7</div>
                <div className="muted">Cần tối thiểu 1 nhóm</div>
              </div>
            </section>

            <section className="panel" style={{ padding: 20 }}>
              <h2 className="section-title" style={{ marginBottom: 16 }}>Danh sách 7 xưởng làng nghề</h2>
              <div className="team-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                {room.teams.map((team) => {
                  const isJoined = Boolean(team.playerName);
                  return (
                    <article className={`team-card ${isJoined ? "submitted" : ""}`} key={team.id} style={{ border: isJoined ? "1px solid var(--teal)" : "1px solid rgba(255,255,255,0.08)", padding: 16 }}>
                      <div className="team-head">
                        <div>
                          <p className="team-name" style={{ fontSize: "1.1rem", fontWeight: "bold" }}>{team.name}</p>
                          <span className="muted" style={{ fontSize: ".82rem" }}>{team.craft}</span>
                        </div>
                        <span className="team-icon" style={{ background: team.accent, width: 36, height: 36 }}>
                          <Factory size={18} />
                        </span>
                      </div>
                      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="pulse-indicator" style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: isJoined ? "var(--teal)" : "rgba(255,255,255,0.25)"
                        }} />
                        <span className="data" style={{ fontSize: ".95rem", color: isJoined ? "#fff" : "rgba(255,255,255,0.4)" }}>
                          {isJoined ? team.playerName : "Đang chờ..."}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="panel" style={{ padding: 20, display: "flex", justifyContent: "space-between", gap: 20, alignItems: "center" }}>
              <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                <button
                  className="button primary large"
                  disabled={joinedCount === 0}
                  onClick={async () => {
                    await runHostAction(() => postRoomAction(`/api/room/${roomCode}/start`));
                  }}
                  style={{ fontSize: "1.2rem", padding: "12px 30px", display: "flex", alignItems: "center", cursor: joinedCount === 0 ? "not-allowed" : "pointer" }}
                >
                  <Play size={20} style={{ marginRight: 8 }} />
                  BẮT ĐẦU GAME
                </button>
                {joinedCount === 0 && (
                  <span className="muted" style={{ fontSize: ".9rem" }}>Vui lòng chờ ít nhất một người chơi tham gia.</span>
                )}
              </div>
              <button className="button danger" onClick={resetRoom}>
                <RotateCcw size={17} style={{ marginRight: 6 }} />
                Chơi lại
              </button>
            </section>
          </div>

          <aside className="host-side" style={{ display: "grid", gap: 20 }}>
            <section className="panel" style={{ padding: 20, textAlign: "center" }}>
              <h2 className="section-title" style={{ marginBottom: 12 }}>QR Code tham gia</h2>
              <div className="qr-box" style={{ padding: 10, background: "#fff", borderRadius: 8, display: "inline-block", margin: "10px 0" }}>
                {joinUrl ? <QRCodeSVG value={joinUrl} size={220} level="M" /> : null}
              </div>
              <p className="data" style={{ marginTop: 10, wordBreak: "break-all", color: "var(--gold)", fontSize: ".9rem" }}>
                {joinUrl}
              </p>
            </section>
          </aside>
        </div>
      </HostFrame>
    );
  }

  return (
    <HostFrame>
      <div className="host-layout">
        <div className="host-main">
          <section className="panel host-top">
            <div>
              <div className="badge hot">
                <Factory size={15} />
                Mã phòng <span className="data">{room.code}</span>
              </div>
              <h1 className="section-title" style={{ marginTop: 12, fontSize: "2.35rem" }}>
                Vòng sản xuất - Vòng giá
              </h1>
              <p className="muted" style={{ marginBottom: 0 }}>
                {room.currentScenario.event}
              </p>
              <div className="round-strip">
                {ROUND_SCENARIOS.map((scenario) => (
                  <div
                    key={scenario.round}
                    className={[
                      "round-chip",
                      scenario.round === room.currentRound ? "active" : "",
                      room.history.some((round) => round.round === scenario.round) ? "closed" : ""
                    ].join(" ")}
                  >
                    V{scenario.round}
                  </div>
                ))}
              </div>
            </div>

            <div className="stat" style={{ minWidth: 210 }}>
              <div className="label">Thời gian còn lại</div>
              <div className="value">
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
              </div>
              <div className="muted" style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <Timer size={16} />
                {room.phase === "submitting" ? "Đang nhận sản lượng" : room.phase === "results" ? "Đã khóa vòng" : "Đã kết thúc"}
              </div>
            </div>
          </section>

          <section className="panel market-board">
            <div className="price-orbit">
              <div>
                <div className="label">Giá thị trường</div>
                <div className="price-value">{latestRound?.marketPrice.toFixed(1) ?? "10.0"}</div>
                <div className="muted">Gold / mét vải</div>
              </div>
              <div className="formula">Giá = 10 x Cầu / Tổng Cung</div>
            </div>

            <div className="control-stack">
              <div className="stat-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                <div className="stat">
                  <div className="label">Cầu bí mật</div>
                  <div className="value">{demand}</div>
                </div>
                <div className="stat">
                  <div className="label">Tổng Cung</div>
                  <div className="value">{latestRound?.totalSupply ?? "--"}</div>
                </div>
              </div>

              <div>
                <div className="label">Chỉnh Cầu vòng {room.currentRound}</div>
                <input
                  className="input data"
                  type="number"
                  min={1}
                  value={demand}
                  disabled={room.phase !== "submitting"}
                  onChange={(event) => setDemand(Number(event.target.value))}
                />
              </div>

              <div className="button-row">
                <button className="button" onClick={saveDemand} disabled={room.phase !== "submitting"}>
                  <Save size={17} />
                  Lưu Cầu
                </button>
                <button className="button primary" onClick={closeCurrentRound} disabled={room.phase !== "submitting"}>
                  <CheckCircle2 size={17} />
                  Khóa vòng
                </button>
                <button className="button teal" onClick={nextRound} disabled={room.phase !== "results"}>
                  <Play size={17} />
                  Vòng tiếp
                </button>
              </div>

              <div className="button-row">
                <Link className="button" href={`/summary/${roomCode}`}>
                  <Trophy size={17} />
                  Tổng kết
                </Link>
                <button className="button danger" onClick={resetRoom}>
                  <RotateCcw size={17} />
                  Chơi lại
                </button>
              </div>
              {actionError ? <p className="negative" style={{ margin: 0 }}>{actionError}</p> : null}
            </div>
          </section>

          <section className="panel" style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center", marginBottom: 12 }}>
              <h2 className="section-title">7 xưởng làng nghề</h2>
              <span className="badge wait">{submittedCount}/7 đã nộp</span>
            </div>
            <div className="team-grid">
              {room.teams.map((team) => {
                const submitted = room.submittedTeamIds.includes(team.id);
                const submission = room.submissions.find((item) => item.teamId === team.id);
                const lastResult = latestRound?.teamResults.find((item) => item.teamId === team.id);
                return (
                  <article className={`team-card ${submitted ? "submitted" : ""}`} key={team.id}>
                    <div className="team-head">
                      <div>
                        <p className="team-name">
                          {team.name}
                          {team.playerName ? ` (${team.playerName})` : ""}
                        </p>
                        <span className="muted" style={{ fontSize: ".8rem" }}>{team.craft}</span>
                      </div>
                      <span className="team-icon" style={{ background: team.accent }}>
                        <Factory size={18} />
                      </span>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <span className={`badge ${submitted ? "done" : "wait"}`}>
                        {submitted ? "Đã nộp" : "Đang chờ"}
                      </span>
                    </div>
                    <div className="mini-row">
                      <span>Sản lượng</span>
                      <strong>{submission ? formatMeters(submission.output) : lastResult ? formatMeters(lastResult.output) : "--"}</strong>
                    </div>
                    <div className="mini-row">
                      <span>Lợi nhuận</span>
                      <strong className={lastResult && lastResult.profit < 0 ? "negative" : "positive"}>
                        {lastResult ? formatGold(lastResult.profit) : "--"}
                      </strong>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="panel chart-panel">
            <h2 className="section-title">Giá thị trường xoay quanh Giá trị</h2>
            <div style={{ height: 330, marginTop: 12 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartRows}>
                  <CartesianGrid stroke="rgba(242,219,171,.16)" strokeDasharray="4 4" />
                  <XAxis dataKey="round" stroke="#b9c1ad" />
                  <YAxis stroke="#b9c1ad" />
                  <Tooltip
                    contentStyle={{ background: "#111511", border: "1px solid rgba(242,219,171,.22)", borderRadius: 8 }}
                    labelStyle={{ color: "#fff5df" }}
                  />
                  <Area
                    type="linear"
                    dataKey="price"
                    name="Giá thị trường"
                    fill="rgba(50,212,191,.14)"
                    stroke="transparent"
                    connectNulls
                    isAnimationActive={false}
                  />
                  <ReferenceLine y={BASE_VALUE} stroke="#ff654f" strokeWidth={3} ifOverflow="extendDomain" />
                  <Line
                    type="linear"
                    dataKey="price"
                    name="Giá thị trường"
                    stroke="#32d4bf"
                    strokeWidth={4}
                    dot={{ r: 5 }}
                    connectNulls
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <aside className="host-side">
          <section className="panel" style={{ padding: 14 }}>
            <h2 className="section-title">QR cho nhóm</h2>
            <div className="qr-box" style={{ marginTop: 12 }}>
              <div className="qr-frame">
                {joinUrl ? <QRCodeSVG value={joinUrl} size={210} level="M" /> : null}
              </div>
              <p className="muted" style={{ margin: 0 }}>
                Mở link rồi chọn đúng xưởng trên điện thoại.
              </p>
              <p className="data" style={{ margin: 0, wordBreak: "break-all", color: "var(--gold)" }}>{joinUrl}</p>
            </div>
          </section>

          <section className="panel" style={{ padding: 14 }}>
            <h2 className="section-title">Bảng xếp hạng</h2>
            <div style={{ marginTop: 8 }}>
              {cumulativeRows(room.history, room.teams).map((row) => (
                <div className="rank-row" key={row.id}>
                  <span className="rank-num">{row.rank}</span>
                  <div>
                    <strong>{row.name}</strong>
                    <div className="muted" style={{ fontSize: ".82rem" }}>{row.craft}</div>
                  </div>
                  <strong className={row.totalProfit < 0 ? "negative data" : "positive data"}>{formatGold(row.totalProfit)}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="panel" style={{ padding: 14 }}>
            <h2 className="section-title">Kết quả vòng gần nhất</h2>
            {latestRound ? (
              <div style={{ marginTop: 8 }}>
                {roundResults.map((result, index) => {
                  const team = getTeam(result.teamId, room.teams);
                  return (
                    <div className="rank-row" key={result.teamId}>
                      <span className="rank-num">{index + 1}</span>
                      <div>
                        <strong>{team.name}</strong>
                        <div className="muted" style={{ fontSize: ".82rem" }}>
                          {formatMeters(result.output)} · chi phí {formatGold(result.cost)}
                        </div>
                      </div>
                      <strong className={result.profit < 0 ? "negative data" : "positive data"}>{formatGold(result.profit)}</strong>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="muted">Khóa vòng đầu tiên để hiện kết quả.</p>
            )}
          </section>

          <section className="panel" style={{ padding: 14 }}>
            <div className="badge">
              <Gauge size={15} />
              Gợi ý host
            </div>
            <p className="muted" style={{ lineHeight: 1.6 }}>{room.currentScenario.hostHint}</p>
            {room.phase === "finished" ? (
              <Link className="button primary" href={`/summary/${roomCode}`}>
                Mở màn chốt bài
                <ArrowRight size={17} />
              </Link>
            ) : null}
          </section>
        </aside>
      </div>
    </HostFrame>
  );
}

function HostFrame({ children }: { children: React.ReactNode }) {
  return <main className="page-shell">{children}</main>;
}
