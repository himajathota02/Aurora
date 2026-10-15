"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Check, ChevronLeft, Eye, EyeOff, LoaderCircle, LogOut, Save, Trash2 } from "lucide-react";
import { starterAffirmations } from "../../data/affirmations";
import { starterSongs } from "../../data/aurora-songs";
import { hasSupabase, readLocalContent, supabaseAnonKey, supabaseRestUrl, writeLocalContent } from "../../lib/content-store";
import type { Affirmation, Song } from "../../types/content";
import "../admin.css";

type Tab = "songs" | "affirmations";
type AuthUser = { access_token: string; user: { app_metadata?: { role?: string } } };

function recordId(prefix: string) { return `${prefix}-${crypto.randomUUID()}`; }
function tableRecord(item: Song | Affirmation) {
  if ("audioUrl" in item) return { id: item.id, title: item.title, artist: item.artist, audio_url: item.audioUrl, storage_path: item.storagePath, file_name: item.fileName, cover_image_url: item.coverImage || null, note: item.note || null, position: item.position, is_active: item.isActive };
  return { id: item.id, message: item.message, supporting_text: item.supportingText || null, category: item.category, is_active: item.isActive };
}
function songRecord(row: Record<string, unknown>): Song {
  return { id: String(row.id), title: String(row.title), artist: String(row.artist), audioUrl: String(row.audio_url || ""), storagePath: String(row.storage_path || ""), fileName: String(row.file_name || ""), coverImage: String(row.cover_image_url || ""), note: String(row.note || ""), position: Number(row.position || 0), isActive: Boolean(row.is_active) };
}
function affirmationRecord(row: Record<string, unknown>): Affirmation {
  return { id: String(row.id), message: String(row.message), supportingText: String(row.supporting_text || ""), category: String(row.category || "Hope"), isActive: Boolean(row.is_active) };
}

const audioTypes: Record<string, string> = {
  mp3: "audio/mpeg", m4a: "audio/mp4", mp4: "audio/mp4", aac: "audio/aac",
  wav: "audio/wav", ogg: "audio/ogg", oga: "audio/ogg", webm: "audio/webm", flac: "audio/flac",
};
const maxAudioBytes = 100 * 1024 * 1024;

function audioFileType(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  return audioTypes[extension] || file.type.toLowerCase();
}

function validAudioFile(file: File) {
  return Object.values(audioTypes).includes(audioFileType(file)) && file.size > 0 && file.size <= maxAudioBytes;
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("songs");
  const [songs, setSongs] = useState<Song[]>(starterSongs);
  const [affirmations, setAffirmations] = useState<Affirmation[]>(starterAffirmations);
  const [ready, setReady] = useState(false);
  const [demoValid, setDemoValid] = useState(false);
  const [token, setToken] = useState("");
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [supabasePassword, setSupabasePassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [songDraft, setSongDraft] = useState({ title: "", artist: "", coverImage: "", note: "" });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [affirmationDraft, setAffirmationDraft] = useState({ message: "", supportingText: "", category: "Hope" });
  const [editingSong, setEditingSong] = useState<string | null>(null);
  const [editingAffirmation, setEditingAffirmation] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const local = readLocalContent();
    queueMicrotask(() => {
      if (!active) return;
      setSongs(local.songs);
      setAffirmations(local.affirmations);
      setReady(true);
    });
    if (!hasSupabase) {
      fetch("/api/admin/session", { cache: "no-store" }).then((response) => response.json()).then((data) => { if (active) setDemoValid(Boolean(data.valid)); }).catch(() => undefined);
    }
    return () => { active = false; };
  }, []);

  const supabaseReady = Boolean(token && hasSupabase);
  const authenticated = hasSupabase ? supabaseReady : demoValid;
  const activeSongs = useMemo(() => songs.filter((song) => song.isActive).length, [songs]);

  async function uploadAudioFile(file: File) {
    const url = supabaseRestUrl();
    const key = supabaseAnonKey();
    if (!url || !key || !token) throw new Error("Sign in to Supabase before uploading audio.");
    const safeName = file.name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(-120) || "track-audio";
    const path = `${crypto.randomUUID()}/${safeName}`;
    const encodedPath = path.split("/").map(encodeURIComponent).join("/");
    const response = await fetch(`${url}/storage/v1/object/aurora-songs/${encodedPath}`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${token}`, "Content-Type": audioFileType(file), "x-upsert": "false" },
      body: file,
    });
    if (!response.ok) throw new Error(`Audio upload failed (${response.status}). Check the Supabase Storage bucket and administrator policy.`);
    return { audioUrl: `${url}/storage/v1/object/public/aurora-songs/${encodedPath}`, storagePath: path, fileName: file.name };
  }

  async function removeUploadedAudio(path: string) {
    const url = supabaseRestUrl();
    const key = supabaseAnonKey();
    if (!url || !key || !token || !path) return;
    const response = await fetch(`${url}/storage/v1/object/aurora-songs`, {
      method: "DELETE",
      headers: { apikey: key, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prefixes: [path] }),
    });
    if (!response.ok) throw new Error("The song entry saved, but its old audio file could not be removed from Storage.");
  }

  async function persist(table: "songs" | "affirmations", beforeIds: string[], items: (Song | Affirmation)[]) {
    if (!hasSupabase) {
      writeLocalContent({ songs: table === "songs" ? items as Song[] : songs, affirmations: table === "affirmations" ? items as Affirmation[] : affirmations });
      setMessage("Saved in this browser. Connect Supabase for a shared, persistent library.");
      return true;
    }
    const url = supabaseRestUrl();
    const key = supabaseAnonKey();
    if (!url || !key || !token) return false;
    const headers = { apikey: key, Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" };
    try {
      const removed = beforeIds.filter((id) => !items.some((item) => item.id === id));
      if (removed.length) {
        const query = removed.map((id) => `"${id}"`).join(",");
        const response = await fetch(`${url}/rest/v1/${table}?id=in.(${encodeURIComponent(query)})`, { method: "DELETE", headers });
        if (!response.ok) throw new Error(await response.text());
      }
      if (items.length) {
        const response = await fetch(`${url}/rest/v1/${table}?on_conflict=id`, { method: "POST", headers, body: JSON.stringify(items.map(tableRecord)) });
        if (!response.ok) throw new Error(await response.text());
      }
      setMessage("Changes saved to Supabase.");
      setError("");
      return true;
    } catch (cause) {
      setError(`Could not save to Supabase. Check your admin role and table policies. ${cause instanceof Error ? cause.message : ""}`);
      return false;
    }
  }

  async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    try {
      if (hasSupabase) {
        const url = supabaseRestUrl(); const key = supabaseAnonKey();
        const response = await fetch(`${url}/auth/v1/token?grant_type=password`, { method: "POST", headers: { apikey: key || "", "Content-Type": "application/json" }, body: JSON.stringify({ email, password: supabasePassword }) });
        if (!response.ok) throw new Error("Sign in failed. Use your Supabase administrator email and password.");
        const data = await response.json() as AuthUser;
        if (data.user?.app_metadata?.role !== "admin") throw new Error("This account is not marked as an AURORA admin. Add app_metadata.role = admin in Supabase.");
        const base = supabaseRestUrl();
        const headers = { apikey: key || "", Authorization: `Bearer ${data.access_token}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" };
        const [songRowsResponse, lightRowsResponse] = await Promise.all([
          fetch(`${base}/rest/v1/songs?select=id,title,artist,audio_url,storage_path,file_name,cover_image_url,note,position,is_active&order=position.asc`, { headers }),
          fetch(`${base}/rest/v1/affirmations?select=*&order=created_at.asc`, { headers }),
        ]);
        if (!songRowsResponse.ok || !lightRowsResponse.ok) throw new Error("Could not read the content tables. Apply supabase/schema.sql and verify your admin role.");
        const songRows = await songRowsResponse.json() as Record<string, unknown>[];
        let lightRows = await lightRowsResponse.json() as Record<string, unknown>[];
        const seedKey = `aurora-seeded-${base}`;
        if (!sessionStorage.getItem(seedKey)) {
          if (!lightRows.length) {
            const seedResponse = await fetch(`${base}/rest/v1/affirmations`, { method: "POST", headers, body: JSON.stringify(starterAffirmations.map(tableRecord)) });
            if (!seedResponse.ok) throw new Error("Could not add the initial lights. Check the affirmations table admin policy.");
            lightRows = starterAffirmations.map(tableRecord);
          }
          sessionStorage.setItem(seedKey, "true");
        }
        setSongs(songRows.map(songRecord).filter((item) => item.audioUrl)); setAffirmations(lightRows.map(affirmationRecord));
        setToken(data.access_token); setMessage("Signed in to the shared library.");
      } else {
        const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: login }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Sign in failed.");
        setDemoValid(true); setMessage("Local demo unlocked. These edits stay in this browser.");
      }
      setLogin(""); setEmail(""); setSupabasePassword("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Sign in failed."); }
    finally { setLoading(false); }
  }

  async function logout() {
    setToken(""); setDemoValid(false);
    if (!hasSupabase) await fetch("/api/admin/login", { method: "DELETE" });
  }

  async function saveSong(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage("");
    if (!hasSupabase) { setError("Connect Supabase and enable the AURORA audio bucket before uploading songs."); return; }
    if (!songDraft.title.trim() || !songDraft.artist.trim()) { setError("Add both a song title and an artist name."); return; }
    if (songDraft.coverImage.trim()) {
      try { if (new URL(songDraft.coverImage.trim()).protocol !== "https:") throw new Error(); }
      catch { setError("Cover art must use a valid HTTPS image URL."); return; }
    }
    if (!editingSong && songs.length >= 50) { setError("The library can contain at most 50 tracks. Remove or deactivate a track before adding another."); return; }
    const existing = songs.find((song) => song.id === editingSong);
    if (audioFile && !validAudioFile(audioFile)) { setError("Choose an MP3, M4A, AAC, WAV, OGG, WebM, or FLAC file up to 100 MB."); return; }
    if (!existing && !audioFile) { setError("Choose an audio file to upload."); return; }
    setLoading(true);
    let uploaded: Awaited<ReturnType<typeof uploadAudioFile>> | null = null;
    try {
      if (audioFile) uploaded = await uploadAudioFile(audioFile);
      const updated: Song = {
        id: editingSong || recordId("song"), title: songDraft.title.trim(), artist: songDraft.artist.trim(),
        audioUrl: uploaded?.audioUrl || existing?.audioUrl || "", storagePath: uploaded?.storagePath || existing?.storagePath || "",
        fileName: uploaded?.fileName || existing?.fileName || "", coverImage: songDraft.coverImage.trim(), note: songDraft.note.trim(),
        position: existing?.position ?? songs.length, isActive: existing?.isActive ?? true,
      };
      const before = songs.map((song) => song.id);
      const next = existing ? songs.map((song) => song.id === existing.id ? updated : song) : [...songs, updated];
      setSongs(next);
      const saved = await persist("songs", before, next);
      if (!saved) {
        setSongs(songs);
        if (uploaded) await removeUploadedAudio(uploaded.storagePath).catch(() => undefined);
        return;
      }
      if (uploaded && existing?.storagePath) {
        try { await removeUploadedAudio(existing.storagePath); }
        catch (cause) { setError(cause instanceof Error ? cause.message : "The previous audio file could not be removed."); }
      }
      setSongDraft({ title: "", artist: "", coverImage: "", note: "" }); setAudioFile(null); setEditingSong(null);
    } catch (cause) {
      if (uploaded) await removeUploadedAudio(uploaded.storagePath).catch(() => undefined);
      setSongs(songs);
      setError(cause instanceof Error ? cause.message : "The audio track could not be uploaded.");
    } finally { setLoading(false); }
  }

  function saveAffirmation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage("");
    if (!affirmationDraft.message.trim()) { setError("Write a short affirmation before saving."); return; }
    const existing = affirmations.find((item) => item.id === editingAffirmation);
    const updated: Affirmation = { id: editingAffirmation || recordId("light"), message: affirmationDraft.message.trim(), supportingText: affirmationDraft.supportingText.trim(), category: affirmationDraft.category.trim() || "Hope", isActive: existing?.isActive ?? true };
    const before = affirmations.map((item) => item.id);
    const next = existing ? affirmations.map((item) => item.id === existing.id ? updated : item) : [...affirmations, updated];
    setAffirmations(next); setAffirmationDraft({ message: "", supportingText: "", category: "Hope" }); setEditingAffirmation(null);
    void persist("affirmations", before, next);
  }

  function editSong(song: Song) { setEditingSong(song.id); setAudioFile(null); setSongDraft({ title: song.title, artist: song.artist, coverImage: song.coverImage || "", note: song.note || "" }); }

  async function deleteSong(song: Song) {
    const before = songs.map((item) => item.id);
    const next = songs.filter((item) => item.id !== song.id);
    setSongs(next);
    const saved = await persist("songs", before, next);
    if (!saved) { setSongs(songs); return; }
    try { await removeUploadedAudio(song.storagePath); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "The uploaded audio file could not be removed."); }
  }
  function editAffirmation(item: Affirmation) { setEditingAffirmation(item.id); setAffirmationDraft({ message: item.message, supportingText: item.supportingText || "", category: item.category }); }

  function changeSong(song: Song, change: (item: Song) => Song) {
    const before = songs.map((item) => item.id); const next = songs.map((item) => item.id === song.id ? change(item) : item).map((item, index) => ({ ...item, position: index })); setSongs(next); void persist("songs", before, next);
  }
  function moveSong(index: number, amount: number) {
    const next = [...songs]; const destination = index + amount; if (destination < 0 || destination >= next.length) return;
    [next[index], next[destination]] = [next[destination], next[index]];
    const before = songs.map((item) => item.id); const positioned = next.map((item, position) => ({ ...item, position })); setSongs(positioned); void persist("songs", before, positioned);
  }
  function changeAffirmation(item: Affirmation, change: (entry: Affirmation) => Affirmation) {
    const before = affirmations.map((entry) => entry.id); const next = affirmations.map((entry) => entry.id === item.id ? change(entry) : entry); setAffirmations(next); void persist("affirmations", before, next);
  }

  if (!ready) return <main className="admin-page"><div className="admin-loading"><LoaderCircle className="spin"/> Opening the archive…</div></main>;

  if (!authenticated) return <main className="admin-page"><div className="admin-header"><Link href="/" className="admin-back"><ChevronLeft size={16}/> Back to the sky</Link><span>AURORA · OWNER&apos;S DESK</span></div><section className="admin-login"><div className="admin-kicker">A quiet place to tend the collection</div><h1>Owner&apos;s desk</h1><p>{hasSupabase ? "Sign in with an AURORA administrator account to manage the shared content library." : "Local demo mode keeps edits in this browser. Set a private password to unlock these controls."}</p>
      <form onSubmit={authenticate}>{hasSupabase ? <><label>Email<input autoComplete="username" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="owner@example.com"/></label><label>Password<div className="admin-password"><input autoComplete="current-password" required type={showPassword ? "text" : "password"} value={supabasePassword} onChange={(event) => setSupabasePassword(event.target.value)}/><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label></> : <label>Demo password<div className="admin-password"><input autoComplete="current-password" required type={showPassword ? "text" : "password"} value={login} onChange={(event) => setLogin(event.target.value)} placeholder="AURORA_ADMIN_PASSWORD"/><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label>}
        <button className="admin-primary" disabled={loading}>{loading ? <LoaderCircle className="spin" size={16}/> : <Check size={16}/>} {loading ? "Checking…" : "Unlock the collection"}</button>
      </form>
      {error && <p className="admin-error" role="alert">{error}</p>}{message && <p className="admin-success" role="status">{message}</p>}
      {!hasSupabase && <p className="admin-hint">Add <code>AURORA_ADMIN_PASSWORD</code> to your ignored <code>.env.local</code> file. Local edits are for this browser only; configure Supabase to share content securely.</p>}
    </section></main>;

  return <main className="admin-page"><div className="admin-header"><Link href="/" className="admin-back"><ChevronLeft size={16}/> Back to the sky</Link><span>AURORA · OWNER&apos;S DESK</span><button className="admin-logout" onClick={logout}><LogOut size={15}/> Sign out</button></div>
    <section className="admin-content"><div className="admin-kicker">{hasSupabase ? "Shared Supabase library" : "Local demo · saved in this browser"}</div><h1>Tend the collection</h1><p className="admin-lede">Add songs for the cassette and small lights for the long night.</p>
      <div className="demo-notice">The listening experience reads supported files from the project&apos;s <code>Songs/</code> folder. This existing owner form manages its separate uploaded-audio library; changes here do not replace the local cassette playlist or the ten fixed wish lanterns.</div>
      {!hasSupabase && <div className="demo-notice">Local content is stored in this browser only. Cassette audio uploads require Supabase: add credentials and apply <code>supabase/schema.sql</code> to create its secure library and Storage bucket.</div>}
      {message && <p className="admin-success" role="status"><Check size={15}/>{message}</p>}{error && <p className="admin-error" role="alert">{error}</p>}
      <div className="admin-tabs" role="tablist"><button role="tab" aria-selected={tab === "songs"} onClick={() => setTab("songs")}>Cassette <span>{songs.length}/50</span></button><button role="tab" aria-selected={tab === "affirmations"} onClick={() => setTab("affirmations")}>Lanterns <span>{affirmations.length}</span></button></div>
      {tab === "songs" ? <div className="admin-grid">
        <form className="admin-form" onSubmit={saveSong}>
          <div className="admin-kicker">{editingSong ? "Edit a track" : "Add a track"}</div>
          <h2>{editingSong ? "Change the label" : "A song for the night"}</h2>
          <label>Song title<input required maxLength={100} value={songDraft.title} onChange={(event) => setSongDraft({ ...songDraft, title: event.target.value })} placeholder="A song that feels like home"/></label>
          <label>Artist<input required maxLength={100} value={songDraft.artist} onChange={(event) => setSongDraft({ ...songDraft, artist: event.target.value })} placeholder="Artist name"/></label>
          <label>Audio file {editingSong && <span className="optional">optional · leave blank to keep current audio</span>}
            <input key={`${editingSong || "new"}-${audioFile ? "selected" : "empty"}`} type="file" accept="audio/mpeg,audio/mp4,audio/aac,audio/wav,audio/ogg,audio/webm,audio/flac,.mp3,.m4a,.mp4,.aac,.wav,.ogg,.oga,.webm,.flac" required={!editingSong} onChange={(event) => setAudioFile(event.target.files?.[0] || null)}/>
            <small>MP3, M4A, AAC, WAV, OGG, WebM, or FLAC · up to 100 MB. Audio uploads to your Supabase Storage library.</small>
            {editingSong && <small>Current file: {audioFile?.name || songs.find((song) => song.id === editingSong)?.fileName}</small>}
          </label>
          {audioFile && <div className="admin-audio-preview"><span className="admin-audio-icon"><Check size={17}/></span><div><span>READY TO UPLOAD</span><strong>{audioFile.name}</strong><small>{(audioFile.size / (1024 * 1024)).toFixed(1)} MB · {audioFileType(audioFile)}</small></div></div>}
          <label>Cover image URL <span className="optional">optional · HTTPS only</span><input type="url" value={songDraft.coverImage} onChange={(event) => setSongDraft({ ...songDraft, coverImage: event.target.value })} placeholder="https://…"/></label>
          <label>Handwritten note <span className="optional">optional</span><textarea maxLength={240} rows={3} value={songDraft.note} onChange={(event) => setSongDraft({ ...songDraft, note: event.target.value })} placeholder="A note folded into the case"/></label>
          <div className="admin-form-actions"><button className="admin-primary" disabled={!hasSupabase || loading || (!editingSong && songs.length >= 50)}><Save size={15}/>{loading ? "Uploading…" : editingSong ? "Save track" : "Upload to cassette"}</button>{editingSong && <button type="button" className="admin-secondary" onClick={() => { setEditingSong(null); setAudioFile(null); setSongDraft({ title: "", artist: "", coverImage: "", note: "" }); }}>Cancel</button>}</div>
          {songs.length >= 50 && !editingSong && <p className="admin-error">The 50-track limit has been reached.</p>}
        </form>
        <div className="admin-list"><div className="admin-list-heading"><div><div className="admin-kicker">The mix tape</div><h2>{activeSongs} active tracks</h2></div><span>Use arrows to reorder</span></div>
          {songs.map((song, index) => <article className={`admin-row ${!song.isActive ? "is-inactive" : ""}`} key={song.id}>
            <span className="admin-row-no">{String(index + 1).padStart(2, "0")}</span><div className="admin-row-copy"><strong>{song.title}</strong><span>{song.artist}</span><small>{song.fileName}</small></div>
            <div className="admin-row-actions"><button aria-label={`Move ${song.title} up`} disabled={index === 0} onClick={() => moveSong(index, -1)}><ArrowUp size={15}/></button><button aria-label={`Move ${song.title} down`} disabled={index === songs.length - 1} onClick={() => moveSong(index, 1)}><ArrowDown size={15}/></button><button aria-label={`${song.isActive ? "Deactivate" : "Activate"} ${song.title}`} onClick={() => changeSong(song, (item) => ({ ...item, isActive: !item.isActive }))}>{song.isActive ? <Eye size={15}/> : <EyeOff size={15}/>}</button><button aria-label={`Edit ${song.title}`} onClick={() => editSong(song)}><Save size={14}/></button><button aria-label={`Delete ${song.title}`} onClick={() => void deleteSong(song)}><Trash2 size={15}/></button></div>
          </article>)}
          {!songs.length && <p className="admin-empty">No songs yet. Upload the first audio file here.</p>}
        </div>
      </div>
        : <div className="admin-grid affirm-grid"><form className="admin-form" onSubmit={saveAffirmation}><div className="admin-kicker">{editingAffirmation ? "Edit a light" : "Add a light"}</div><h2>{editingAffirmation ? "Change the message" : "A thought to carry"}</h2><label>Affirmation<textarea required maxLength={240} rows={4} value={affirmationDraft.message} onChange={(event) => setAffirmationDraft({ ...affirmationDraft, message: event.target.value })} placeholder="You do not have to have it all figured out…"/></label><label>Supporting line <span className="optional">optional</span><textarea maxLength={180} rows={3} value={affirmationDraft.supportingText} onChange={(event) => setAffirmationDraft({ ...affirmationDraft, supportingText: event.target.value })} placeholder="A quieter thought to go with it"/></label><label>Category<input maxLength={40} value={affirmationDraft.category} onChange={(event) => setAffirmationDraft({ ...affirmationDraft, category: event.target.value })} placeholder="Hope"/></label><div className="admin-form-actions"><button className="admin-primary"><Save size={15}/>{editingAffirmation ? "Save affirmation" : "Add to the sky"}</button>{editingAffirmation && <button type="button" className="admin-secondary" onClick={() => { setEditingAffirmation(null); setAffirmationDraft({ message: "", supportingText: "", category: "Hope" }); }}>Cancel</button>}</div></form>
          <div className="admin-list"><div className="admin-list-heading"><div><div className="admin-kicker">The night sky</div><h2>{affirmations.filter((item) => item.isActive).length} of {affirmations.length} lights active</h2></div></div>{affirmations.map((item) => <article className={`admin-row affirmation-row ${!item.isActive ? "is-inactive" : ""}`} key={item.id}><div className="admin-row-copy"><span className="admin-category">{item.category}</span><strong>{item.message}</strong>{item.supportingText && <small>{item.supportingText}</small>}</div><div className="admin-row-actions"><button aria-label={`${item.isActive ? "Deactivate" : "Activate"} affirmation`} onClick={() => changeAffirmation(item, (entry) => ({ ...entry, isActive: !entry.isActive }))}>{item.isActive ? <Eye size={15}/> : <EyeOff size={15}/>}</button><button aria-label="Edit affirmation" onClick={() => editAffirmation(item)}><Save size={14}/></button><button aria-label="Delete affirmation" onClick={() => { const before = affirmations.map((entry) => entry.id); const next = affirmations.filter((entry) => entry.id !== item.id); setAffirmations(next); void persist("affirmations", before, next); }}><Trash2 size={15}/></button></div></article>)}</div></div>}
      {tab === "songs" && <p className="admin-footnote">These owner-managed uploads remain in the existing Supabase library. The visitor cassette plays local files from <code>Songs/</code> and serves them through the project&apos;s local audio route.</p>}
      {tab === "affirmations" && <p className="admin-footnote">A collection of {starterAffirmations.length} seed messages is included. You can edit, deactivate, remove, or add your own.</p>}
    </section>
  </main>;
}
