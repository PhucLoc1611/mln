import { RoundResult, TEAMS, TeamRoundResult, formatGold, formatMeters, getCumulativeScores } from "@/lib/game";

export function getTeam(teamId: number) {
  return TEAMS.find((team) => team.id === teamId) ?? TEAMS[0];
}

export function getLatestRound(history: RoundResult[]) {
  return history.length > 0 ? history[history.length - 1] : null;
}

export function getTeamResult(history: RoundResult[], teamId: number) {
  return [...history]
    .reverse()
    .flatMap((round) => round.teamResults.map((result) => ({ round: round.round, result })))
    .find((entry) => entry.result.teamId === teamId);
}

export function sortRoundResults(results: TeamRoundResult[]) {
  return [...results].sort((a, b) => b.profit - a.profit);
}

export function cumulativeRows(history: RoundResult[]) {
  return getCumulativeScores(history).map((row, index) => ({
    rank: index + 1,
    ...row
  }));
}

export function describeResult(profit: number) {
  if (profit > 0) {
    return `Lãi ${formatGold(profit)}`;
  }
  if (profit < 0) {
    return `Lỗ ${formatGold(Math.abs(profit))}`;
  }
  return "Hòa vốn";
}

export { formatGold, formatMeters };
