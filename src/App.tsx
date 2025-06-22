import React, { useState } from 'react';
import VideoPlayer from './components/VideoPlayer';
import { Video } from './types/Video';
import { 
  Search, 
  Bell, 
  User, 
  Menu, 
  Home, 
  Compass, 
  PlaySquare, 
  Clock, 
  ThumbsUp, 
  Bookmark,
  Settings,
  HelpCircle,
  LogOut,
  Upload,
  Mic,
  Camera
} from 'lucide-react';

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

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleVideoUpload = (uploadedVideo: Video) => {
    setVideoQueue(prevQueue => [...prevQueue, uploadedVideo]);
  };

  const handleNextVideo = () => {
    if (currentVideoIndex < videoQueue.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const handleVideoSelect = (videoIndex: number) => {
    setCurrentVideoIndex(videoIndex);
  };

  const currentVideo = videoQueue[currentVideoIndex];
  const upNextVideos = videoQueue.slice(currentVideoIndex + 1);

  const notifications = [
    { id: 1, text: 'New video from Tech Tutorials', time: '2m ago', unread: true },
    { id: 2, text: 'Your investment in "React Patterns" was successful', time: '1h ago', unread: true },
    { id: 3, text: 'Code Academy uploaded a new video', time: '3h ago', unread: false },
  ];

  const sidebarItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: Compass, label: 'Explore' },
    { icon: PlaySquare, label: 'Subscriptions' },
    { icon: Clock, label: 'Watch Later' },
    { icon: ThumbsUp, label: 'Liked Videos' },
    { icon: Bookmark, label: 'Saved' },
  ];

  return (
    <div className="min-h-screen bg-dark-bg text-text-primary">
      {/* Enhanced Header */}
      <header className="glass border-b border-dark-border sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section - Logo & Menu */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-primary/20 rounded-xl transition-all duration-300 lg:hidden"
              >
                <Menu size={24} />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Sillycon
                  </h1>
                  <p className="text-xs text-text-muted font-medium">Next-Gen Platform</p>
                </div>
              </div>
            </div>

            {/* Center Section - Search */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Search videos, channels, or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-6 py-3 bg-dark-surface border border-dark-border rounded-l-2xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary placeholder-text-muted transition-all duration-300"
                  />
                  <button className="px-6 py-3 gradient-primary rounded-r-2xl hover:scale-105 transition-all duration-300 shadow-glow">
                    <Search size={20} className="text-white" />
                  </button>
                </div>
                
                {/* Voice Search */}
                <button className="absolute right-16 top-1/2 transform -translate-y-1/2 p-2 hover:bg-primary/20 rounded-xl transition-all duration-300">
                  <Mic size={18} className="text-text-muted hover:text-primary" />
                </button>
              </div>
            </div>

            {/* Right Section - Actions & Profile */}
            <div className="flex items-center space-x-3">
              {/* Mobile Search */}
              <button className="p-3 hover:bg-primary/20 rounded-xl transition-all duration-300 md:hidden">
                <Search size={20} />
              </button>

              {/* Upload Button */}
              <button className="hidden sm:flex items-center space-x-2 px-4 py-2 gradient-secondary rounded-xl text-white font-medium hover:scale-105 transition-all duration-300 shadow-glow-teal">
                <Upload size={18} />
                <span className="hidden lg:inline">Create</span>
              </button>

              {/* Camera Button */}
              <button className="p-3 hover:bg-primary/20 rounded-xl transition-all duration-300 hidden sm:block">
                <Camera size={20} className="text-text-secondary hover:text-primary" />
              </button>

              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-3 hover:bg-primary/20 rounded-xl transition-all duration-300 relative"
                >
                  <Bell size={20} className="text-text-secondary hover:text-primary" />
                  {notifications.some(n => n.unread) && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-14 w-80 glass rounded-2xl shadow-2xl border border-primary/20 py-4 z-50">
                    <div className="px-4 py-2 border-b border-dark-border">
                      <h3 className="font-semibold text-text-primary">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-primary/10 transition-colors cursor-pointer ${
                            notification.unread ? 'bg-primary/5' : ''
                          }`}
                        >
                          <p className="text-sm text-text-primary">{notification.text}</p>
                          <p className="text-xs text-text-muted mt-1">{notification.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-t border-dark-border">
                      <button className="text-sm text-primary hover:text-primary-light font-medium">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 hover:bg-primary/20 rounded-xl transition-all duration-300"
                >
                  <img 
                    src="https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2"
                    alt="Profile"
                    className="w-8 h-8 rounded-full ring-2 ring-primary/30"
                  />
                  <span className="hidden lg:inline text-sm font-medium">John Doe</span>
                </button>

                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 top-14 w-64 glass rounded-2xl shadow-2xl border border-primary/20 py-4 z-50">
                    <div className="px-4 py-3 border-b border-dark-border">
                      <div className="flex items-center space-x-3">
                        <img 
                          src="https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2"
                          alt="Profile"
                          className="w-12 h-12 rounded-full ring-2 ring-primary/30"
                        />
                        <div>
                          <p className="font-semibold text-text-primary">John Doe</p>
                          <p className="text-sm text-text-muted">john@example.com</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <button className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-primary/10 transition-colors text-left">
                        <User size={18} className="text-text-secondary" />
                        <span className="text-sm">Your Channel</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-primary/10 transition-colors text-left">
                        <Settings size={18} className="text-text-secondary" />
                        <span className="text-sm">Settings</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-primary/10 transition-colors text-left">
                        <HelpCircle size={18} className="text-text-secondary" />
                        <span className="text-sm">Help & Support</span>
                      </button>
                    </div>
                    
                    <div className="border-t border-dark-border pt-2">
                      <button className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-accent/10 transition-colors text-left text-accent">
                        <LogOut size={18} />
                        <span className="text-sm">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Live Indicator */}
              <div className="hidden xl:flex items-center space-x-2 text-text-secondary">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="fixed left-0 top-0 h-full w-64 glass border-r border-dark-border p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Sillycon
              </h2>
            </div>
            
            <nav className="space-y-2">
              {sidebarItems.map((item, index) => (
                <button
                  key={index}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    item.active 
                      ? 'gradient-primary text-white shadow-glow' 
                      : 'hover:bg-primary/20 text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

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
    </div>
  );
}

export default App;