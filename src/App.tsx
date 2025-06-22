import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import VideoGrid from './components/VideoGrid';
import VideoPlayer from './components/VideoPlayer';
import { Video } from './types/Video';

function App() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
  };

  const handleBackToHome = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <Header 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onLogoClick={handleBackToHome}
      />
      
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} />
        
        <main className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'ml-60' : 'ml-16'
        }`}>
          {selectedVideo ? (
            <VideoPlayer 
              video={selectedVideo} 
              onBackToHome={handleBackToHome}
            />
          ) : (
            <VideoGrid onVideoSelect={handleVideoSelect} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;