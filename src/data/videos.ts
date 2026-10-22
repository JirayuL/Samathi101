/**
 * Videos shown on the Videos tab, in order.
 * youtubeId = the part after "watch?v=" in a YouTube link.
 * start     = seconds to start from (the "t=44s" part of a link), optional.
 */
export interface Video {
  youtubeId: string;
  title: string;
  start?: number;
}

export const videos: Video[] = [
  // TODO: replace the title with the video's real title
  { youtubeId: 'M7lc1UVf-VE', title: 'Featured video', start: 44 },
];
