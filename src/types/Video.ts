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
  videoUrl?: string; // For actual video files
  filecoinCID?: string; // Filecoin Content Identifier
  dealInfo?: {
    dealId: string;
    provider: string;
    price: string;
    status: string;
  };
}

export interface Channel {
  id: string;
  name: string;
  avatar: string;
  subscribers: string;
  verified: boolean;
}

export interface FilecoinDeal {
  dealId: string;
  cid: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  provider: string;
  price: string;
  startEpoch?: number;
  endEpoch?: number;
}