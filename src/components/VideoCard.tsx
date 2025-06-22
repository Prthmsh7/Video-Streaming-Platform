import React from 'react';
import { Video } from '../types/Video';

interface VideoCardProps {
  video: Video;
  onClick: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  return (
    <div 
      className="cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative mb-3">
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className="w-full aspect-video object-cover rounded-lg video-thumbnail"
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </div>
      </div>
      
      <div className="flex space-x-3">
        <img 
          src={video.channelAvatar} 
          alt={video.channel}
          className="w-9 h-9 rounded-full flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white line-clamp-2 group-hover:text-gray-300 transition-colors">
            {video.title}
          </h3>
          <p className="text-gray-400 text-sm mt-1 hover:text-white transition-colors cursor-pointer">
            {video.channel}
          </p>
          <div className="flex items-center space-x-1 text-gray-400 text-sm mt-1">
            <span>{video.views}</span>
            <span>•</span>
            <span>{video.timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;