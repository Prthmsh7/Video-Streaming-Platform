import React, { useState, useRef } from 'react';
import { X, Upload, Video, FileText, User, Clock, Eye, Zap, Database, Globe, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { filcdnClient, generateVideoMetadata, createFilecoinDeal } from '../lib/filcdn';
import AuthModal from './AuthModal';

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoUploaded: (video: any) => void;
}

const VideoUploadModal: React.FC<VideoUploadModalProps> = ({ 
  isOpen, 
  onClose, 
  onVideoUploaded 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [channelName, setChannelName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [filecoinCID, setFilecoinCID] = useState('');
  const [dealInfo, setDealInfo] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Check authentication status when modal opens
  React.useEffect(() => {
    if (isOpen) {
      checkAuthStatus();
    }
  }, [isOpen]);

  const checkAuthStatus = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        return;
      }
      
      setIsAuthenticated(!!user);
      
      if (user) {
        // Get user profile for channel name
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username, full_name')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error('Profile fetch error:', profileError);
        }
        
        if (profile && !channelName) {
          setChannelName(profile.username || profile.full_name || 'My Channel');
        }
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      setIsAuthenticated(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setChannelName('');
    setSelectedFile(null);
    setThumbnailFile(null);
    setUploadProgress(0);
    setError('');
    setUploadStatus('');
    setFilecoinCID('');
    setDealInfo(null);
  };

  const handleClose = () => {
    if (!isUploading) {
      resetForm();
      onClose();
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }
    
    setSelectedFile(file);
    setError('');
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setThumbnailFile(file);
      setError('');
    } else {
      setError('Please select an image file for thumbnail');
    }
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.onerror = () => {
        resolve(0); // Default duration if can't be determined
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim() || !channelName.trim()) {
      setError('Please fill in all required fields and select a video file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setError('');

    try {
      // Check authentication before upload
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError('Authentication required. Please sign in to upload videos.');
        setShowAuthModal(true);
        return;
      }

      setUploadStatus('Preparing video for upload...');
      setUploadProgress(20);

      // Get video duration
      const duration = await getVideoDuration(selectedFile);
      const formattedDuration = formatDuration(duration);

      const isFileCDNEnabled = filcdnClient.isEnabled();
      
      if (isFileCDNEnabled) {
        setUploadStatus('Uploading to FilCDN (Filecoin network)...');
      } else {
        setUploadStatus('Processing video (Demo mode - FilCDN disabled)...');
      }
      setUploadProgress(30);

      // Generate metadata for Filecoin storage
      const videoMetadata = generateVideoMetadata(selectedFile, duration);

      // Upload video to FilCDN (or simulate if disabled)
      const videoUploadResult = await filcdnClient.uploadFile(selectedFile, {
        filename: `${Date.now()}-${selectedFile.name}`,
        metadata: {
          ...videoMetadata,
          title: title.trim(),
          channel: channelName.trim(),
          uploader: user.id,
        }
      });

      setFilecoinCID(videoUploadResult.cid);
      
      if (isFileCDNEnabled) {
        setUploadStatus('Video uploaded to Filecoin! Creating storage deal...');
      } else {
        setUploadStatus('Video processed! Creating demo storage deal...');
      }
      setUploadProgress(60);

      // Create Filecoin deal (simulated for demo)
      const deal = await createFilecoinDeal(videoUploadResult.cid, videoMetadata);
      setDealInfo(deal);

      // Upload thumbnail to FilCDN if provided
      let thumbnailCID = null;
      let thumbnailUrl = null;
      
      if (thumbnailFile) {
        if (isFileCDNEnabled) {
          setUploadStatus('Uploading thumbnail to FilCDN...');
        } else {
          setUploadStatus('Processing thumbnail...');
        }
        
        const thumbnailUploadResult = await filcdnClient.uploadFile(thumbnailFile, {
          filename: `thumbnail-${Date.now()}-${thumbnailFile.name}`,
          metadata: {
            type: 'thumbnail',
            parentCID: videoUploadResult.cid,
          }
        });
        thumbnailCID = thumbnailUploadResult.cid;
        thumbnailUrl = filcdnClient.getThumbnailUrl(thumbnailCID);
      }

      setUploadStatus('Saving to database...');
      setUploadProgress(80);

      // Create video record with FilCDN/Filecoin data
      const videoData = {
        title: title.trim(),
        description: description.trim() || null,
        channel_name: channelName.trim(),
        thumbnail_url: thumbnailUrl || 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=2',
        video_url: videoUploadResult.url,
        duration: formattedDuration,
        user_id: user.id,
        views: 0,
        likes: 0,
        dislikes: 0,
        // Store Filecoin-specific data
        filecoin_cid: videoUploadResult.cid,
        filecoin_deal_id: deal.dealId,
        storage_provider: deal.provider,
        file_size: videoUploadResult.size,
        storage_status: deal.status,
      };

      // Insert video record into database
      const { data: insertedVideo, error: insertError } = await supabase
        .from('videos')
        .insert(videoData)
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error(`Database error: ${insertError.message}`);
      }

      if (isFileCDNEnabled) {
        setUploadStatus('Upload complete! Video stored on Filecoin network.');
      } else {
        setUploadStatus('Upload complete! (Demo mode - enable FilCDN for real Filecoin storage)');
      }
      setUploadProgress(100);

      // Create video object for the UI
      const newVideo = {
        id: insertedVideo.id,
        title: insertedVideo.title,
        channel: insertedVideo.channel_name,
        views: '0 views',
        timestamp: 'Just now',
        duration: insertedVideo.duration,
        thumbnail: insertedVideo.thumbnail_url,
        videoUrl: insertedVideo.video_url,
        channelAvatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
        description: insertedVideo.description || '',
        likes: '0',
        subscribers: '1K',
        filecoinCID: videoUploadResult.cid,
        dealInfo: deal,
      };

      onVideoUploaded(newVideo);
      
      // Keep modal open briefly to show success message
      setTimeout(() => {
        resetForm();
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Upload error:', error);
      let errorMessage = 'Upload failed';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      setError(errorMessage);
      setUploadStatus('');
    } finally {
      setIsUploading(false);
      if (!error) {
        setUploadProgress(0);
      }
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAuthModal(false);
    checkAuthStatus(); // Refresh auth status and get user info
  };

  if (!isOpen) return null;

  const isFileCDNEnabled = filcdnClient.isEnabled();

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="glass rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-primary/20">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Database size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-primary">
                  Upload to {isFileCDNEnabled ? 'Filecoin' : 'Platform (Demo)'}
                </h2>
                <p className="text-sm text-text-secondary">
                  {isFileCDNEnabled 
                    ? 'Decentralized video storage via FilCDN' 
                    : 'Demo mode - Enable FilCDN for Filecoin storage'
                  }
                </p>
              </div>
            </div>
            <button 
              onClick={handleClose}
              disabled={isUploading}
              className="p-2 hover:bg-primary/20 rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              <X size={20} className="text-text-secondary" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* FilCDN Status Banner */}
            <div className={`p-4 bg-gradient-to-r ${
              isFileCDNEnabled 
                ? 'from-primary/10 to-secondary/10 border-primary/20' 
                : 'from-yellow-500/10 to-orange-500/10 border-yellow-500/20'
            } border rounded-xl`}>
              <div className="flex items-center space-x-3 mb-2">
                {isFileCDNEnabled ? (
                  <Globe size={20} className="text-primary" />
                ) : (
                  <AlertTriangle size={20} className="text-yellow-500" />
                )}
                <h3 className="font-semibold text-text-primary">
                  {isFileCDNEnabled ? 'Powered by Filecoin Network' : 'Demo Mode Active'}
                </h3>
              </div>
              <p className="text-sm text-text-secondary">
                {isFileCDNEnabled ? (
                  'Your videos are stored on the decentralized Filecoin network, ensuring permanent, censorship-resistant storage with cryptographic proof of storage.'
                ) : (
                  'FilCDN is currently disabled. Videos will be processed locally for demo purposes. To enable real Filecoin storage, configure your FilCDN credentials in the environment variables.'
                )}
              </p>
              {filecoinCID && (
                <div className="mt-3 p-2 bg-dark-surface rounded-lg">
                  <p className="text-xs text-text-muted">
                    {isFileCDNEnabled ? 'Filecoin CID:' : 'Demo CID:'}
                  </p>
                  <p className="text-sm font-mono text-secondary break-all">{filecoinCID}</p>
                </div>
              )}
            </div>

            {/* Authentication Notice */}
            {!isAuthenticated && (
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary font-semibold">Sign in required</p>
                    <p className="text-text-secondary text-sm">You need to be signed in to upload videos</p>
                  </div>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="px-4 py-2 bg-primary rounded-lg text-white font-medium hover:scale-105 transition-all duration-300"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Upload Status */}
            {uploadStatus && (
              <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Zap size={16} className="text-secondary animate-pulse" />
                  <p className="text-secondary text-sm font-medium">{uploadStatus}</p>
                </div>
                {dealInfo && (
                  <div className="mt-2 text-xs text-text-muted">
                    Deal ID: {dealInfo.dealId} | Provider: {dealInfo.provider} | Price: {dealInfo.price}
                  </div>
                )}
              </div>
            )}

            {/* File Upload Area */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-text-primary">
                Video File *
              </label>
              
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  dragActive 
                    ? 'border-primary bg-primary/10' 
                    : selectedFile 
                      ? 'border-secondary bg-secondary/10' 
                      : 'border-dark-border hover:border-primary/50 hover:bg-primary/5'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center mx-auto">
                      <Video size={32} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">{selectedFile.name}</p>
                      <p className="text-sm text-text-secondary">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        {isFileCDNEnabled ? 'Ready for Filecoin storage' : 'Ready for demo processing'}
                      </p>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-primary hover:text-primary-light font-medium transition-colors"
                    >
                      Choose different file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-dark-surface rounded-xl flex items-center justify-center mx-auto">
                      <Upload size={32} className="text-text-muted" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-text-primary mb-2">
                        Drop your video here
                      </p>
                      <p className="text-text-secondary mb-4">
                        {isFileCDNEnabled ? 'Upload to decentralized Filecoin storage' : 'Process for demo platform'}
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 bg-primary rounded-xl text-white font-medium hover:scale-105 transition-all duration-300"
                      >
                        Select Video
                      </button>
                    </div>
                    <p className="text-xs text-text-muted">
                      Supported formats: MP4, WebM, AVI, MOV
                      {isFileCDNEnabled && ' • Stored permanently on Filecoin'}
                    </p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>

            {/* Video Details Form */}
            <div className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-text-primary">
                  <FileText size={16} />
                  <span>Title *</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter video title..."
                  className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary placeholder-text-muted transition-all duration-300"
                  maxLength={100}
                />
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Make it catchy and descriptive</span>
                  <span className="text-text-muted">{title.length}/100</span>
                </div>
              </div>

              {/* Channel Name */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-text-primary">
                  <User size={16} />
                  <span>Channel Name *</span>
                </label>
                <input
                  type="text"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="Enter your channel name..."
                  className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary placeholder-text-muted transition-all duration-300"
                  maxLength={50}
                />
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Your brand or channel identity</span>
                  <span className="text-text-muted">{channelName.length}/50</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-text-primary">
                  <FileText size={16} />
                  <span>Description</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your video content, what viewers can expect..."
                  rows={4}
                  className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary placeholder-text-muted transition-all duration-300 resize-none"
                  maxLength={500}
                />
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Optional but recommended for better discovery</span>
                  <span className="text-text-muted">{description.length}/500</span>
                </div>
              </div>

              {/* Thumbnail Upload */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-text-primary">
                  <Eye size={16} />
                  <span>Custom Thumbnail</span>
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="px-4 py-2 glass border border-dark-border rounded-lg hover:border-primary/50 transition-all duration-300 text-sm"
                  >
                    {thumbnailFile ? 'Change Thumbnail' : 'Upload Thumbnail'}
                  </button>
                  {thumbnailFile && (
                    <div className="flex items-center space-x-2 text-sm text-text-secondary">
                      <span>✓</span>
                      <span>{thumbnailFile.name}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-text-muted">
                  Optional: Upload a custom thumbnail
                  {isFileCDNEnabled && ' (also stored on Filecoin)'}
                </p>
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">
                    {isFileCDNEnabled ? 'Uploading to Filecoin...' : 'Processing video...'}
                  </span>
                  <span className="text-primary font-medium">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-dark-border rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-dark-border">
              <button
                onClick={handleClose}
                disabled={isUploading}
                className="px-6 py-3 glass hover:bg-primary/20 rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || !title.trim() || !channelName.trim() || isUploading || !isAuthenticated}
                className="px-8 py-3 bg-gradient-to-r from-primary to-secondary hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 rounded-xl font-semibold text-white transition-all duration-300 flex items-center space-x-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{isFileCDNEnabled ? 'Uploading to Filecoin...' : 'Processing...'}</span>
                  </>
                ) : (
                  <>
                    <Database size={18} />
                    <span>{isFileCDNEnabled ? 'Upload to Filecoin' : 'Upload Video'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default VideoUploadModal;