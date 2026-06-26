"use client";

import Link from "next/link";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { ArrowLeft, BarChart3, Crown, RotateCcw } from "lucide-react";
import { BASE_VALUE, formatGold, getCumulativeScores } from "@/lib/game";
import { useRoom } from "./use-room";

type SummaryScreenProps = {
  roomCode: string;
};

export function SummaryScreen({ roomCode }: SummaryScreenProps) {
  const { room, error, loading } = useRoom(roomCode, "host");

  if (loading) {
    return <main className="page-shell"><section className="panel" style={{ padding: 24 }}>Đang tải tổng kết...</section></main>;
  }

  if (error || !room) {
    return (
      <main className="page-shell">
        <section className="panel" style={{ padding: 24 }}>
          <h1 className="section-title">Không mở được tổng kết</h1>
          <p className="negative">{error ?? "Không tìm thấy phòng."}</p>
          <Link className="button primary" href="/">Tạo phòng mới</Link>
        </section>
      </main>
    );
  }

  const chartRows = room.history.map((round) => ({
    round: `V${round.round}`,
    price: round.marketPrice,
    baseValue: BASE_VALUE,
    demand: round.demand,
    supply: round.totalSupply
  }));
  const rankings = getCumulativeScores(room.history);

  return (
    <main className="page-shell">
      <div className="summary-layout">
        <section className="panel chart-panel">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div className="badge hot">
                <BarChart3 size={15} />
                Tổng kết phòng <span className="data">{room.code}</span>
              </div>
              <h1 className="section-title" style={{ marginTop: 12, fontSize: "2.1rem" }}>
                Giá cả xoay quanh Giá trị
              </h1>
            </div>
            <Link className="button" href={`/host/${roomCode}`}>
              <ArrowLeft size={17} />
              Về host
            </Link>
          </div>

          <div style={{ height: 410, marginTop: 18 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartRows}>
                <CartesianGrid stroke="rgba(242,219,171,.16)" strokeDasharray="4 4" />
                <XAxis dataKey="round" stroke="#b9c1ad" />
                <YAxis stroke="#b9c1ad" domain={[0, "dataMax + 4"]} />
                <Tooltip
                  contentStyle={{ background: "#111511", border: "1px solid rgba(242,219,171,.22)", borderRadius: 8 }}
                  labelStyle={{ color: "#fff5df" }}
                />
                <ReferenceLine y={BASE_VALUE} stroke="#ff654f" strokeWidth={4} ifOverflow="extendDomain" />
                <Line
                  type="linear"
                  dataKey="price"
                  name="Giá thị trường"
                  stroke="#32d4bf"
                  strokeWidth={5}
                  dot={{ r: 6 }}
                  connectNulls
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="stat-grid" style={{ marginTop: 14 }}>
            {room.history.map((round) => (
              <div className="stat" key={round.round}>
                <div className="label">Vòng {round.round}</div>
                <div className="value">{round.marketPrice.toFixed(1)}</div>
                <div className="muted">Cầu {round.demand} · Cung {round.totalSupply}</div>
              </div>
            ))}
          </div>
        </section>

        <aside style={{ display: "grid", gap: 14, alignContent: "start" }}>
          <section className="panel" style={{ padding: 18 }}>
            <h2 className="section-title">Xưởng dẫn đầu</h2>
            {rankings[0] ? (
              <div className="qr-box" style={{ marginTop: 12 }}>
                <div className={rankings[0].totalProfit >= 0 ? "badge done" : "badge wait"}>
                  <Crown size={15} />
                  Hạng 1
                </div>
                <h3 style={{ margin: 0, fontSize: "1.7rem" }}>{rankings[0].name}</h3>
                <strong className={rankings[0].totalProfit < 0 ? "negative data" : "positive data"} style={{ fontSize: "2rem" }}>
                  {formatGold(rankings[0].totalProfit)}
                </strong>
              </div>
            ) : (
              <p className="muted">Chưa có vòng nào được khóa.</p>
            )}

            <div style={{ marginTop: 12 }}>
              {rankings.map((row, index) => (
                <div className="rank-row" key={row.id}>
                  <span className="rank-num">{index + 1}</span>
                  <div>
                    <strong>{row.name}</strong>
                    <div className="muted" style={{ fontSize: ".82rem" }}>{row.craft}</div>
                  </div>
                  <strong className={row.totalProfit < 0 ? "negative data" : "positive data"}>{formatGold(row.totalProfit)}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="panel script-box">
            <h2 className="section-title">Lời chốt bài</h2>
            <p>
              Đường đỏ là <strong>GIÁ TRỊ</strong>: hao phí lao động trung bình để làm ra một mét vải.
            </p>
            <p>
              Đường xanh là <strong>GIÁ CẢ thị trường</strong>: nó rơi khi Cung vượt Cầu, bay lên khi Cầu vượt Cung.
            </p>
            <p>
              Nhưng sau các cú sốc, Giá cả vẫn bị kéo về quanh trục Giá trị. Đó là cách quy luật giá trị biểu hiện qua Cung - Cầu.
            </p>
            <Link className="button primary" href={`/host/${roomCode}`}>
              <RotateCcw size={17} />
              Điều khiển lại
            </Link>
          </section>
        </aside>
      </div>
    </main>
  );
}
