import { starterAffirmations } from "../data/affirmations";
import { starterSongs } from "../data/aurora-songs";
import type { Affirmation, AuroraContent, Song } from "../types/content";

const SONGS_KEY = "aurora-songs-v1";
const LIGHTS_KEY = "aurora-affirmations-v1";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const hasSupabase = Boolean(supabaseUrl && supabaseKey);

function localRead<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

export function readLocalContent(): AuroraContent {
  const savedSongs = localRead<Partial<Song>[]>(SONGS_KEY, starterSongs);
  return {
    // Ignore URL-only song records saved by an earlier local preview.
    songs: savedSongs.filter((song): song is Song => Boolean(song.id && song.audioUrl && song.storagePath && song.fileName)),
    affirmations: localRead(LIGHTS_KEY, starterAffirmations),
  };
}

export function writeLocalContent(content: AuroraContent) {
  localStorage.setItem(SONGS_KEY, JSON.stringify(content.songs));
  localStorage.setItem(LIGHTS_KEY, JSON.stringify(content.affirmations));
  window.dispatchEvent(new Event("aurora-content-updated"));
}

function songFromRow(row: Record<string, unknown>): Song {
  return {
    id: String(row.id), title: String(row.title), artist: String(row.artist),
    audioUrl: String(row.audio_url || ""), storagePath: String(row.storage_path || ""), fileName: String(row.file_name || ""),
    coverImage: typeof row.cover_image_url === "string" ? row.cover_image_url : "",
    note: typeof row.note === "string" ? row.note : "", position: Number(row.position || 0),
    isActive: Boolean(row.is_active),
  };
}

function affirmationFromRow(row: Record<string, unknown>): Affirmation {
  return {
    id: String(row.id), message: String(row.message),
    supportingText: typeof row.supporting_text === "string" ? row.supporting_text : "",
    category: typeof row.category === "string" ? row.category : "Hope", isActive: Boolean(row.is_active),
  };
}

export async function loadPublicContent(): Promise<AuroraContent> {
  if (hasSupabase && supabaseUrl && supabaseKey) {
    try {
      const headers = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` };
      const [songResponse, lightResponse] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/songs?select=id,title,artist,audio_url,storage_path,file_name,cover_image_url,note,position,is_active&is_active=eq.true&order=position.asc`, { headers, cache: "no-store" }),
        fetch(`${supabaseUrl}/rest/v1/affirmations?select=*&is_active=eq.true&order=created_at.asc`, { headers, cache: "no-store" }),
      ]);
      if (!songResponse.ok || !lightResponse.ok) throw new Error("Content service unavailable");
      const [songs, affirmations] = await Promise.all([songResponse.json(), lightResponse.json()]);
      return {
        songs: (songs as Record<string, unknown>[]).map(songFromRow).filter((song) => song.audioUrl),
        affirmations: (affirmations as Record<string, unknown>[]).map(affirmationFromRow),
      };
    } catch (error) {
      console.warn("AURORA content service is unavailable; showing the local collection.", error);
    }
  }
  const local = readLocalContent();
  return {
    songs: local.songs.filter((song) => song.isActive).sort((a, b) => a.position - b.position),
    affirmations: local.affirmations.filter((item) => item.isActive),
  };
}

export function supabaseRestUrl() { return supabaseUrl; }
export function supabaseAnonKey() { return supabaseKey; }
