import { type NextRequest } from "next/server";
import { getNotificationsByUser } from "@/lib/store";

export function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");

  if (!userId) {
    return Response.json(
      { error: "userId query parametresi zorunludur" },
      { status: 400 }
    );
  }

  const notifications = getNotificationsByUser(userId);
  return Response.json(notifications);
}
