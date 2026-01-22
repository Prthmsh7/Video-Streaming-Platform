import React, { useState, useRef } from 'react';
import { X, Upload, Video, FileText, User, Clock, Eye, Zap, Database, Globe, AlertTriangle } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
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


  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Check authentication status when modal opens
  React.useEffect(() => {
    if (isOpen) {
      checkAuthStatus();
    }
  }, [isOpen]);

  const checkAuthStatus = async () => {
    const user = auth.currentUser;
    setIsAuthenticated(!!user);

    if (user && !channelName) {
      setChannelName(user.displayName || 'My Channel');
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
      const user = auth.currentUser;
      if (!user) {
        setError('Authentication required. Please sign in to upload videos.');
        setShowAuthModal(true);
        return;
      }

      setUploadStatus('Preparing video for upload...');
      setUploadProgress(20);

      // Get video duration
      const duration = await getVideoDuration(selectedFile);
      const formattedDuration = formatDuration(duration);

      setUploadStatus('Processing video...');
      setUploadProgress(40);

      // Upload to Firebase Storage
      let videoUrl = '';
      let thumbnailUrl = 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=2';

      try {
        // Upload Video
        setUploadStatus('Uploading video to storage...');
        const videoRef = ref(storage, `videos/${user.uid}/${Date.now()}_${selectedFile.name}`);
        const videoSnapshot = await uploadBytes(videoRef, selectedFile);
        videoUrl = await getDownloadURL(videoSnapshot.ref);
        setUploadProgress(70);

        // Upload Thumbnail (if exists)
        if (thumbnailFile) {
          setUploadStatus('Uploading thumbnail...');
          const thumbRef = ref(storage, `thumbnails/${user.uid}/${Date.now()}_${thumbnailFile.name}`);
          const thumbSnapshot = await uploadBytes(thumbRef, thumbnailFile);
          thumbnailUrl = await getDownloadURL(thumbSnapshot.ref);
        }
      } catch (uploadError: any) {
        console.error("Storage upload error:", uploadError);
        // Fallback for demo purposes if storage fails (e.g. CORS or Rules issues)
        // But we should try to be real. If it fails, we throw.
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      setUploadStatus('Saving to database...');

      // Create video record
      const videoData = {
        title: title.trim(),
        description: description.trim() || null,
        channel_name: channelName.trim(),
        thumbnail_url: thumbnailUrl,
        video_url: videoUrl,
        duration: formattedDuration,
        user_id: user.uid,
        views: 0,
        likes: 0,
        dislikes: 0,
        created_at: serverTimestamp()
      };

      // Insert video record into database
      const docRef = await addDoc(collection(db, 'videos'), videoData);

      setUploadStatus('Upload complete!');
      setUploadProgress(100);

      // Create video object for the UI
      const newVideo = {
        id: docRef.id,
        title: videoData.title,
        channel: videoData.channel_name,
        views: '0 views',
        timestamp: 'Just now',
        duration: videoData.duration,
        thumbnail: videoData.thumbnail_url,
        videoUrl: videoData.video_url,
        channelAvatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
        description: videoData.description || '',
        likes: '0',
        subscribers: '1K',
        filecoinCID: null,
        dealInfo: null,
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
                  Upload to Video Platform
                </h2>
                <p className="text-sm text-text-secondary">
                  Share your content with the world
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

              </div>
            )}

            {/* File Upload Area */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-text-primary">
                Video File *
              </label>

              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${dragActive
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
                        Ready for processing
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
                        Upload to platform
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
                    Processing video...
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
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Database size={18} />
                    <span>Upload Video</span>
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