import { describe, expect, it } from "vitest";
import { buildRoundResult, calculateCost, calculateMarketPrice } from "./game";

describe("game economics", () => {
  it("calculates tiered labor cost", () => {
    expect(calculateCost(10)).toBe(100);
    expect(calculateCost(11)).toBe(113);
    expect(calculateCost(20)).toBe(230);
    expect(calculateCost(30)).toBe(400);
  });

  it("calculates market price from base value, demand, and supply", () => {
    expect(calculateMarketPrice(120, 120)).toBe(10);
    expect(calculateMarketPrice(120, 200)).toBe(6);
    expect(calculateMarketPrice(140, 70)).toBe(20);
  });

  it("builds round result with profit", () => {
    const result = buildRoundResult(1, 120, [
      { teamId: 1, output: 10, submittedAt: 1 },
      { teamId: 2, output: 20, submittedAt: 1 },
      { teamId: 3, output: 30, submittedAt: 1 },
      { teamId: 4, output: 10, submittedAt: 1 },
      { teamId: 5, output: 20, submittedAt: 1 },
      { teamId: 6, output: 20, submittedAt: 1 },
      { teamId: 7, output: 10, submittedAt: 1 }
    ]);

    expect(result.totalSupply).toBe(120);
    expect(result.marketPrice).toBe(10);
    expect(result.teamResults.find((team) => team.teamId === 1)?.profit).toBe(0);
    expect(result.teamResults.find((team) => team.teamId === 3)?.profit).toBe(-100);
  });
});
