import React, { useState, useRef, useEffect } from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Share, 
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
  Target,
  Heart,
  Bookmark,
  Send,
  Zap,
  Star,
  Award,
  Sparkles,
  Database,
  Globe,
  Shield,
  Clock,
  Quote
} from 'lucide-react';
import { Video } from '../types/Video';
import VideoUploadModal from './VideoUploadModal';
import { tavusClient, TavusVideoResponse } from '../lib/tavus';

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
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showFilecoinInfo, setShowFilecoinInfo] = useState(false);
  
  // AI Presenter states
  const [isShowingPresenter, setIsShowingPresenter] = useState(true);
  const [presenterVideo, setPresenterVideo] = useState<TavusVideoResponse | null>(null);
  const [isGeneratingPresenter, setIsGeneratingPresenter] = useState(false);
  const [presenterError, setPresenterError] = useState('');
  const [autoPlayCountdown, setAutoPlayCountdown] = useState(0);
  
  // Investment states
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [selectedInvestmentTier, setSelectedInvestmentTier] = useState('');
  const [totalInvestment, setTotalInvestment] = useState(125000);
  const [investmentGoal, setInvestmentGoal] = useState(500000);
  const [totalInvestors, setTotalInvestors] = useState(47);
  const [showInvestmentSuccess, setShowInvestmentSuccess] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const countdownRef = useRef<NodeJS.Timeout>();

  // Investment tiers
  const investmentTiers = [
    { name: 'Supporter', min: 50, max: 499, benefits: ['Early access to content', 'Exclusive updates'], color: 'text-blue-400', icon: Star },
    { name: 'Backer', min: 500, max: 2499, benefits: ['All Supporter benefits', 'Monthly video calls', 'Behind-the-scenes content'], color: 'text-purple-400', icon: Award },
    { name: 'Partner', min: 2500, max: 9999, benefits: ['All Backer benefits', 'Co-producer credit', 'Input on future content'], color: 'text-pink-400', icon: Sparkles },
    { name: 'Executive', min: 10000, max: Infinity, benefits: ['All Partner benefits', 'Revenue sharing', 'Direct collaboration opportunities'], color: 'text-yellow-400', icon: Zap }
  ];

  // Generate presenter video when video changes
  useEffect(() => {
    setIsShowingPresenter(true);
    setPresenterVideo(null);
    setAutoPlayCountdown(0);
    generatePresenterVideo();
  }, [video.id]);

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

  // Auto-play countdown after presenter video ends
  useEffect(() => {
    if (presenterVideo && !isPlaying && currentTime > 0 && Math.abs(currentTime - duration) < 1 && isShowingPresenter) {
      // Presenter video ended, start countdown
      setAutoPlayCountdown(3);
      countdownRef.current = setInterval(() => {
        setAutoPlayCountdown(prev => {
          if (prev <= 1) {
            handleSkipToMainVideo();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [currentTime, duration, isPlaying, presenterVideo, isShowingPresenter]);

  // Auto-play next video when main video ends
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || isShowingPresenter) return;

    const handleEnded = () => {
      if (upNextVideos.length > 0) {
        setTimeout(() => {
          onNextVideo();
        }, 2000);
      }
    };

    videoElement.addEventListener('ended', handleEnded);
    return () => videoElement.removeEventListener('ended', handleEnded);
  }, [upNextVideos.length, onNextVideo, isShowingPresenter]);

  const generatePresenterVideo = async () => {
    setIsGeneratingPresenter(true);
    setPresenterError('');

    try {
      const request = {
        videoTitle: video.title,
        videoDescription: video.description || '',
        channelName: video.channel,
        duration: video.duration,
        views: video.views,
        additionalContext: {
          category: 'general'
        }
      };

      const result = await tavusClient.generatePresenterVideo(request);
      setPresenterVideo(result);
      
      // Auto-play presenter video when ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play();
          setIsPlaying(true);
        }
      }, 500);
      
    } catch (error) {
      console.error('Failed to generate presenter video:', error);
      setPresenterError('Failed to generate AI presenter. Skipping to main video.');
      // Skip to main video if presenter generation fails
      setTimeout(() => {
        handleSkipToMainVideo();
      }, 2000);
    } finally {
      setIsGeneratingPresenter(false);
    }
  };

  const handleSkipToMainVideo = () => {
    setIsShowingPresenter(false);
    setAutoPlayCountdown(0);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    
    // Reset video player for main video
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }, 500);
  };

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

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (isDisliked) setIsDisliked(false);
  };

  const handleDislike = () => {
    setIsDisliked(!isDisliked);
    if (isLiked) setIsLiked(false);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleInvestment = () => {
    const amount = parseFloat(investmentAmount);
    if (amount && amount >= 50) {
      setTotalInvestment(prev => prev + amount);
      setTotalInvestors(prev => prev + 1);
      setInvestmentAmount('');
      setSelectedInvestmentTier('');
      setShowInvestmentSuccess(true);
      setTimeout(() => setShowInvestmentSuccess(false), 3000);
    } else {
      alert('Minimum investment amount is $50');
    }
  };

  const handleVideoUploaded = (uploadedVideo: Video) => {
    onVideoUpload(uploadedVideo);
    setShowUploadModal(false);
  };

  const progressPercentage = (totalInvestment / investmentGoal) * 100;

  // Determine current video source and info
  const currentVideoSource = isShowingPresenter && presenterVideo ? presenterVideo.videoUrl : (video.videoUrl || video.thumbnail);
  const currentVideoPoster = isShowingPresenter && presenterVideo ? presenterVideo.thumbnailUrl : video.thumbnail;

  return (
    <div className="py-8 fade-in">
      <div className="flex flex-col lg:flex-row gap-8 px-6 max-w-7xl mx-auto">
        {/* Main Video Section */}
        <div className="flex-1">
          {/* Video Player */}
          <div 
            ref={playerRef}
            className="relative bg-black rounded-2xl overflow-hidden mb-6 group shadow-2xl card-hover"
            onMouseMove={() => setShowControls(true)}
            onMouseLeave={() => isPlaying && setShowControls(false)}
          >
            <video
              ref={videoRef}
              src={currentVideoSource}
              poster={currentVideoPoster}
              className="w-full aspect-video object-cover"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            
            {/* AI Presenter Badge */}
            {isShowingPresenter && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-500/90 to-pink-500/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center space-x-2">
                <Sparkles size={16} className="text-white" />
                <span className="text-white text-sm font-medium">AI Presenter - Sophia</span>
              </div>
            )}
            
            {/* Filecoin Badge - Only show for main video */}
            {!isShowingPresenter && video.filecoinCID && (
              <div className="absolute top-4 right-4 bg-gradient-to-r from-primary/90 to-secondary/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center space-x-2">
                <Database size={16} className="text-white" />
                <span className="text-white text-sm font-medium">Stored on Filecoin</span>
              </div>
            )}
            
            {/* Loading State for Presenter Generation */}
            {isGeneratingPresenter && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white font-medium">Sophia is preparing your introduction...</p>
                  <p className="text-white/70 text-sm mt-2">This may take a moment</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {presenterError && (
              <div className="absolute top-20 left-4 right-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{presenterError}</p>
              </div>
            )}

            {/* Auto-play Countdown */}
            {autoPlayCountdown > 0 && isShowingPresenter && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="text-center bg-black/80 rounded-2xl p-8">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Zap size={24} className="text-secondary" />
                    <h3 className="text-xl font-bold text-white">Starting Video</h3>
                  </div>
                  <div className="text-6xl font-bold text-secondary mb-4">{autoPlayCountdown}</div>
                  <p className="text-white/80 mb-4">Video will start automatically</p>
                  <button
                    onClick={handleSkipToMainVideo}
                    className="px-6 py-3 bg-secondary rounded-lg text-white hover:scale-105 transition-all duration-300 font-medium"
                  >
                    Skip to Video
                  </button>
                </div>
              </div>
            )}
            
            {/* Video Controls Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-all duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}>
              {/* Center Play Button */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button 
                    onClick={togglePlay}
                    className="w-20 h-20 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-300 shadow-2xl pulse-glow ripple"
                  >
                    <Play size={32} className="text-white ml-1" />
                  </button>
                </div>
              )}

              {/* Bottom Controls */}
              <div className={`absolute bottom-0 left-0 right-0 p-6 transition-all duration-300 ${showControls ? 'controls-fade-in' : 'controls-fade-out'}`}>
                {/* Progress Bar */}
                <div className="mb-6">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <button onClick={togglePlay} className="text-white hover:text-primary transition-all duration-300 scale-hover ripple p-2 rounded-lg">
                      {isPlaying ? <Pause size={28} /> : <Play size={28} />}
                    </button>
                    
                    <button onClick={() => skipTime(-10)} className="text-white hover:text-primary transition-all duration-300 scale-hover ripple p-2 rounded-lg">
                      <SkipBack size={24} />
                    </button>
                    
                    <button onClick={() => skipTime(10)} className="text-white hover:text-primary transition-all duration-300 scale-hover ripple p-2 rounded-lg">
                      <SkipForward size={24} />
                    </button>

                    <div className="flex items-center space-x-3">
                      <button onClick={toggleMute} className="text-white hover:text-primary transition-all duration-300 scale-hover ripple p-2 rounded-lg">
                        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-24 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    <div className="text-white text-sm font-mono bg-black/50 px-3 py-1 rounded-lg backdrop-blur-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Skip to Video Button - Only show during presenter */}
                    {isShowingPresenter && !autoPlayCountdown && (
                      <button 
                        onClick={handleSkipToMainVideo}
                        className="flex items-center space-x-2 px-3 py-2 bg-secondary rounded-lg text-white hover:scale-105 transition-all duration-300"
                      >
                        <SkipForward size={16} />
                        <span className="text-sm">Skip to Video</span>
                      </button>
                    )}

                    <div className="relative">
                      <button 
                        onClick={() => setShowSettings(!showSettings)}
                        className="text-white hover:text-primary transition-all duration-300 p-2 rounded-lg hover:bg-white/10 scale-hover"
                      >
                        <Settings size={24} />
                      </button>
                      
                      {showSettings && (
                        <div className="absolute bottom-12 right-0 glass rounded-xl shadow-2xl w-56 py-3 border border-primary/20 bounce-in">
                          <div className="px-4 py-2 text-sm font-semibold text-text-secondary">Playback Speed</div>
                          {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                            <button
                              key={rate}
                              onClick={() => changePlaybackRate(rate)}
                              className={`w-full text-left px-4 py-2 hover:bg-primary/20 text-sm transition-all duration-300 ripple ${
                                playbackRate === rate ? 'text-primary bg-primary/10' : 'text-text-primary'
                              }`}
                            >
                              {rate === 1 ? 'Normal' : `${rate}x`}
                            </button>
                          ))}
                          
                          <hr className="my-2 border-dark-border" />
                          <div className="px-4 py-2 text-sm font-semibold text-text-secondary">Quality</div>
                          {['Auto', '1080p', '720p', '480p', '360p'].map((q) => (
                            <button
                              key={q}
                              onClick={() => setQuality(q.toLowerCase())}
                              className={`w-full text-left px-4 py-2 hover:bg-primary/20 text-sm transition-all duration-300 ripple ${
                                quality === q.toLowerCase() ? 'text-primary bg-primary/10' : 'text-text-primary'
                              }`}
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button onClick={toggleFullscreen} className="text-white hover:text-primary transition-all duration-300 p-2 rounded-lg hover:bg-white/10 scale-hover">
                      <Maximize size={24} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Info */}
          <div className="mb-6 slide-in-left">
            <h1 className="text-2xl font-bold mb-4 text-text-primary">{video.title}</h1>
            
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4 text-text-secondary">
                <span className="font-medium">{video.views}</span>
                {!isShowingPresenter && video.filecoinCID && (
                  <button
                    onClick={() => setShowFilecoinInfo(!showFilecoinInfo)}
                    className="flex items-center space-x-2 px-3 py-1 bg-primary/10 rounded-lg text-primary hover:bg-primary/20 transition-all duration-300"
                  >
                    <Database size={14} />
                    <span className="text-sm font-medium">Filecoin</span>
                  </button>
                )}
              </div>
              
              {/* Only show interaction buttons for main video */}
              {!isShowingPresenter && (
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={handleLike}
                    className={`flex items-center space-x-2 px-6 py-3 glass hover:bg-primary/20 rounded-xl transition-all duration-300 btn-animate ripple ${
                      isLiked ? 'text-primary bg-primary/10' : ''
                    }`}
                  >
                    <Heart size={20} className={isLiked ? 'fill-current' : ''} />
                    <span className="font-medium">{video.likes}</span>
                  </button>
                  
                  <button 
                    onClick={handleDislike}
                    className={`flex items-center space-x-2 px-6 py-3 glass hover:bg-primary/20 rounded-xl transition-all duration-300 btn-animate ripple ${
                      isDisliked ? 'text-red-400 bg-red-400/10' : ''
                    }`}
                  >
                    <ThumbsDown size={20} className={isDisliked ? 'fill-current' : ''} />
                  </button>
                  
                  <div className="relative">
                    <button 
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="flex items-center space-x-2 px-6 py-3 glass hover:bg-primary/20 rounded-xl transition-all duration-300 btn-animate ripple"
                    >
                      <Share size={20} />
                      <span className="font-medium">Share</span>
                    </button>
                    
                    {showShareMenu && (
                      <div className="absolute top-full mt-2 right-0 glass rounded-xl shadow-2xl w-48 py-3 border border-primary/20 bounce-in z-10">
                        <button className="w-full text-left px-4 py-2 hover:bg-primary/20 text-sm transition-all duration-300 ripple">Copy Link</button>
                        <button className="w-full text-left px-4 py-2 hover:bg-primary/20 text-sm transition-all duration-300 ripple">Share on Twitter</button>
                        <button className="w-full text-left px-4 py-2 hover:bg-primary/20 text-sm transition-all duration-300 ripple">Share on Facebook</button>
                        <button className="w-full text-left px-4 py-2 hover:bg-primary/20 text-sm transition-all duration-300 ripple">Embed Video</button>
                        {video.filecoinCID && (
                          <button className="w-full text-left px-4 py-2 hover:bg-primary/20 text-sm transition-all duration-300 ripple">Share Filecoin CID</button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={handleSave}
                    className={`flex items-center space-x-2 px-6 py-3 glass hover:bg-primary/20 rounded-xl transition-all duration-300 btn-animate ripple ${
                      isSaved ? 'text-secondary bg-secondary/10' : ''
                    }`}
                  >
                    <Bookmark size={20} className={isSaved ? 'fill-current' : ''} />
                    <span className="font-medium">Save</span>
                  </button>
                  
                  <button className="p-3 glass hover:bg-primary/20 rounded-xl transition-all duration-300 scale-hover ripple">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Filecoin Info Panel - Only for main video */}
            {!isShowingPresenter && showFilecoinInfo && video.filecoinCID && (
              <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl bounce-in">
                <div className="flex items-center space-x-3 mb-3">
                  <Globe size={20} className="text-primary" />
                  <h3 className="font-semibold text-text-primary">Decentralized Storage Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-text-muted mb-1">Content Identifier (CID)</p>
                    <p className="font-mono text-primary break-all">{video.filecoinCID}</p>
                  </div>
                  {video.dealInfo && (
                    <>
                      <div>
                        <p className="text-text-muted mb-1">Storage Deal ID</p>
                        <p className="font-mono text-secondary">{video.dealInfo.dealId}</p>
                      </div>
                      <div>
                        <p className="text-text-muted mb-1">Storage Provider</p>
                        <p className="font-mono text-text-primary">{video.dealInfo.provider}</p>
                      </div>
                      <div>
                        <p className="text-text-muted mb-1">Deal Price</p>
                        <p className="font-mono text-accent">{video.dealInfo.price}</p>
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-3 flex items-center space-x-4 text-xs text-text-muted">
                  <div className="flex items-center space-x-1">
                    <Shield size={12} />
                    <span>Cryptographically verified</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock size={12} />
                    <span>Permanent storage</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Globe size={12} />
                    <span>Decentralized network</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Presenter Transcript - Only show during presenter video */}
          {isShowingPresenter && presenterVideo?.transcript && (
            <div className="glass rounded-2xl p-6 mb-6 border border-purple-500/20 slide-in-right">
              <div className="flex items-center space-x-3 mb-4">
                <Quote size={20} className="text-purple-400" />
                <h3 className="font-semibold text-text-primary">Sophia's Introduction</h3>
              </div>
              <p className="text-text-secondary leading-relaxed italic">"{presenterVideo.transcript}"</p>
            </div>
          )}

          {/* Channel Info - Only show for main video */}
          {!isShowingPresenter && (
            <div className="glass rounded-2xl p-6 mb-6 border border-primary/10 slide-in-right">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img 
                      src={video.channelAvatar} 
                      alt={video.channel}
                      className="w-14 h-14 rounded-full ring-2 ring-primary/30 morph-shape"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-secondary rounded-full border-2 border-dark-surface pulse-glow"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-text-primary">{video.channel}</h3>
                    <p className="text-text-secondary">{video.subscribers} subscribers</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setIsSubscribed(!isSubscribed)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 btn-animate ripple ${
                      isSubscribed 
                        ? 'glass text-text-secondary hover:bg-primary/20' 
                        : 'bg-primary text-white hover:scale-105 shadow-lg'
                    }`}
                  >
                    <Zap size={18} />
                    <span>{isSubscribed ? 'Subscribed' : 'Subscribe'}</span>
                  </button>
                </div>
              </div>
              
              {/* Description */}
              <div className="text-text-secondary">
                <p className={`leading-relaxed transition-all duration-500 ${showDescription ? '' : 'line-clamp-3'}`}>
                  {video.description}
                </p>
                <button 
                  onClick={() => setShowDescription(!showDescription)}
                  className="flex items-center space-x-2 text-primary hover:text-primary-light mt-3 transition-all duration-300 font-medium scale-hover"
                >
                  <span>{showDescription ? 'Show less' : 'Show more'}</span>
                  {showDescription ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>
            </div>
          )}

          {/* Comments Section - Only show for main video */}
          {!isShowingPresenter && (
            <div className="glass rounded-2xl p-6 border border-primary/10 slide-in-left">
              <h3 className="font-bold mb-6 text-xl text-text-primary flex items-center space-x-2">
                <Send size={20} className="text-primary" />
                <span>1,234 Comments</span>
              </h3>
              
              {/* Add Comment */}
              <div className="flex space-x-4 mb-8">
                <img 
                  src="https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2" 
                  alt="Your avatar"
                  className="w-12 h-12 rounded-full ring-2 ring-primary/30 float-animation"
                />
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="Add a comment..."
                    className="w-full bg-transparent border-b-2 border-dark-border pb-3 outline-none focus:border-primary transition-all duration-300 text-text-primary placeholder-text-muted"
                  />
                  <div className="flex justify-end space-x-3 mt-4">
                    <button className="px-4 py-2 text-text-secondary hover:text-text-primary transition-all duration-300 scale-hover">
                      Cancel
                    </button>
                    <button className="px-6 py-2 bg-primary rounded-xl text-white font-medium hover:scale-105 transition-all duration-300 ripple">
                      Comment
                    </button>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-6">
                <div className="flex space-x-4 stagger-item">
                  <img 
                    src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2" 
                    alt="User"
                    className="w-12 h-12 rounded-full ring-2 ring-secondary/30"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-semibold text-text-primary">@techexplorer</span>
                      <span className="text-text-muted text-sm">2 hours ago</span>
                    </div>
                    <p className="text-text-secondary mb-3 leading-relaxed">Great video! Love that it's stored on Filecoin - truly decentralized content!</p>
                    <div className="flex items-center space-x-6">
                      <button className="flex items-center space-x-2 text-text-muted hover:text-primary transition-all duration-300 scale-hover">
                        <ThumbsUp size={16} />
                        <span className="text-sm font-medium">24</span>
                      </button>
                      <button className="flex items-center space-x-2 text-text-muted hover:text-primary transition-all duration-300 scale-hover">
                        <ThumbsDown size={16} />
                      </button>
                      <button className="text-text-muted hover:text-primary text-sm font-medium transition-all duration-300 scale-hover">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4 stagger-item">
                  <img 
                    src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2" 
                    alt="User"
                    className="w-12 h-12 rounded-full ring-2 ring-accent/30"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-semibold text-text-primary">@developer456</span>
                      <span className="text-text-muted text-sm">5 hours ago</span>
                    </div>
                    <p className="text-text-secondary mb-3 leading-relaxed">Amazing to see decentralized storage in action! The future of content is here.</p>
                    <div className="flex items-center space-x-6">
                      <button className="flex items-center space-x-2 text-text-muted hover:text-primary transition-all duration-300 scale-hover">
                        <ThumbsUp size={16} />
                        <span className="text-sm font-medium">12</span>
                      </button>
                      <button className="flex items-center space-x-2 text-text-muted hover:text-primary transition-all duration-300 scale-hover">
                        <ThumbsDown size={16} />
                      </button>
                      <button className="text-text-muted hover:text-primary text-sm font-medium transition-all duration-300 scale-hover">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="lg:w-96 space-y-6 slide-in-right">
          {/* Up Next Section */}
          <div className="glass rounded-2xl p-6 border border-primary/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-text-primary">Up Next</h3>
              <button 
                onClick={() => setShowUploadModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-medium hover:scale-105 transition-all duration-300 text-sm ripple"
              >
                <Database size={16} />
                <span>Upload to Filecoin</span>
              </button>
            </div>
            
            {/* Scrollable container for videos */}
            <div className={`space-y-4 ${upNextVideos.length > 3 ? 'max-h-96 overflow-y-auto pr-2' : ''}`}>
              {upNextVideos.map((upNextVideo, index) => (
                <div 
                  key={upNextVideo.id} 
                  className="flex space-x-3 cursor-pointer hover:bg-primary/10 p-3 rounded-xl transition-all duration-300 card-hover stagger-item"
                  onClick={() => onVideoSelect(currentVideoIndex + index + 1)}
                >
                  <div className="relative flex-shrink-0">
                    <img 
                      src={upNextVideo.thumbnail} 
                      alt={upNextVideo.title}
                      className="w-40 aspect-video object-cover rounded-lg video-thumbnail"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-mono backdrop-blur-sm">
                      {upNextVideo.duration}
                    </div>
                    {upNextVideo.filecoinCID && (
                      <div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm rounded px-2 py-1">
                        <Database size={10} className="text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm line-clamp-2 mb-2 text-text-primary">{upNextVideo.title}</h4>
                    <p className="text-text-secondary text-xs mb-1 font-medium">{upNextVideo.channel}</p>
                    <div className="flex items-center space-x-2 text-text-muted text-xs">
                      <span>{upNextVideo.views}</span>
                      <span>•</span>
                      <span>{upNextVideo.timestamp}</span>
                      {upNextVideo.filecoinCID && (
                        <>
                          <span>•</span>
                          <span className="text-primary">Filecoin</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {upNextVideos.length === 0 && (
                <div className="text-center text-text-muted py-8">
                  <Database size={48} className="mx-auto mb-4 opacity-50 float-animation" />
                  <p className="font-medium">No more videos in queue</p>
                  <p className="text-sm mt-2">Upload a video to Filecoin to add it to the queue</p>
                </div>
              )}
            </div>
          </div>

          {/* Investment Section - Only show for main video */}
          {!isShowingPresenter && (
            <div className="glass rounded-2xl p-6 border border-secondary/20 relative overflow-hidden">
              {/* Success notification */}
              {showInvestmentSuccess && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg bounce-in z-10">
                  <div className="flex items-center space-x-2">
                    <Sparkles size={16} />
                    <span className="text-sm font-medium">Investment successful!</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center pulse-glow">
                  <DollarSign size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-text-primary">Invest in Content</h3>
              </div>
              
              {/* Investment Progress */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-text-secondary font-medium">Funding Progress</span>
                  <span className="text-sm font-bold text-secondary">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-dark-border rounded-full h-3 mb-3 overflow-hidden">
                  <div 
                    className="progress-bar h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary font-bold">{formatCurrency(totalInvestment)}</span>
                  <span className="text-text-muted">Goal: {formatCurrency(investmentGoal)}</span>
                </div>
              </div>

              {/* Investment Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 glass rounded-xl card-hover">
                  <div className="flex items-center justify-center mb-2">
                    <Users size={20} className="text-blue-400" />
                  </div>
                  <div className="text-lg font-bold text-text-primary">{totalInvestors}</div>
                  <div className="text-xs text-text-muted">Investors</div>
                </div>
                <div className="text-center p-3 glass rounded-xl card-hover">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp size={20} className="text-green-400" />
                  </div>
                  <div className="text-lg font-bold text-text-primary">{formatCurrency(totalInvestment / totalInvestors)}</div>
                  <div className="text-xs text-text-muted">Average</div>
                </div>
                <div className="text-center p-3 glass rounded-xl card-hover">
                  <div className="flex items-center justify-center mb-2">
                    <Target size={20} className="text-purple-400" />
                  </div>
                  <div className="text-lg font-bold text-text-primary">{Math.max(0, Math.round((investmentGoal - totalInvestment) / 1000))}K</div>
                  <div className="text-xs text-text-muted">Remaining</div>
                </div>
              </div>

              {/* Investment Tiers */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-4 text-text-primary">Investment Tiers</h4>
                <div className="space-y-3">
                  {investmentTiers.map((tier, index) => {
                    const IconComponent = tier.icon;
                    return (
                      <div 
                        key={tier.name}
                        className={`border rounded-xl p-4 cursor-pointer transition-all duration-300 stagger-item card-hover ${
                          selectedInvestmentTier === tier.name 
                            ? 'border-secondary bg-secondary/10' 
                            : 'border-dark-border hover:border-primary/50 hover:bg-primary/5'
                        }`}
                        onClick={() => setSelectedInvestmentTier(tier.name)}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center space-x-2">
                            <IconComponent size={16} className={tier.color} />
                            <span className={`font-semibold ${tier.color}`}>
                              {tier.name}
                            </span>
                          </div>
                          <span className="text-text-muted text-sm font-mono">
                            {formatCurrency(tier.min)}{tier.max !== Infinity ? ` - ${formatCurrency(tier.max)}` : '+'}
                          </span>
                        </div>
                        <div className="text-xs text-text-secondary">
                          {tier.benefits.slice(0, 2).join(' • ')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Investment Input */}
              <div className="space-y-4">
                <input
                  type="number"
                  placeholder="Enter amount ($50 minimum)"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 text-text-primary placeholder-text-muted font-mono transition-all duration-300"
                  min="50"
                />
                {investmentAmount && getInvestmentTier(parseFloat(investmentAmount)) && (
                  <div className="text-sm text-secondary font-semibold flex items-center space-x-2 bounce-in">
                    <Zap size={16} />
                    <span>{getInvestmentTier(parseFloat(investmentAmount))?.name} Tier Selected</span>
                  </div>
                )}
                <button
                  onClick={handleInvestment}
                  disabled={!investmentAmount || parseFloat(investmentAmount) < 50}
                  className="w-full py-3 bg-secondary hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 rounded-xl font-semibold text-white transition-all duration-300 btn-animate ripple"
                >
                  Invest Now
                </button>
              </div>
              
              <p className="text-xs text-text-muted mt-4 text-center">
                * Subject to terms and conditions
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Video Upload Modal */}
      <VideoUploadModal 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onVideoUploaded={handleVideoUploaded}
      />
    </div>
  );
};

export default VideoPlayer;