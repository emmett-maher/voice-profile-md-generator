/**
 * Transcript acquisition for the ingestion pipeline (Node runtime).
 * Strategy: published captions/page text where available, Deepgram
 * speech-to-text as the fallback for audio without captions.
 */

import { createClient } from "@deepgram/sdk";

/**
 * Deepgram's currently recommended transcription model, resolved at build
 * time (override with the DEEPGRAM_MODEL env var on the Convex deployment).
 */
export const DEEPGRAM_MODEL = process.env.DEEPGRAM_MODEL ?? "nova-3";

export function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/i.test(url);
}

export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([\w-]{6,})/i,
    /[?&]v=([\w-]{6,})/i,
    /youtube\.com\/shorts\/([\w-]{6,})/i,
    /youtube\.com\/embed\/([\w-]{6,})/i,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

/**
 * Fetch published captions for a YouTube video via the caption tracks the
 * watch page exposes. Returns null when the video has no captions — the
 * caller then falls back to Deepgram.
 */
export async function fetchYouTubeCaptions(
  videoId: string,
): Promise<{ text: string; title?: string } | null> {
  const watch = await fetch(`https://www.youtube.com/watch?v=${videoId}&hl=en`, {
    headers: { "Accept-Language": "en" },
  });
  if (!watch.ok) return null;
  const html = await watch.text();

  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const title = titleMatch ? decodeEntities(titleMatch[1]).replace(/ - YouTube$/, "") : undefined;

  const tracksMatch = html.match(/"captionTracks":(\[.*?\])/);
  if (!tracksMatch) return null;
  let tracks: { baseUrl: string; languageCode?: string; kind?: string }[];
  try {
    tracks = JSON.parse(tracksMatch[1]);
  } catch {
    return null;
  }
  if (!Array.isArray(tracks) || tracks.length === 0) return null;

  // Prefer a human-made English track, then any English, then the first.
  const pick =
    tracks.find((t) => t.languageCode?.startsWith("en") && t.kind !== "asr") ??
    tracks.find((t) => t.languageCode?.startsWith("en")) ??
    tracks[0];
  const baseUrl = pick.baseUrl.replace(/\\u0026/g, "&");

  const captionRes = await fetch(`${baseUrl}&fmt=json3`);
  if (!captionRes.ok) return null;
  const data = (await captionRes.json()) as {
    events?: { segs?: { utf8?: string }[] }[];
  };
  const text = (data.events ?? [])
    .flatMap((e) => e.segs ?? [])
    .map((s) => s.utf8 ?? "")
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 0 ? { text, title } : null;
}

/** Crude article extraction for blog/social URLs: strip markup, keep prose. */
export async function fetchArticleText(
  url: string,
): Promise<{ text: string; title?: string } | null> {
  const res = await fetch(url, { headers: { "User-Agent": "voice-profile-md-generator/1.0" } });
  if (!res.ok) return null;
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("html") && !contentType.includes("text")) return null;
  const html = await res.text();
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const title = titleMatch ? decodeEntities(titleMatch[1]).trim() : undefined;
  const text = decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
      .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 200 ? { text, title } : null;
}

const AUDIO_EXTENSIONS = /\.(mp3|m4a|wav|ogg|flac|aac|mp4|webm)(\?|$)/i;

export function looksLikeAudioUrl(url: string): boolean {
  return AUDIO_EXTENSIONS.test(url);
}

/** Speech-to-text via Deepgram for audio/podcast URLs without transcripts. */
export async function transcribeWithDeepgram(url: string): Promise<string | null> {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) return null;
  const deepgram = createClient(apiKey);
  const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
    { url },
    { model: DEEPGRAM_MODEL, smart_format: true, punctuate: true },
  );
  if (error || !result) return null;
  const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";
  return transcript.trim().length > 0 ? transcript.trim() : null;
}
