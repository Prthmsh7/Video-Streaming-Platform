import React, { useState, useRef, useEffect } from 'react';
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
  Pause,
  X,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  SkipForward,
  SkipBack,
  DollarSign,
  TrendingUp,
  Users,
  Target
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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState('auto');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Investment states
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [selectedInvestmentTier, setSelectedInvestmentTier] = useState('');
  const [totalInvestment, setTotalInvestment] = useState(125000);
  const [investmentGoal, setInvestmentGoal] = useState(500000);
  const [totalInvestors, setTotalInvestors] = useState(47);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Investment tiers
  const investmentTiers = [
    { name: 'Supporter', min: 50, max: 499, benefits: ['Early access to content', 'Exclusive updates'] },
    { name: 'Backer', min: 500, max: 2499, benefits: ['All Supporter benefits', 'Monthly video calls', 'Behind-the-scenes content'] },
    { name: 'Partner', min: 2500, max: 9999, benefits: ['All Backer benefits', 'Co-producer credit', 'Input on future content'] },
    { name: 'Executive', min: 10000, max: Infinity, benefits: ['All Partner benefits', 'Revenue sharing', 'Direct collaboration opportunities'] }
  ];

  // Auto-hide controls
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // Auto-play next video when current ends
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      if (upNextVideos.length > 0) {
        setTimeout(() => {
          onNextVideo();
        }, 2000);
      }
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, [upNextVideos.length, onNextVideo]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const vol = parseFloat(e.target.value);
    video.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  const toggleFullscreen = () => {
    if (!playerRef.current) return;

    if (!isFullscreen) {
      if (playerRef.current.requestFullscreen) {
        playerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const skipTime = (seconds: number) => {
    const video = videoRef.current;
    if (!video || !isFinite(video.duration)) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  };

  const formatTime = (time: number) => {
    if (!isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInvestmentTier = (amount: number) => {
    return investmentTiers.find(tier => amount >= tier.min && amount <= tier.max);
  };

  const handleInvestment = () => {
    const amount = parseFloat(investmentAmount);
    if (amount && amount >= 50) {
      setTotalInvestment(prev => prev + amount);
      setTotalInvestors(prev => prev + 1);
      setInvestmentAmount('');
      setSelectedInvestmentTier('');
      alert(`Thank you for your investment of ${formatCurrency(amount)}!`);
    } else {
      alert('Minimum investment amount is $50');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    const videoUrl = URL.createObjectURL(file);
    const newVideo: Video = {
      id: Date.now().toString(),
      title: file.name.replace(/\.[^/.]+$/, ''),
      channel: 'Your Channel',
      views: '0 views',
      timestamp: 'Just now',
      duration: '0:00',
      thumbnail: '',
      channelAvatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
      description: `Uploaded video: ${file.name}`,
      likes: '0',
      subscribers: '1K',
      videoUrl: videoUrl
    };

    onVideoUpload(newVideo);
    setShowUploadModal(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const progressPercentage = (totalInvestment / investmentGoal) * 100;

  return (
    <div className="py-6">
      <div className="flex flex-col lg:flex-row gap-6 px-6 max-w-7xl mx-auto">
        {/* Main Video Section */}
        <div className="flex-1">
          {/* Video Player */}
          <div 
            ref={playerRef}
            className="relative bg-black rounded-lg overflow-hidden mb-4 group"
            onMouseMove={() => setShowControls(true)}
            onMouseLeave={() => isPlaying && setShowControls(false)}
          >
            <video
              ref={videoRef}
              src={video.videoUrl || video.thumbnail}
              poster={video.thumbnail}
              className="w-full aspect-video object-cover"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            
            {/* Video Controls Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}>
              {/* Center Play Button */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button 
                    onClick={togglePlay}
                    className="w-16 h-16 bg-youtube-red rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors"
                  >
                    <Play size={24} className="text-white ml-1" />
                  </button>
                </div>
              )}

              {/* Bottom Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                {/* Progress Bar */}
                <div className="mb-4">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button onClick={togglePlay} className="text-white hover:text-gray-300">
                      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    
                    <button onClick={() => skipTime(-10)} className="text-white hover:text-gray-300">
                      <SkipBack size={20} />
                    </button>
                    
                    <button onClick={() => skipTime(10)} className="text-white hover:text-gray-300">
                      <SkipForward size={20} />
                    </button>

                    <div className="flex items-center space-x-2">
                      <button onClick={toggleMute} className="text-white hover:text-gray-300">
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    <div className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <button 
                        onClick={() => setShowSettings(!showSettings)}
                        className="text-white hover:text-gray-300"
                      >
                        <Settings size={20} />
                      </button>
                      
                      {showSettings && (
                        <div className="absolute bottom-8 right-0 bg-dark-secondary border border-dark-hover rounded-lg shadow-lg w-48 py-2">
                          <div className="px-4 py-2 text-sm font-medium text-gray-400">Playback Speed</div>
                          {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                            <button
                              key={rate}
                              onClick={() => changePlaybackRate(rate)}
                              className={`w-full text-left px-4 py-2 hover:bg-dark-hover text-sm ${
                                playbackRate === rate ? 'text-youtube-red' : 'text-white'
                              }`}
                            >
                              {rate === 1 ? 'Normal' : `${rate}x`}
                            </button>
                          ))}
                          
                          <hr className="my-2 border-dark-hover" />
                          <div className="px-4 py-2 text-sm font-medium text-gray-400">Quality</div>
                          {['Auto', '1080p', '720p', '480p', '360p'].map((q) => (
                            <button
                              key={q}
                              onClick={() => setQuality(q.toLowerCase())}
                              className={`w-full text-left px-4 py-2 hover:bg-dark-hover text-sm ${
                                quality === q.toLowerCase() ? 'text-youtube-red' : 'text-white'
                              }`}
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button onClick={toggleFullscreen} className="text-white hover:text-gray-300">
                      <Maximize size={20} />
                    </button>
                  </div>
                </div>
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

          {/* Investment Section */}
          <div className="bg-dark-secondary rounded-lg p-6 mb-4">
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign size={24} className="text-green-500" />
              <h3 className="text-xl font-bold">Invest in this Content</h3>
            </div>
            
            {/* Investment Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Funding Progress</span>
                <span className="text-sm font-medium">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-500 font-medium">{formatCurrency(totalInvestment)} raised</span>
                <span className="text-gray-400">Goal: {formatCurrency(investmentGoal)}</span>
              </div>
            </div>

            {/* Investment Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users size={20} className="text-blue-500" />
                </div>
                <div className="text-lg font-bold">{totalInvestors}</div>
                <div className="text-xs text-gray-400">Investors</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp size={20} className="text-green-500" />
                </div>
                <div className="text-lg font-bold">{formatCurrency(totalInvestment / totalInvestors)}</div>
                <div className="text-xs text-gray-400">Avg Investment</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Target size={20} className="text-purple-500" />
                </div>
                <div className="text-lg font-bold">{Math.max(0, Math.round((investmentGoal - totalInvestment) / 1000))}K</div>
                <div className="text-xs text-gray-400">Remaining</div>
              </div>
            </div>

            {/* Investment Tiers */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Investment Tiers</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {investmentTiers.map((tier) => (
                  <div 
                    key={tier.name}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedInvestmentTier === tier.name 
                        ? 'border-green-500 bg-green-500/10' 
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedInvestmentTier(tier.name)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{tier.name}</span>
                      <span className="text-sm text-gray-400">
                        {formatCurrency(tier.min)}{tier.max !== Infinity ? ` - ${formatCurrency(tier.max)}` : '+'}
                      </span>
                    </div>
                    <ul className="text-xs text-gray-400 space-y-1">
                      {tier.benefits.map((benefit, index) => (
                        <li key={index}>• {benefit}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Investment Input */}
            <div className="flex space-x-3">
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Enter amount ($50 minimum)"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-bg border border-gray-600 rounded-lg focus:border-green-500 focus:outline-none"
                  min="50"
                />
                {investmentAmount && getInvestmentTier(parseFloat(investmentAmount)) && (
                  <div className="text-xs text-green-500 mt-1">
                    {getInvestmentTier(parseFloat(investmentAmount))?.name} Tier
                  </div>
                )}
              </div>
              <button
                onClick={handleInvestment}
                disabled={!investmentAmount || parseFloat(investmentAmount) < 50}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
              >
                Invest
              </button>
            </div>
            
            <p className="text-xs text-gray-400 mt-3">
              * Investments are subject to terms and conditions. Past performance does not guarantee future results.
            </p>
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
                  <p className="text-gray-300 mb-2">Great video! The quality is amazing and the content is very informative.</p>
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
                  <p className="text-gray-300 mb-2">Thanks for sharing! Could you upload more videos like this?</p>
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
              onClick={handleUploadClick}
              className="flex items-center space-x-2 px-3 py-1.5 bg-dark-secondary hover:bg-dark-hover rounded-full transition-colors text-sm"
            >
              <Upload size={16} />
              <span>Upload</span>
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
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
    </div>
  );
};

export default VideoPlayer;