import { createReadStream } from "node:fs";
import { realpath, stat } from "node:fs/promises";
import { Readable } from "node:stream";
import path from "node:path";
import { getSongsRoot, isSupportedAudio } from "../../../../lib/local-song-library";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ path: string[] }> };

const MIME_TYPES: Record<string, string> = {
  ".mp3": "audio/mpeg", ".wav": "audio/wav", ".m4a": "audio/mp4", ".mp4": "audio/mp4",
  ".aac": "audio/aac", ".ogg": "audio/ogg", ".oga": "audio/ogg", ".opus": "audio/ogg",
  ".flac": "audio/flac", ".aiff": "audio/aiff", ".aif": "audio/aiff",
};

async function serve(request: Request, context: Context, headOnly = false) {
  const { path: segments } = await context.params;
  if (!segments?.length || segments.some((segment) => segment === "." || segment === ".." || segment.includes("\\"))) {
    return new Response("Not found", { status: 404 });
  }

  const root = await realpath(getSongsRoot()).catch(() => null);
  if (!root) return new Response("Song library is unavailable", { status: 404 });
  const candidate = path.resolve(root, ...segments);
  if (!candidate.startsWith(`${root}${path.sep}`) || !isSupportedAudio(candidate)) return new Response("Not found", { status: 404 });
  const resolved = await realpath(candidate).catch(() => null);
  if (!resolved || !resolved.startsWith(`${root}${path.sep}`)) return new Response("Not found", { status: 404 });
  const info = await stat(resolved).catch(() => null);
  if (!info?.isFile()) return new Response("Not found", { status: 404 });

  const headers = new Headers({
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=3600",
    "Content-Type": MIME_TYPES[path.extname(resolved).toLowerCase()] || "application/octet-stream",
    "X-Content-Type-Options": "nosniff",
  });
  const range = request.headers.get("range");
  let start = 0;
  let end = info.size - 1;
  let status = 200;
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match || (!match[1] && !match[2])) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${info.size}` } });
    if (!match[1]) {
      const suffixLength = Number(match[2]);
      start = Math.max(0, info.size - suffixLength);
    } else {
      start = Number(match[1]);
      if (match[2]) end = Number(match[2]);
    }
    if (start >= info.size || end < start) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${info.size}` } });
    end = Math.min(end, info.size - 1);
    status = 206;
    headers.set("Content-Range", `bytes ${start}-${end}/${info.size}`);
  }
  headers.set("Content-Length", String(end - start + 1));
  if (headOnly) return new Response(null, { status, headers });
  const stream = createReadStream(resolved, { start, end });
  return new Response(Readable.toWeb(stream) as ReadableStream, { status, headers });
}

export async function GET(request: Request, context: Context) {
  return serve(request, context);
}

export async function HEAD(request: Request, context: Context) {
  return serve(request, context, true);
}
