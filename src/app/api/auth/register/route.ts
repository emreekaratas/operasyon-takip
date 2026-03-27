import { type NextRequest } from "next/server";
import { emailExists, addUser, stripPasswordHash } from "@/lib/store";
import { hashPassword } from "@/lib/hash";
import { setSessionCookie } from "@/lib/session";
import { StoredUser, UserRole } from "@/types";

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

  const { name, email, password, role } = body as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  };

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return Response.json(
      { error: "İsim zorunludur" },
      { status: 400 }
    );
  }

  if (!email || typeof email !== "string") {
    return Response.json(
      { error: "Email zorunludur" },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return Response.json(
      { error: "Geçerli bir email adresi girin" },
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

  const validRoles: UserRole[] = ["manager", "worker"];
  if (!role || !validRoles.includes(role as UserRole)) {
    return Response.json(
      { error: "Geçerli bir rol seçin (manager veya worker)" },
      { status: 400 }
    );
  }

  if (emailExists(email)) {
    return Response.json(
      { error: "Bu email adresi zaten kayıtlı" },
      { status: 409 }
    );
  }

  const newUser: StoredUser = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    role: role as UserRole,
    passwordHash: hashPassword(password),
  };

  addUser(newUser);
  await setSessionCookie(newUser.id);

  return Response.json(stripPasswordHash(newUser), { status: 201 });
}
