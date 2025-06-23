import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Volume2, VolumeX, RotateCcw, Sparkles, User, Clock, Eye, Zap } from 'lucide-react';
import { tavusClient, PresenterPersona, TavusVideoResponse, selectPresenterForContent } from '../lib/tavus';
import { Video } from '../types/Video';

interface AIPresenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueToVideo: () => void;
  video: Video;
}

const AIPresenterModal: React.FC<AIPresenterModalProps> = ({
  isOpen,
  onClose,
  onContinueToVideo,
  video
}) => {
  const [presenterVideo, setPresenterVideo] = useState<TavusVideoResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedPresenter, setSelectedPresenter] = useState<PresenterPersona | null>(null);
  const [showPresenterSelection, setShowPresenterSelection] = useState(false);
  const [error, setError] = useState('');
  const [autoPlayCountdown, setAutoPlayCountdown] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const countdownRef = useRef<NodeJS.Timeout>();

  const presenters = tavusClient.getPresenters();
  const isTavusEnabled = tavusClient.isEnabled();

  // Auto-select presenter based on content
  useEffect(() => {
    if (isOpen && !selectedPresenter) {
      const recommendedPresenterId = selectPresenterForContent(video.title, video.description || '');
      const presenter = presenters.find(p => p.id === recommendedPresenterId) || presenters[0];
      setSelectedPresenter(presenter);
    }
  }, [isOpen, video, presenters, selectedPresenter]);

  // Generate presenter video when modal opens
  useEffect(() => {
    if (isOpen && selectedPresenter && !presenterVideo && !isGenerating) {
      generatePresenterVideo();
    }
  }, [isOpen, selectedPresenter]);

  // Auto-play countdown after presenter video ends
  useEffect(() => {
    if (presenterVideo && !isPlaying && currentTime > 0 && Math.abs(currentTime - duration) < 1) {
      // Video ended, start countdown
      setAutoPlayCountdown(5);
      countdownRef.current = setInterval(() => {
        setAutoPlayCountdown(prev => {
          if (prev <= 1) {
            onContinueToVideo();
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
  }, [currentTime, duration, isPlaying, presenterVideo, onContinueToVideo]);

  const generatePresenterVideo = async () => {
    if (!selectedPresenter) return;

    setIsGenerating(true);
    setError('');

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

      const result = await tavusClient.generatePresenterVideo(request, selectedPresenter.id);
      setPresenterVideo(result);
      
      // Auto-play when ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play();
          setIsPlaying(true);
        }
      }, 500);
      
    } catch (error) {
      console.error('Failed to generate presenter video:', error);
      setError('Failed to generate AI presenter. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePresenterChange = (presenter: PresenterPersona) => {
    setSelectedPresenter(presenter);
    setPresenterVideo(null);
    setShowPresenterSelection(false);
    setCurrentTime(0);
    setDuration(0);
    setAutoPlayCountdown(0);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
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

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(video.muted);
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

  const formatTime = (time: number) => {
    if (!isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleRegenerate = () => {
    setPresenterVideo(null);
    setCurrentTime(0);
    setDuration(0);
    setAutoPlayCountdown(0);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    generatePresenterVideo();
  };

  const handleSkip = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    setAutoPlayCountdown(0);
    onContinueToVideo();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-primary/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">AI Video Presenter</h2>
              <p className="text-sm text-text-secondary">
                {isTavusEnabled ? 'Powered by Tavus AI' : 'Demo Mode - Enable Tavus for real AI presenters'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-primary/20 rounded-lg transition-all duration-300"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        <div className="p-6">
          {/* Presenter Selection */}
          {showPresenterSelection && (
            <div className="mb-6 p-4 glass rounded-xl border border-primary/10">
              <h3 className="text-lg font-semibold mb-4 text-text-primary">Choose Your AI Presenter</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {presenters.map((presenter) => (
                  <div
                    key={presenter.id}
                    onClick={() => handlePresenterChange(presenter)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                      selectedPresenter?.id === presenter.id
                        ? 'border-primary bg-primary/10'
                        : 'border-dark-border hover:border-primary/50 hover:bg-primary/5'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={presenter.avatarUrl}
                        alt={presenter.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-text-primary">{presenter.name}</h4>
                        <p className="text-xs text-primary capitalize">{presenter.voiceStyle}</p>
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary">{presenter.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
                {isGenerating ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-white font-medium">
                        {isTavusEnabled ? 'Generating AI presenter...' : 'Preparing demo presenter...'}
                      </p>
                      <p className="text-white/70 text-sm mt-2">This may take a moment</p>
                    </div>
                  </div>
                ) : presenterVideo ? (
                  <>
                    <video
                      ref={videoRef}
                      src={presenterVideo.videoUrl}
                      className="w-full h-full object-cover"
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => setIsPlaying(false)}
                    />
                    
                    {/* Video Controls */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={togglePlay}
                            className="w-12 h-12 bg-primary rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300"
                          >
                            {isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white ml-1" />}
                          </button>
                          
                          <button
                            onClick={toggleMute}
                            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-300"
                          >
                            {isMuted ? <VolumeX size={20} className="text-white" /> : <Volume2 size={20} className="text-white" />}
                          </button>
                          
                          <div className="text-white text-sm font-mono">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </div>
                        </div>
                        
                        <button
                          onClick={handleRegenerate}
                          className="flex items-center space-x-2 px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all duration-300"
                        >
                          <RotateCcw size={16} className="text-white" />
                          <span className="text-white text-sm">Regenerate</span>
                        </button>
                      </div>
                    </div>
                  </>
                ) : error ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X size={32} className="text-red-400" />
                      </div>
                      <p className="text-red-400 font-medium mb-2">Generation Failed</p>
                      <p className="text-white/70 text-sm mb-4">{error}</p>
                      <button
                        onClick={handleRegenerate}
                        className="px-4 py-2 bg-primary rounded-lg text-white hover:scale-105 transition-all duration-300"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles size={32} className="text-primary" />
                      </div>
                      <p className="text-white font-medium">Ready to generate</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Video Info & Controls */}
            <div className="space-y-6">
              {/* Current Presenter */}
              {selectedPresenter && (
                <div className="glass rounded-xl p-4 border border-primary/10">
                  <div className="flex items-center space-x-3 mb-3">
                    <img
                      src={selectedPresenter.avatarUrl}
                      alt={selectedPresenter.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/30"
                    />
                    <div>
                      <h3 className="font-semibold text-text-primary">{selectedPresenter.name}</h3>
                      <p className="text-sm text-primary capitalize">{selectedPresenter.voiceStyle} Style</p>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary mb-3">{selectedPresenter.description}</p>
                  <button
                    onClick={() => setShowPresenterSelection(!showPresenterSelection)}
                    className="w-full py-2 glass border border-dark-border rounded-lg hover:border-primary/50 transition-all duration-300 text-sm"
                  >
                    Change Presenter
                  </button>
                </div>
              )}

              {/* Video Being Introduced */}
              <div className="glass rounded-xl p-4 border border-secondary/10">
                <h3 className="font-semibold text-text-primary mb-3">Introducing:</h3>
                <div className="flex space-x-3">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-20 aspect-video object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-medium text-text-primary text-sm line-clamp-2 mb-1">{video.title}</h4>
                    <p className="text-xs text-text-secondary mb-1">{video.channel}</p>
                    <div className="flex items-center space-x-2 text-xs text-text-muted">
                      <Clock size={12} />
                      <span>{video.duration}</span>
                      <Eye size={12} />
                      <span>{video.views}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transcript */}
              {presenterVideo?.transcript && (
                <div className="glass rounded-xl p-4 border border-accent/10">
                  <h3 className="font-semibold text-text-primary mb-3 flex items-center space-x-2">
                    <User size={16} />
                    <span>Presenter Script</span>
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{presenterVideo.transcript}</p>
                </div>
              )}

              {/* Auto-play Countdown */}
              {autoPlayCountdown > 0 && (
                <div className="glass rounded-xl p-4 border border-secondary/20 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <Zap size={20} className="text-secondary" />
                    <h3 className="font-semibold text-text-primary">Starting Video</h3>
                  </div>
                  <div className="text-3xl font-bold text-secondary mb-2">{autoPlayCountdown}</div>
                  <p className="text-sm text-text-secondary mb-3">Video will start automatically</p>
                  <button
                    onClick={handleSkip}
                    className="px-4 py-2 bg-secondary rounded-lg text-white hover:scale-105 transition-all duration-300 text-sm"
                  >
                    Start Now
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-dark-border">
            <button
              onClick={onClose}
              className="px-6 py-3 glass hover:bg-primary/20 rounded-xl font-medium transition-all duration-300"
            >
              Skip Presenter
            </button>
            <button
              onClick={onContinueToVideo}
              className="px-8 py-3 bg-gradient-to-r from-primary to-secondary hover:scale-105 rounded-xl font-semibold text-white transition-all duration-300 flex items-center space-x-2"
            >
              <Play size={18} />
              <span>Watch Video</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPresenterModal;