"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RoomRole, RoomView } from "@/lib/game";

type RoomResponse = {
  room?: RoomView;
  error?: string;
};

export function useRoom(roomCode: string, role: RoomRole) {
  const [room, setRoom] = useState<RoomView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const alive = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/room/${roomCode}?role=${role}`, {
        cache: "no-store"
      });
      const payload = (await response.json()) as RoomResponse;

      if (!response.ok || !payload.room) {
        throw new Error(payload.error ?? "Không tải được phòng chơi.");
      }

      if (alive.current) {
        setRoom(payload.room);
        setError(null);
      }
    } catch (caught) {
      if (alive.current) {
        setError(caught instanceof Error ? caught.message : "Không tải được phòng chơi.");
      }
    } finally {
      if (alive.current) {
        setLoading(false);
      }
    }
  }, [roomCode, role]);

  useEffect(() => {
    alive.current = true;
    void refresh();
    const interval = window.setInterval(refresh, 1000);

    return () => {
      alive.current = false;
      window.clearInterval(interval);
    };
  }, [refresh]);

  return { room, setRoom, error, loading, refresh };
}

export async function postRoomAction<T>(url: string, body?: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Thao tác thất bại.");
  }

  return payload;
}
