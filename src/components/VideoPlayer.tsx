import React, { useState, useEffect } from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Share, 
  Download, 
  MoreHorizontal,
  Bell,
  ChevronDown,
  ChevronUp,
  Upload,
  Play,
  X
} from 'lucide-react';
import { Video } from '../types/Video';

interface VideoPlayerProps {
  video: Video;
  upNextVideos: Video[];
  onVideoUpload: (video: Video) => void;
  onNextVideo: () => void;
  onVideoSelect: (index: number) => void;
  currentVideoIndex: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  video, 
  upNextVideos, 
  onVideoUpload, 
  onNextVideo, 
  onVideoSelect, 
  currentVideoIndex 
}) => {
  const [showDescription, setShowDescription] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);

  // Auto-play next video after 5 seconds (simulating video end)
  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        setVideoEnded(true);
        setIsPlaying(false);
        
        // Auto-play next video after 3 seconds
        setTimeout(() => {
          if (upNextVideos.length > 0) {
            onNextVideo();
            setVideoEnded(false);
          }
        }, 3000);
      }, 5000); // Simulate 5-second video duration

      return () => clearTimeout(timer);
    }
  }, [isPlaying, upNextVideos.length, onNextVideo]);

  const handlePlayVideo = () => {
    setIsPlaying(true);
    setVideoEnded(false);
  };

  const handleUploadSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newVideo: Video = {
      id: Date.now().toString(),
      title: formData.get('title') as string || 'Untitled Video',
      channel: formData.get('channel') as string || 'Your Channel',
      views: '0 views',
      timestamp: 'Just now',
      duration: '10:00',
      thumbnail: formData.get('thumbnail') as string || 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=2',
      channelAvatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
      description: formData.get('description') as string || 'No description provided.',
      likes: '0',
      subscribers: '1K'
    };

    onVideoUpload(newVideo);
    setShowUploadModal(false);
  };

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
              {!isPlaying && !videoEnded && (
                <button 
                  onClick={handlePlayVideo}
                  className="w-16 h-16 bg-youtube-red rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors"
                >
                  <Play size={24} className="text-white ml-1" />
                </button>
              )}
              {isPlaying && (
                <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded">
                  Playing...
                </div>
              )}
              {videoEnded && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                  <div className="text-center text-white">
                    <p className="mb-4">Video ended</p>
                    {upNextVideos.length > 0 && (
                      <p className="text-sm">Next video starting in 3 seconds...</p>
                    )}
                  </div>
                </div>
              )}
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
            </div>
          </div>
        </div>

        {/* Up Next Sidebar */}
        <div className="lg:w-96">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Up next</h3>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-dark-secondary hover:bg-dark-hover rounded-full transition-colors text-sm"
            >
              <Upload size={16} />
              <span>Upload</span>
            </button>
          </div>
          
          <div className="space-y-3">
            {upNextVideos.map((upNextVideo, index) => (
              <div 
                key={upNextVideo.id} 
                className="flex space-x-3 cursor-pointer hover:bg-dark-secondary p-2 rounded-lg transition-colors"
                onClick={() => onVideoSelect(currentVideoIndex + index + 1)}
              >
                <div className="relative flex-shrink-0">
                  <img 
                    src={upNextVideo.thumbnail} 
                    alt={upNextVideo.title}
                    className="w-40 aspect-video object-cover rounded"
                  />
                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 py-0.5 rounded">
                    {upNextVideo.duration}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-2 mb-1">{upNextVideo.title}</h4>
                  <p className="text-gray-400 text-xs mb-1">{upNextVideo.channel}</p>
                  <div className="flex items-center space-x-1 text-gray-400 text-xs">
                    <span>{upNextVideo.views}</span>
                    <span>•</span>
                    <span>{upNextVideo.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {upNextVideos.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <p>No more videos in queue</p>
                <p className="text-sm mt-2">Upload a video to add it to the queue</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-secondary rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Upload Video</h2>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="p-1 hover:bg-dark-hover rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Video Title</label>
                <input 
                  type="text" 
                  name="title"
                  placeholder="Enter video title"
                  className="w-full bg-dark-bg border border-dark-hover rounded-lg px-3 py-2 outline-none focus:border-white transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Channel Name</label>
                <input 
                  type="text" 
                  name="channel"
                  placeholder="Enter channel name"
                  className="w-full bg-dark-bg border border-dark-hover rounded-lg px-3 py-2 outline-none focus:border-white transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Thumbnail URL</label>
                <input 
                  type="url" 
                  name="thumbnail"
                  placeholder="Enter thumbnail URL (optional)"
                  className="w-full bg-dark-bg border border-dark-hover rounded-lg px-3 py-2 outline-none focus:border-white transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea 
                  name="description"
                  placeholder="Enter video description"
                  rows={3}
                  className="w-full bg-dark-bg border border-dark-hover rounded-lg px-3 py-2 outline-none focus:border-white transition-colors resize-none"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 bg-dark-hover hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-youtube-red hover:bg-red-600 rounded-lg transition-colors"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;