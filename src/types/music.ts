export interface Track {
  id: string;
  title: string;
  playlistId: string;
  playlistName: string;
  duration: number;
  audioUrl: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  gradient: string;
  emoji: string;
  tracks: Track[];
}
