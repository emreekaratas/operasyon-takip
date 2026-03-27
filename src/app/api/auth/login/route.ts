import { type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getUserById } from "@/lib/store";

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

  const { userId } = body as { userId?: string };

  if (!userId || typeof userId !== "string") {
    return Response.json(
      { error: "userId zorunludur" },
      { status: 400 }
    );
  }

  const user = getUserById(userId);
  if (!user) {
    return Response.json(
      { error: "Kullanıcı bulunamadı" },
      { status: 404 }
    );
  }

  const cookieStore = await cookies();
  cookieStore.set("session_user", JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return Response.json(user);
}
