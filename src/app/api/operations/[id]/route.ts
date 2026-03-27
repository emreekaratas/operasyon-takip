import {
  getOperationById,
  deleteOperation as storeDeleteOperation,
} from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const operation = getOperationById(id);

  if (!operation) {
    return Response.json(
      { error: "Operasyon bulunamadı" },
      { status: 404 }
    );
  }

  return Response.json(operation);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = storeDeleteOperation(id);

  if (!deleted) {
    return Response.json(
      { error: "Operasyon bulunamadı" },
      { status: 404 }
    );
  }

  return Response.json({ success: true });
}
