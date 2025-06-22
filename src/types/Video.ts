export interface Video {
  id: string;
  title: string;
  channel: string;
  views: string;
  timestamp: string;
  duration: string;
  thumbnail: string;
  channelAvatar: string;
  description?: string;
  likes?: string;
  dislikes?: string;
  subscribers?: string;
}

export interface Channel {
  id: string;
  name: string;
  avatar: string;
  subscribers: string;
  verified: boolean;
}