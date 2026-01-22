import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import WatchPage from './pages/WatchPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ChannelPage from './pages/ChannelPage';
import StudioPage from './pages/StudioPage';
import SearchBar from './components/SearchBar';
import AuthModal from './components/AuthModal';
import { Video } from './types/Video';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { User, LogOut, Upload, LayoutDashboard } from 'lucide-react';
import VideoUploadModal from './components/VideoUploadModal';

function App() {
  // Initial video queue with sample videos
  const [videoQueue, setVideoQueue] = useState<Video[]>([
    {
      id: '1',
      title: 'Building a Modern React Application with TypeScript',
      channel: 'Tech Tutorials',
      views: '1.2M views',
      timestamp: '2 days ago',
      duration: '15:42',
      thumbnail: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=2',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      channelAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
      description: 'Learn how to build a modern React application using TypeScript, including best practices and advanced patterns. In this comprehensive tutorial, we\'ll cover component architecture, state management, type safety, and performance optimization techniques that will help you build scalable and maintainable applications.',
      likes: '45K',
      subscribers: '892K'
    },
    {
      id: '2',
      title: 'Advanced React Patterns You Should Know',
      channel: 'Code Academy',
      views: '856K views',
      timestamp: '1 day ago',
      duration: '12:34',
      thumbnail: 'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=2',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      channelAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
      description: 'Dive deep into advanced React patterns including render props, higher-order components, compound components, and custom hooks. These patterns will help you write more reusable and maintainable React code.',
      likes: '32K',
      subscribers: '654K'
    },
    {
      id: '3',
      title: 'Beautiful Sunset Timelapse',
      channel: 'Nature Shots',
      views: '2.3M views',
      timestamp: '3 days ago',
      duration: '8:15',
      thumbnail: 'https://images.pexels.com/photos/1431822/pexels-photo-1431822.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=2',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      channelAvatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
      description: 'Experience the breathtaking beauty of nature with this stunning sunset timelapse. Shot over 3 hours and compressed into 8 minutes of pure visual poetry.',
      likes: '89K',
      subscribers: '1.2M'
    }
  ]);

  const [isLoaded, setIsLoaded] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  // Page load animation
  useEffect(() => {
    setIsLoaded(true);
    checkAuthStatus();
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const checkAuthStatus = async () => {
    setUser(auth.currentUser);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    navigate('/');
  };

  const handleVideoUpload = (uploadedVideo: Video) => {
    setVideoQueue(prevQueue => [...prevQueue, uploadedVideo]);
  };

  return (
    <div className={`min-h-screen bg-dark-bg text-text-primary transition-all duration-1000 ${isLoaded ? 'fade-in' : 'opacity-0'}`}>
      {/* Header */}
      <header className="glass border-b border-dark-border sticky top-0 z-50 slide-in-left">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3 flex-shrink-0">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center pulse-glow morph-shape">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <h1
                className="text-2xl font-bold text-primary cursor-pointer"
                onClick={() => navigate('/')}
              >
                WeTube
              </h1>
            </div>

            {/* Search Bar */}
            <SearchBar />

            {/* Auth Section */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              {user ? (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="p-2 hover:bg-primary/20 rounded-lg transition-all duration-300 text-primary"
                    title="Upload Video"
                  >
                    <Upload size={20} />
                  </button>
                  <div
                    className="flex items-center space-x-2 text-text-secondary cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/channel/${user.uid}`)}
                  >
                    <User size={18} />
                    <span className="text-sm hidden md:inline">{user.displayName || user.email}</span>
                  </div>
                  <button
                    onClick={() => navigate('/studio')}
                    className="p-2 hover:bg-primary/20 rounded-lg transition-all duration-300 text-primary"
                    title="Creator Studio"
                  >
                    <LayoutDashboard size={20} />
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-4 py-2 glass hover:bg-primary/20 rounded-lg transition-all duration-300 text-sm"
                  >
                    <LogOut size={16} />
                    <span className="hidden md:inline">Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary rounded-lg text-white font-medium hover:scale-105 transition-all duration-300 text-sm"
                >
                  <User size={16} />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage videos={videoQueue} />} />
          <Route
            path="/watch/:id"
            element={
              <WatchPage
                videos={videoQueue}
                onVideoUpload={handleVideoUpload}
              />
            }
          />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/channel/:id" element={<ChannelPage />} />
          <Route path="/studio" element={<StudioPage />} />
        </Routes>
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => {
          setShowAuthModal(false);
          // Optional: navigate to profile
        }}
      />

      {/* Upload Modal */}
      <VideoUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onVideoUploaded={(video) => {
          handleVideoUpload(video);
          // Optionally navigate to the video
        }}
      />
    </div>
  );
}

export default App;