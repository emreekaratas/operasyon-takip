import { getUsers } from "@/lib/store";

export function GET() {
  return Response.json(getUsers());
}
