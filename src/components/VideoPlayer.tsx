import React, { useState } from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Share, 
  Download, 
  MoreHorizontal,
  Bell,
  ChevronDown,
  ChevronUp,
  Upload
} from 'lucide-react';
import { Video } from '../types/Video';

interface VideoPlayerProps {
  video: Video;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video }) => {
  const [showDescription, setShowDescription] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const relatedVideos: Video[] = [
    {
      id: '9',
      title: 'Advanced React Patterns You Should Know',
      channel: 'Code Academy',
      views: '856K views',
      timestamp: '1 day ago',
      duration: '12:34',
      thumbnail: 'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&dpr=2',
      channelAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=2'
    },
    {
      id: '10',
      title: 'Beautiful Sunset Timelapse',
      channel: 'Nature Shots',
      views: '2.3M views',
      timestamp: '3 days ago',
      duration: '8:15',
      thumbnail: 'https://images.pexels.com/photos/1431822/pexels-photo-1431822.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&dpr=2',
      channelAvatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=2'
    },
    {
      id: '11',
      title: 'Quick Healthy Breakfast Ideas',
      channel: 'Healthy Living',
      views: '1.1M views',
      timestamp: '2 days ago',
      duration: '10:22',
      thumbnail: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&dpr=2',
      channelAvatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=2'
    }
  ];

  return (
    <div className="py-6">
      <div className="flex flex-col lg:flex-row gap-6 px-6 max-w-7xl mx-auto">
        {/* Main Video Section */}
        <div className="flex-1">
          {/* Video Player */}
          <div className="relative bg-black rounded-lg overflow-hidden mb-4">
            <img 
              src={video.thumbnail} 
              alt={video.title}
              className="w-full aspect-video object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-youtube-red rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors">
                <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
              </div>
            </div>
          </div>

          {/* Video Info */}
          <div className="mb-4">
            <h1 className="text-xl font-bold mb-2">{video.title}</h1>
            
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4 text-gray-400">
                <span>{video.views}</span>
                <span>•</span>
                <span>{video.timestamp}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-2 px-4 py-2 bg-dark-secondary hover:bg-dark-hover rounded-full transition-colors">
                  <ThumbsUp size={20} />
                  <span>{video.likes}</span>
                </button>
                
                <button className="flex items-center space-x-2 px-4 py-2 bg-dark-secondary hover:bg-dark-hover rounded-full transition-colors">
                  <ThumbsDown size={20} />
                </button>
                
                <button className="flex items-center space-x-2 px-4 py-2 bg-dark-secondary hover:bg-dark-hover rounded-full transition-colors">
                  <Share size={20} />
                  <span>Share</span>
                </button>
                
                <button className="flex items-center space-x-2 px-4 py-2 bg-dark-secondary hover:bg-dark-hover rounded-full transition-colors">
                  <Download size={20} />
                  <span>Download</span>
                </button>
                
                <button className="p-2 bg-dark-secondary hover:bg-dark-hover rounded-full transition-colors">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Channel Info */}
          <div className="bg-dark-secondary rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <img 
                  src={video.channelAvatar} 
                  alt={video.channel}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-medium">{video.channel}</h3>
                  <p className="text-gray-400 text-sm">{video.subscribers} subscribers</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setIsSubscribed(!isSubscribed)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                    isSubscribed 
                      ? 'bg-dark-hover text-gray-300' 
                      : 'bg-youtube-red hover:bg-red-600 text-white'
                  }`}
                >
                  <Bell size={16} />
                  <span>{isSubscribed ? 'Subscribed' : 'Subscribe'}</span>
                </button>
              </div>
            </div>
            
            {/* Description */}
            <div className="text-gray-300">
              <p className={`${showDescription ? '' : 'line-clamp-2'}`}>
                {video.description}
              </p>
              <button 
                onClick={() => setShowDescription(!showDescription)}
                className="flex items-center space-x-1 text-gray-400 hover:text-white mt-2 transition-colors"
              >
                <span>{showDescription ? 'Show less' : 'Show more'}</span>
                {showDescription ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-dark-secondary rounded-lg p-4">
            <h3 className="font-medium mb-4 text-lg">1,234 Comments</h3>
            
            {/* Add Comment */}
            <div className="flex space-x-3 mb-6">
              <img 
                src="https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=2" 
                alt="Your avatar"
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <input 
                  type="text" 
                  placeholder="Add a comment..."
                  className="w-full bg-transparent border-b border-gray-600 pb-2 outline-none focus:border-white transition-colors"
                />
                <div className="flex justify-end space-x-2 mt-3">
                  <button className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-youtube-red hover:bg-red-600 rounded-full text-white transition-colors">
                    Comment
                  </button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              <div className="flex space-x-3">
                <img 
                  src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=2" 
                  alt="User"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm">@techexplorer</span>
                    <span className="text-gray-400 text-xs">2 hours ago</span>
                  </div>
                  <p className="text-gray-300 mb-2">Great tutorial! Really helped me understand React better. The TypeScript integration examples were particularly useful.</p>
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors">
                      <ThumbsUp size={14} />
                      <span className="text-xs">24</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors">
                      <ThumbsDown size={14} />
                    </button>
                    <button className="text-gray-400 hover:text-white text-xs transition-colors">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <img 
                  src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=2" 
                  alt="User"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm">@developer456</span>
                    <span className="text-gray-400 text-xs">5 hours ago</span>
                  </div>
                  <p className="text-gray-300 mb-2">Could you make a video about advanced hooks next? Specifically useCallback and useMemo optimization techniques.</p>
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors">
                      <ThumbsUp size={14} />
                      <span className="text-xs">12</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors">
                      <ThumbsDown size={14} />
                    </button>
                    <button className="text-gray-400 hover:text-white text-xs transition-colors">
                      Reply
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <img 
                  src="https://images.pexels.com/photos/598745/pexels-photo-598745.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=2" 
                  alt="User"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm">@reactninja</span>
                    <span className="text-gray-400 text-xs">1 day ago</span>
                  </div>
                  <p className="text-gray-300 mb-2">Amazing content as always! The way you explain complex concepts makes it so easy to understand. Keep up the great work! 🔥</p>
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors">
                      <ThumbsUp size={14} />
                      <span className="text-xs">89</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors">
                      <ThumbsDown size={14} />
                    </button>
                    <button className="text-gray-400 hover:text-white text-xs transition-colors">
                      Reply
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <img 
                  src="https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=2" 
                  alt="User"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm">@codingjourney</span>
                    <span className="text-gray-400 text-xs">2 days ago</span>
                  </div>
                  <p className="text-gray-300 mb-2">This helped me fix a bug I've been struggling with for days. Thank you so much for the detailed explanation!</p>
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors">
                      <ThumbsUp size={14} />
                      <span className="text-xs">45</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors">
                      <ThumbsDown size={14} />
                    </button>
                    <button className="text-gray-400 hover:text-white text-xs transition-colors">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Load More Comments */}
            <div className="mt-6 text-center">
              <button className="text-youtube-red hover:text-red-400 transition-colors">
                Show more comments
              </button>
            </div>
          </div>
        </div>

        {/* Related Videos Sidebar */}
        <div className="lg:w-96">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Up next</h3>
            <button className="flex items-center space-x-2 px-3 py-1.5 bg-dark-secondary hover:bg-dark-hover rounded-full transition-colors text-sm">
              <Upload size={16} />
              <span>Upload</span>
            </button>
          </div>
          <div className="space-y-3">
            {relatedVideos.map((relatedVideo) => (
              <div key={relatedVideo.id} className="flex space-x-3 cursor-pointer hover:bg-dark-secondary p-2 rounded-lg transition-colors">
                <div className="relative flex-shrink-0">
                  <img 
                    src={relatedVideo.thumbnail} 
                    alt={relatedVideo.title}
                    className="w-40 aspect-video object-cover rounded"
                  />
                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 py-0.5 rounded">
                    {relatedVideo.duration}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-2 mb-1">{relatedVideo.title}</h4>
                  <p className="text-gray-400 text-xs mb-1">{relatedVideo.channel}</p>
                  <div className="flex items-center space-x-1 text-gray-400 text-xs">
                    <span>{relatedVideo.views}</span>
                    <span>•</span>
                    <span>{relatedVideo.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;