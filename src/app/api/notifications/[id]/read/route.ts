import { markNotificationRead } from "@/lib/store";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const notification = markNotificationRead(id);

  if (!notification) {
    return Response.json(
      { error: "Bildirim bulunamadı" },
      { status: 404 }
    );
  }

  return Response.json(notification);
}
