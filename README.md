# AURORA — sky full of hopes

A cinematic Next.js experience with a separate GLB character over the aurora introduction, a shared cabin-and-fire world, a persistent local cassette player, and twenty-two interactive birthday wish lanterns.

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Use `npm run lint`, `npx tsc --noEmit`, and `npm run build` for checks.

## Assets found in this project

- `public/assets/aurora-bg.mp4` is the 10-second, 1280×720 introduction video. It loops muted and plays inline.
- `public/assets/boy.glb` is rendered as a separate Three.js character in the introduction. The `Casual_Walk` clip is preferred, with `Walking` as a fallback; a Three.js mixer plays it while the character root moves along an eased side-to-centre path, then the clip stops when he arrives. There is no idle clip.
- `public/gemini_generated_video_41e33c0c.mp4` is the 10-second, 1280×720 second-scene film. It loops muted while the visitor chooses music or the wishes.
- `public/gemini_generated_video_2867cff1.mp4` is the muted cassette video inset over the second scene while the local music player is open.
- `public/gemini_generated_video_17d2f205.mp4` is the 10-second, 1280×720 wish-sky film. It plays once, holds its final frame, and reveals the 22 interactive lanterns over that frame.

## Local music

The visitor playlist reads supported audio files recursively from the top-level `Songs/` folder. It currently contains 70 MP3 files. The originals stay in place; the website does not copy them into `public/` or upload them to a service.

The server-side `/api/songs` route returns a naturally sorted library, using ID3 title and artist tags when present and the real filename otherwise. `/api/songs/<relative-file-path>` streams audio with byte-range support for browser seeking. Put additional audio files under `Songs/`; MP3, WAV, M4A, AAC, OGG, Opus, FLAC, and AIFF extensions are recognized. Playback support still depends on the visitor’s browser.

One native `<audio>` element stays mounted at the page level across the introduction, cabin, cassette, lantern, and wish-letter views. Track selection alone does not start playback. The visitor presses Play; when changing tracks while music is already playing, the selected track continues from that explicit interaction. Progress, seeking, volume, and reel motion follow actual audio-element events. The local library is separate from the existing `/admin` Supabase upload form.

For deployment, include the top-level `Songs/` directory with the Next.js Node server. The file route needs access to that directory at runtime; a static-only export cannot serve this local library as implemented.

## Lanterns and scene movement

The finale contains exactly twenty-two selectable birthday wish lanterns, with stable `wish-01` to `wish-22` IDs and messages in `data/wish-lanterns.ts`. Their positions stay paired with their messages, and the video overlay accounts for the 16:9 frame crop on portrait and landscape screens. After the third video ends, the wishes fade in over its held final frame. Releasing a note marks its lantern unavailable for the rest of the current session. The cassette, cabin, sky, and letters share the same navigation and audio state. Scene changes do not reload the page or reset music.

The original `/admin` route and its existing backend configuration remain available. Configure the existing environment variables as described in `.env.example` if you use that separate owner-managed library.
