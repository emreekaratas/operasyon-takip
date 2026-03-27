import { type NextRequest } from "next/server";
import { getStoredUserByEmail, stripPasswordHash } from "@/lib/store";
import { verifyPassword } from "@/lib/hash";
import { setSessionCookie } from "@/lib/session";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Geçersiz JSON formatı" },
      { status: 400 }
    );
  }

  const { email, password } = body as { email?: string; password?: string };

  if (!email || typeof email !== "string") {
    return Response.json(
      { error: "Email zorunludur" },
      { status: 400 }
    );
  }

  if (!password || typeof password !== "string") {
    return Response.json(
      { error: "Şifre zorunludur" },
      { status: 400 }
    );
  }

  if (password.length < 4) {
    return Response.json(
      { error: "Şifre en az 4 karakter olmalıdır" },
      { status: 400 }
    );
  }

  const storedUser = getStoredUserByEmail(email);
  if (!storedUser || !verifyPassword(password, storedUser.passwordHash)) {
    return Response.json(
      { error: "Geçersiz email veya şifre" },
      { status: 401 }
    );
  }

  await setSessionCookie(storedUser.id);

  return Response.json(stripPasswordHash(storedUser));
}
