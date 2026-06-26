import { RoundResult, TEAMS, TeamRoundResult, formatGold, formatMeters, getCumulativeScores } from "@/lib/game";

export function getTeam(teamId: number, teams?: any[]) {
  const dynamicTeam = teams?.find((t) => t.id === teamId);
  if (dynamicTeam) {
    return {
      ...dynamicTeam,
      name: dynamicTeam.playerName ? `${dynamicTeam.name} (${dynamicTeam.playerName})` : dynamicTeam.name
    };
  }
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

export function cumulativeRows(history: RoundResult[], teams?: any[]) {
  return getCumulativeScores(history).map((row, index) => {
    const dynamicTeam = teams?.find((t) => t.id === row.id);
    return {
      rank: index + 1,
      ...row,
      name: dynamicTeam?.playerName ? `${row.name} (${dynamicTeam.playerName})` : row.name
    };
  });
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
