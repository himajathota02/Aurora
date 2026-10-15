export type Song = {
  id: number;
  title: string;
  artist: string;
  coverImage: string;
  memoryId?: number;
  note: string;
};

export type Memory = {
  id: number;
  image: string;
  title: string;
  date: string;
  location: string;
  caption: string;
  note: string;
  category: "Memories" | "Trips" | "Late Night Conversations";
  trip?: string;
  songId?: number;
  layout?: "polaroid" | "postcard" | "letter";
};

export type Trip = { slug: string; title: string; subtitle: string; date: string; coverImage: string; chapter: string };
