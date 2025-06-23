import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import VideoPlayer from './components/VideoPlayer';
import AuthModal from './components/AuthModal';
import SetupCheck from './components/SetupCheck';
import { Video } from './types/Video';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';

function App() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [setupComplete, setSetupComplete] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  const { user, loading: authLoading, signOut } = useAuth();

  // Check if setup is complete
  useEffect(() => {
    const checkSetup = async () => {
      try {
        const hasEnvVars = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
        if (!hasEnvVars) {
          setSetupError('Environment variables not configured');
          setSetupComplete(false);
          setLoading(false);
          return;
        }

        // Test basic connection and schema
        const { error } = await supabase.from('videos').select('count').limit(1);
        if (error) {
          setSetupError(`Database error: ${error.message}`);
          setSetupComplete(false);
        } else {
          setSetupComplete(true);
          setSetupError(null);
        }
      } catch (error: any) {
        console.error('Setup check failed:', error);
        setSetupError(`Setup check failed: ${error.message}`);
        setSetupComplete(false);
      } finally {
        setLoading(false);
      }
    };

    checkSetup();
  }, []);

  // Load videos from Supabase
  const loadVideos = async () => {
    if (!setupComplete) return;

    try {
      // First try the complex query with profile join
      let { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url,
            subscribers_count
          )
        `)
        .order('created_at', { ascending: false });

      // If the profile join fails, try without it
      if (error && error.message.includes('relationship')) {
        console.warn('Profile relationship not found, loading videos without profile data');
        const { data: simpleData, error: simpleError } = await supabase
          .from('videos')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (simpleError) throw simpleError;
        data = simpleData;
      } else if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const formattedVideos: Video[] = data.map((video: any) => ({
          id: video.id,
          title: video.title,
          channel: video.channel_name,
          views: `${video.views.toLocaleString()} views`,
          timestamp: new Date(video.created_at).toLocaleDateString(),
          duration: video.duration,
          thumbnail: video.thumbnail_url || 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=2',
          videoUrl: video.video_url,
          channelAvatar: video.profiles?.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
          description: video.description || 'No description available.',
          likes: video.likes.toString(),
          subscribers: `${video.profiles?.subscribers_count || 0}K`
        }));

        setVideos(formattedVideos);
      } else {
        // No videos in database, show sample data
        setVideos([
          {
            id: 'sample-1',
            title: 'Welcome to Sillycon - Your Video Platform',
            channel: 'Sillycon Official',
            views: '1.2K views',
            timestamp: 'Just now',
            duration: '2:30',
            thumbnail: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=2',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            channelAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
            description: 'Welcome to Sillycon! This is a sample video to get you started. Upload your own videos to see them here.',
            likes: '42',
            subscribers: '1K'
          }
        ]);
      }
    } catch (error: any) {
      console.error('Error loading videos:', error);
      // Show sample data as fallback
      setVideos([
        {
          id: 'sample-1',
          title: 'Welcome to Sillycon - Your Video Platform',
          channel: 'Sillycon Official',
          views: '1.2K views',
          timestamp: 'Just now',
          duration: '2:30',
          thumbnail: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=2',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          channelAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
          description: 'Welcome to Sillycon! This is a sample video to get you started. Upload your own videos to see them here.',
          likes: '42',
          subscribers: '1K'
        }
      ]);
    }
  };

  useEffect(() => {
    if (!authLoading && setupComplete) {
      loadVideos();
      setIsLoaded(true);
    }
  }, [authLoading, setupComplete]);

  const handleVideoUpload = () => {
    loadVideos(); // Reload videos after upload
  };

  const handleNextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const handleVideoSelect = (videoIndex: number) => {
    setCurrentVideoIndex(videoIndex);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Show setup check if not complete
  if (!loading && !setupComplete) {
    return <SetupCheck />;
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 pulse-glow">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <p className="text-text-secondary">Loading...</p>
          {setupError && (
            <p className="text-red-400 text-sm mt-2">{setupError}</p>
          )}
        </div>
      </div>
    );
  }

  const currentVideo = videos[currentVideoIndex];
  const upNextVideos = videos.slice(currentVideoIndex + 1);

  return (
    <div className={`min-h-screen bg-dark-bg text-text-primary transition-all duration-1000 ${isLoaded ? 'fade-in' : 'opacity-0'}`}>
      {/* Header */}
      <header className="glass border-b border-dark-border sticky top-0 z-50 slide-in-left">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center pulse-glow">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <h1 className="text-2xl font-bold text-primary">Sillycon</h1>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.user_metadata?.avatar_url || 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2'}
                      alt="Profile"
                      className="w-8 h-8 rounded-full ring-2 ring-primary/30"
                    />
                    <span className="text-text-primary font-medium">
                      {user.user_metadata?.username || user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 glass hover:bg-primary/20 rounded-xl text-text-primary transition-all duration-300"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-primary rounded-xl text-white font-medium hover:scale-105 transition-all duration-300"
                >
                  <User size={18} />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Always show if we have videos */}
      {currentVideo && (
        <VideoPlayer 
          video={currentVideo}
          upNextVideos={upNextVideos}
          onVideoUpload={handleVideoUpload}
          onNextVideo={handleNextVideo}
          onVideoSelect={handleVideoSelect}
          currentVideoIndex={currentVideoIndex}
        />
      )}

      {/* Show message if no videos and user is signed in */}
      {!currentVideo && user && setupComplete && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <User size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">Welcome to Sillycon!</h2>
            <p className="text-text-secondary mb-6">
              You're signed in and ready to go. Upload your first video to get started!
            </p>
            <button
              onClick={() => setShowAuthModal(false)}
              className="px-8 py-3 bg-secondary rounded-xl text-white font-semibold hover:scale-105 transition-all duration-300"
            >
              Start Exploring
            </button>
          </div>
        </div>
      )}

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}

export default App;