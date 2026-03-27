import { cookies } from "next/headers";
import { User } from "@/types";

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session_user");

  if (!sessionCookie) {
    return Response.json(
      { error: "Oturum bulunamadı" },
      { status: 401 }
    );
  }

  try {
    const user: User = JSON.parse(sessionCookie.value);
    return Response.json(user);
  } catch {
    return Response.json(
      { error: "Geçersiz oturum verisi" },
      { status: 401 }
    );
  }
}
