export type Song = {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  storagePath: string;
  fileName: string;
  coverImage?: string;
  note?: string;
  position: number;
  isActive: boolean;
};

export type Affirmation = {
  id: string;
  message: string;
  supportingText?: string;
  opening?: string;
  category: string;
  isActive: boolean;
};

export type AuroraContent = { songs: Song[]; affirmations: Affirmation[] };
