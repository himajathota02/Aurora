import { open, readdir } from "node:fs/promises";
import path from "node:path";
import type { Song } from "../types/content";

const SONGS_ROOT = path.join(process.cwd(), "Songs");
const SUPPORTED_AUDIO = new Set([".mp3", ".wav", ".m4a", ".mp4", ".aac", ".ogg", ".oga", ".opus", ".flac", ".aiff", ".aif"]);

function decodeText(frame: Buffer) {
  if (frame.length < 2) return "";
  const encoding = frame[0];
  const content = frame.subarray(1);
  try {
    if (encoding === 1) return new TextDecoder("utf-16").decode(content).replace(/\0/g, "").trim();
    if (encoding === 2) return new TextDecoder("utf-16be").decode(content).replace(/\0/g, "").trim();
    if (encoding === 0) return new TextDecoder("iso-8859-1").decode(content).replace(/\0/g, "").trim();
    return new TextDecoder("utf-8").decode(content).replace(/\0/g, "").trim();
  } catch {
    return "";
  }
}

function cleanTitle(title: string) {
  return title
    .replace(/^\s*\d{1,3}\s*[-_.]*\s*/, "")
    .replace(/\s*[([]?(?:www\.)?(?:sensongsmp3(?:\.[a-z]+)?|pagalnew|koshalworld|mp3\.pm|ceenaija)[^\])]*[)\]]?\s*$/i, "")
    .replace(/\s*(?:__|::)\s*(?:www\.)?sensongs[^)]*$/i, "")
    .replace(/[_]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/[\s\-|:]+$/g, "")
    .trim();
}

async function readId3(filePath: string) {
  const handle = await open(filePath, "r");
  const prefix = Buffer.alloc(256 * 1024);
  let bytesRead = 0;
  try {
    ({ bytesRead } = await handle.read(prefix, 0, prefix.length, 0));
  } finally {
    await handle.close();
  }
  const file = prefix.subarray(0, bytesRead);
  if (file.length < 10 || file.toString("ascii", 0, 3) !== "ID3") return {};
  const version = file[3];
  const tagSize = ((file[6] & 0x7f) << 21) | ((file[7] & 0x7f) << 14) | ((file[8] & 0x7f) << 7) | (file[9] & 0x7f);
  const end = Math.min(file.length, tagSize + 10);
  const tags: { title?: string; artist?: string } = {};
  let offset = 10;

  while (offset + 10 <= end) {
    const id = file.toString("ascii", offset, offset + 4);
    if (!/^[A-Z0-9]{4}$/.test(id) || id === "0000") break;
    const size = version === 4
      ? ((file[offset + 4] & 0x7f) << 21) | ((file[offset + 5] & 0x7f) << 14) | ((file[offset + 6] & 0x7f) << 7) | (file[offset + 7] & 0x7f)
      : file.readUInt32BE(offset + 4);
    if (!size || offset + 10 + size > end) break;
    if (id === "TIT2") tags.title = cleanTitle(decodeText(file.subarray(offset + 10, offset + 10 + size)));
    if (id === "TPE1") tags.artist = decodeText(file.subarray(offset + 10, offset + 10 + size));
    offset += 10 + size;
  }
  return tags;
}

async function walk(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    if (entry.name.startsWith(".")) return [];
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    if (entry.isFile() && SUPPORTED_AUDIO.has(path.extname(entry.name).toLowerCase())) return [fullPath];
    return [];
  }));
  return files.flat();
}

export async function getLocalSongs(): Promise<Song[]> {
  const files = await walk(SONGS_ROOT).catch(() => []);
  const relativePaths = files
    .map((file) => path.relative(SONGS_ROOT, file).split(path.sep).join("/"))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true, sensitivity: "base" }));

  return Promise.all(relativePaths.map(async (relativePath, position) => {
    const fileName = path.posix.basename(relativePath);
    const fullPath = path.join(SONGS_ROOT, ...relativePath.split("/"));
    const tags = await readId3(fullPath).catch((): { title?: string; artist?: string } => ({}));
    const nameFromFile = cleanTitle(path.posix.basename(fileName, path.posix.extname(fileName)));
    const encodedPath = relativePath.split("/").map(encodeURIComponent).join("/");
    return {
      id: relativePath,
      title: tags.title || nameFromFile || fileName,
      artist: tags.artist || "",
      audioUrl: `/api/songs/${encodedPath}`,
      storagePath: relativePath,
      fileName,
      position,
      isActive: true,
    } satisfies Song;
  }));
}

export function getSongsRoot() {
  return SONGS_ROOT;
}

export function isSupportedAudio(filePath: string) {
  return SUPPORTED_AUDIO.has(path.extname(filePath).toLowerCase());
}
