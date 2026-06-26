export const BASE_VALUE = 10;
export const ROUND_DURATION_SECONDS = 90;
export const TOTAL_ROUNDS = 6;
export const OUTPUT_MIN = 1;
export const OUTPUT_MAX = 30;

export type RoomPhase = "waiting" | "submitting" | "results" | "finished";
export type RoomRole = "host" | "team";

export type Team = {
  id: number;
  name: string;
  craft: string;
  accent: string;
  playerName?: string;
};

export type RoundScenario = {
  round: number;
  title: string;
  demand: number;
  event: string;
  hostHint: string;
};

export type Submission = {
  teamId: number;
  output: number;
  submittedAt: number;
};

export type TeamRoundResult = {
  teamId: number;
  output: number;
  cost: number;
  revenue: number;
  profit: number;
  wasDefaulted: boolean;
};

export type RoundResult = {
  round: number;
  title: string;
  demand: number;
  totalSupply: number;
  marketPrice: number;
  baseValue: number;
  closedAt: number;
  teamResults: TeamRoundResult[];
};

export type RoomState = {
  code: string;
  createdAt: number;
  teams: Team[];
  currentRound: number;
  phase: RoomPhase;
  durationSeconds: number;
  roundStartedAt: number;
  roundEndsAt: number;
  demandByRound: Record<number, number>;
  submissions: Submission[];
  history: RoundResult[];
};

export type RoomView = {
  code: string;
  createdAt: number;
  teams: Team[];
  currentRound: number;
  phase: RoomPhase;
  durationSeconds: number;
  roundStartedAt: number;
  roundEndsAt: number;
  submissions: Submission[];
  history: RoundResult[];
  serverNow: number;
  currentScenario: RoundScenario;
  submittedTeamIds: number[];
  currentDemand?: number;
  demandByRound?: Record<number, number>;
};

export const TEAMS: Team[] = [
  { id: 1, name: "Xưởng Tơ Lụa", craft: "Dệt vải", accent: "#f6c75b" },
  { id: 2, name: "Làng Gốm Sen", craft: "Nung gốm", accent: "#ff654f" },
  { id: 3, name: "Phường Mộc", craft: "Đục chạm", accent: "#83c55b" },
  { id: 4, name: "Xưởng Đồng", craft: "Đúc khuôn", accent: "#32d4bf" },
  { id: 5, name: "Lò Nhuộm Chàm", craft: "Nhuộm sợi", accent: "#8bb7ff" },
  { id: 6, name: "Chợ Sợi Vàng", craft: "Buôn sợi", accent: "#f6a85b" },
  { id: 7, name: "Xưởng Tre Lá", craft: "Đan lát", accent: "#a6df72" }
];

export const ROUND_SCENARIOS: RoundScenario[] = [
  {
    round: 1,
    title: "Cân bằng mở chợ",
    demand: 120,
    event: "Thị trường ổn định, các xưởng thăm dò sức mua.",
    hostHint: "Kỳ vọng tổng cung quanh 120 mét để giá ở gần 10 Gold."
  },
  {
    round: 2,
    title: "Khủng hoảng thừa",
    demand: 120,
    event: "Cầu giữ nguyên, nhưng lòng tham dễ kéo sản lượng lên quá cao.",
    hostHint: "Nếu tổng cung vọt lên khoảng 200 mét, giá rơi về gần 6 Gold."
  },
  {
    round: 3,
    title: "Mùa cưới hoàng gia",
    demand: 140,
    event: "Lễ hội đến gần, cầu vải tăng mạnh trong khi các xưởng còn sợ lỗ.",
    hostHint: "Nếu tổng cung tụt quanh 70 mét, giá có thể vọt lên 20 Gold."
  },
  {
    round: 4,
    title: "Bàn tay tự điều tiết",
    demand: 120,
    event: "Người chơi bắt đầu cân bằng giữa tham lam và sợ hãi.",
    hostHint: "Tổng cung hội tụ về 115-125 mét sẽ kéo giá về trục 10 Gold."
  },
  {
    round: 5,
    title: "Thương lái hủy đơn",
    demand: 90,
    event: "Một đơn hàng lớn bị hủy, sức mua chững lại bất ngờ.",
    hostHint: "Cú sốc cầu giảm cho thấy sản xuất cao vẫn có thể lỗ dù vừa thắng."
  },
  {
    round: 6,
    title: "Hội tụ cuối phiên",
    demand: 120,
    event: "Thị trường bình ổn, các xưởng có cơ hội tự điều chỉnh lần cuối.",
    hostHint: "Vòng chốt để biểu đồ cho thấy giá xoay quanh giá trị gốc."
  }
];

export function getScenario(round: number) {
  return ROUND_SCENARIOS.find((scenario) => scenario.round === round) ?? ROUND_SCENARIOS[0];
}

export function clampOutput(output: number) {
  if (!Number.isFinite(output)) {
    return OUTPUT_MIN;
  }
  return Math.max(OUTPUT_MIN, Math.min(OUTPUT_MAX, Math.round(output)));
}

export function calculateCost(outputValue: number) {
  const output = clampOutput(outputValue);
  const firstTier = Math.min(output, 10) * 10;
  const secondTier = Math.min(Math.max(output - 10, 0), 10) * 13;
  const thirdTier = Math.max(output - 20, 0) * 17;

  return firstTier + secondTier + thirdTier;
}

export function calculateMarketPrice(demand: number, totalSupply: number) {
  if (totalSupply <= 0) {
    return 0;
  }

  return roundGold(BASE_VALUE * (demand / totalSupply));
}

export function roundGold(value: number) {
  return Math.round(value * 10) / 10;
}

export function buildRoundResult(
  round: number,
  demand: number,
  submissions: Array<Submission & { wasDefaulted?: boolean }>,
  closedAt = Date.now()
): RoundResult {
  const scenario = getScenario(round);
  const totalSupply = submissions.reduce((sum, submission) => sum + clampOutput(submission.output), 0);
  const marketPrice = calculateMarketPrice(demand, totalSupply);
  const teamResults = submissions.map((submission) => {
    const output = clampOutput(submission.output);
    const cost = calculateCost(output);
    const revenue = roundGold(marketPrice * output);
    const profit = roundGold(revenue - cost);

    return {
      teamId: submission.teamId,
      output,
      cost,
      revenue,
      profit,
      wasDefaulted: Boolean(submission.wasDefaulted)
    };
  });

  return {
    round,
    title: scenario.title,
    demand,
    totalSupply,
    marketPrice,
    baseValue: BASE_VALUE,
    closedAt,
    teamResults
  };
}

export function getCumulativeScores(history: RoundResult[]) {
  return TEAMS.map((team) => {
    const totalProfit = history.reduce((sum, round) => {
      return sum + (round.teamResults.find((result) => result.teamId === team.id)?.profit ?? 0);
    }, 0);

    return {
      ...team,
      totalProfit: roundGold(totalProfit)
    };
  }).sort((a, b) => b.totalProfit - a.totalProfit);
}

export function getTeamRoundResult(history: RoundResult[], teamId: number) {
  return [...history]
    .reverse()
    .map((round) => round.teamResults.find((result) => result.teamId === teamId))
    .find(Boolean);
}

export function formatGold(value: number) {
  return `${new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 1
  }).format(roundGold(value))} Gold`;
}

export function formatMeters(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)} mét`;
}
