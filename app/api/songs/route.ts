import { getLocalSongs } from "../../../lib/local-song-library";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const songs = await getLocalSongs();
  return Response.json({ songs }, { headers: { "Cache-Control": "no-store" } });
}
