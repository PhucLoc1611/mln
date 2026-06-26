import {
  OUTPUT_MIN,
  ROUND_DURATION_SECONDS,
  ROUND_SCENARIOS,
  RoomRole,
  RoomState,
  RoomView,
  Submission,
  TEAMS,
  TOTAL_ROUNDS,
  buildRoundResult,
  clampOutput,
  getScenario
} from "./game";

type StoreGlobal = typeof globalThis & {
  __priceRoundRooms?: Map<string, RoomState>;
};

const storeGlobal = globalThis as StoreGlobal;
const rooms = storeGlobal.__priceRoundRooms ?? new Map<string, RoomState>();
storeGlobal.__priceRoundRooms = rooms;

function makeCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let index = 0; index < 5; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

function makeDemandByRound() {
  return Object.fromEntries(ROUND_SCENARIOS.map((scenario) => [scenario.round, scenario.demand]));
}

export function createRoom() {
  let code = makeCode();
  while (rooms.has(code)) {
    code = makeCode();
  }

  const now = Date.now();
  const room: RoomState = {
    code,
    createdAt: now,
    teams: TEAMS,
    currentRound: 1,
    phase: "submitting",
    durationSeconds: ROUND_DURATION_SECONDS,
    roundStartedAt: now,
    roundEndsAt: now + ROUND_DURATION_SECONDS * 1000,
    demandByRound: makeDemandByRound(),
    submissions: [],
    history: []
  };

  rooms.set(code, room);
  return room;
}

export function getRoom(code: string) {
  return rooms.get(code.toUpperCase());
}

export function serializeRoom(room: RoomState, role: RoomRole): RoomView {
  const submittedTeamIds = room.submissions.map((submission) => submission.teamId);
  const currentScenario = getScenario(room.currentRound);
  const view: RoomView = {
    code: room.code,
    createdAt: room.createdAt,
    teams: room.teams,
    currentRound: room.currentRound,
    phase: room.phase,
    durationSeconds: room.durationSeconds,
    roundStartedAt: room.roundStartedAt,
    roundEndsAt: room.roundEndsAt,
    submissions: role === "host" ? room.submissions : [],
    history: room.history,
    serverNow: Date.now(),
    currentScenario,
    submittedTeamIds
  };

  if (role === "host") {
    view.currentDemand = getCurrentDemand(room);
    view.demandByRound = room.demandByRound;
  }

  return view;
}

export function getCurrentDemand(room: RoomState) {
  return room.demandByRound[room.currentRound] ?? getScenario(room.currentRound).demand;
}

export function updateDemand(code: string, demandValue: number) {
  const room = getRequiredRoom(code);
  const demand = Math.max(1, Math.round(demandValue));
  room.demandByRound[room.currentRound] = demand;
  return room;
}

export function submitOutput(code: string, teamId: number, outputValue: number) {
  const room = getRequiredRoom(code);
  if (room.phase !== "submitting") {
    throw new StoreError("Vòng này đã khóa nộp sản lượng.", 409);
  }

  const team = room.teams.find((candidate) => candidate.id === teamId);
  if (!team) {
    throw new StoreError("Xưởng không tồn tại.", 400);
  }

  if (room.submissions.some((submission) => submission.teamId === teamId)) {
    throw new StoreError("Xưởng này đã nộp sản lượng.", 409);
  }

  const submission: Submission = {
    teamId,
    output: clampOutput(outputValue),
    submittedAt: Date.now()
  };

  room.submissions.push(submission);
  return room;
}

export function closeRound(code: string, demandOverride?: number) {
  const room = getRequiredRoom(code);
  if (room.phase === "finished") {
    return room;
  }

  if (room.phase === "results") {
    return room;
  }

  if (typeof demandOverride === "number") {
    room.demandByRound[room.currentRound] = Math.max(1, Math.round(demandOverride));
  }

  const submissions = room.teams.map((team) => {
    const submitted = room.submissions.find((submission) => submission.teamId === team.id);
    if (submitted) {
      return { ...submitted, wasDefaulted: false };
    }

    return {
      teamId: team.id,
      output: OUTPUT_MIN,
      submittedAt: Date.now(),
      wasDefaulted: true
    };
  });

  const result = buildRoundResult(room.currentRound, getCurrentDemand(room), submissions);
  room.history = [...room.history.filter((round) => round.round !== room.currentRound), result].sort(
    (a, b) => a.round - b.round
  );
  room.submissions = [];
  room.phase = room.currentRound >= TOTAL_ROUNDS ? "finished" : "results";
  return room;
}

export function nextRound(code: string) {
  const room = getRequiredRoom(code);
  if (room.currentRound >= TOTAL_ROUNDS) {
    room.phase = "finished";
    return room;
  }

  if (room.phase === "submitting") {
    throw new StoreError("Hãy khóa vòng hiện tại trước khi sang vòng mới.", 409);
  }

  const now = Date.now();
  room.currentRound += 1;
  room.phase = "submitting";
  room.roundStartedAt = now;
  room.roundEndsAt = now + room.durationSeconds * 1000;
  room.submissions = [];
  return room;
}

export function resetRoom(code: string) {
  const room = getRequiredRoom(code);
  const now = Date.now();
  room.currentRound = 1;
  room.phase = "submitting";
  room.roundStartedAt = now;
  room.roundEndsAt = now + room.durationSeconds * 1000;
  room.demandByRound = makeDemandByRound();
  room.submissions = [];
  room.history = [];
  return room;
}

export class StoreError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

function getRequiredRoom(code: string) {
  const room = getRoom(code);
  if (!room) {
    throw new StoreError("Không tìm thấy phòng chơi.", 404);
  }
  return room;
}
