import React, { useState, useRef } from 'react'
import { X, Upload, Video, FileText, Image } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

interface VideoUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onVideoUploaded: () => void
}

const VideoUploadModal: React.FC<VideoUploadModalProps> = ({ isOpen, onClose, onVideoUploaded }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [channelName, setChannelName] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  const videoInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file)
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''))
      }
    } else {
      setError('Please select a valid video file')
    }
  }

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setThumbnailFile(file)
    } else {
      setError('Please select a valid image file')
    }
  }

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) throw error
    return data
  }

  const getVideoDuration = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        const duration = video.duration
        const minutes = Math.floor(duration / 60)
        const seconds = Math.floor(duration % 60)
        resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`)
      }
      video.src = URL.createObjectURL(file)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !videoFile) return

    setLoading(true)
    setError('')
    setUploadProgress(0)

    try {
      // Upload video file
      const videoPath = `videos/${user.id}/${Date.now()}_${videoFile.name}`
      setUploadProgress(25)
      await uploadFile(videoFile, 'videos', videoPath)
      
      // Upload thumbnail if provided
      let thumbnailPath = null
      if (thumbnailFile) {
        thumbnailPath = `thumbnails/${user.id}/${Date.now()}_${thumbnailFile.name}`
        setUploadProgress(50)
        await uploadFile(thumbnailFile, 'thumbnails', thumbnailPath)
      }

      // Get video duration
      const duration = await getVideoDuration(videoFile)
      setUploadProgress(75)

      // Get public URLs
      const { data: videoUrl } = supabase.storage
        .from('videos')
        .getPublicUrl(videoPath)

      const thumbnailUrl = thumbnailPath 
        ? supabase.storage.from('thumbnails').getPublicUrl(thumbnailPath).data
        : null

      // Save video metadata to database
      const { error: dbError } = await supabase
        .from('videos')
        .insert({
          title,
          description,
          channel_name: channelName || user.user_metadata?.username || 'Unknown Channel',
          video_url: videoUrl.publicUrl,
          thumbnail_url: thumbnailUrl?.publicUrl,
          duration,
          user_id: user.id,
        })

      if (dbError) throw dbError

      setUploadProgress(100)
      onVideoUploaded()
      onClose()
      
      // Reset form
      setTitle('')
      setDescription('')
      setChannelName('')
      setVideoFile(null)
      setThumbnailFile(null)
      
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 border border-primary/20 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Upload className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Upload Video</h2>
          <p className="text-text-secondary">Share your content with the world</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video File Upload */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Video File *
            </label>
            <div
              onClick={() => videoInputRef.current?.click()}
              className="border-2 border-dashed border-dark-border hover:border-primary/50 rounded-xl p-8 text-center cursor-pointer transition-all duration-300"
            >
              {videoFile ? (
                <div className="flex items-center justify-center space-x-3">
                  <Video className="text-primary" size={24} />
                  <span className="text-text-primary font-medium">{videoFile.name}</span>
                </div>
              ) : (
                <div>
                  <Video className="mx-auto mb-4 text-text-muted" size={48} />
                  <p className="text-text-primary font-medium mb-2">Click to select video</p>
                  <p className="text-text-muted text-sm">MP4, WebM, or MOV files</p>
                </div>
              )}
            </div>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              className="hidden"
              required
            />
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Thumbnail (Optional)
            </label>
            <div
              onClick={() => thumbnailInputRef.current?.click()}
              className="border-2 border-dashed border-dark-border hover:border-primary/50 rounded-xl p-6 text-center cursor-pointer transition-all duration-300"
            >
              {thumbnailFile ? (
                <div className="flex items-center justify-center space-x-3">
                  <Image className="text-primary" size={20} />
                  <span className="text-text-primary">{thumbnailFile.name}</span>
                </div>
              ) : (
                <div>
                  <Image className="mx-auto mb-2 text-text-muted" size={32} />
                  <p className="text-text-primary text-sm">Click to select thumbnail</p>
                </div>
              )}
            </div>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailSelect}
              className="hidden"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary placeholder-text-muted transition-all duration-300"
              placeholder="Enter video title"
              required
            />
          </div>

          {/* Channel Name */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Channel Name
            </label>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary placeholder-text-muted transition-all duration-300"
              placeholder="Your channel name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary placeholder-text-muted transition-all duration-300 resize-none"
              placeholder="Describe your video..."
            />
          </div>

          {/* Upload Progress */}
          {loading && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">Uploading...</span>
                <span className="text-primary font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-dark-border rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 glass hover:bg-primary/20 rounded-xl font-semibold text-text-primary transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !videoFile || !title}
              className="flex-1 py-3 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-all duration-300"
            >
              {loading ? 'Uploading...' : 'Upload Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VideoUploadModal