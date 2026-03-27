import { cookies } from "next/headers";
import { SessionPayload, User } from "@/types";
import { getUserById } from "@/lib/store";

const SESSION_COOKIE = "session_user";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export function createSessionPayload(userId: string): SessionPayload {
  return {
    userId,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };
}

export async function setSessionCookie(userId: string): Promise<void> {
  const payload = createSessionPayload(userId);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);

  if (!sessionCookie) return null;

  try {
    const payload: SessionPayload = JSON.parse(sessionCookie.value);

    if (Date.now() > payload.expiresAt) {
      await clearSessionCookie();
      return null;
    }

    const user = getUserById(payload.userId);
    return user ?? null;
  } catch {
    await clearSessionCookie();
    return null;
  }
}
