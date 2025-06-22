import React, { useState } from 'react';
import VideoPlayer from './components/VideoPlayer';
import { Video } from './types/Video';

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

  return (
    <div className="min-h-screen bg-dark-bg text-text-primary">
      {/* Simple Header with Just Sillycon Branding */}
      <header className="glass border-b border-dark-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Sillycon
                </h1>
                <p className="text-sm text-text-muted font-medium text-center">Next-Gen Platform</p>
              </div>
            </div>
          </div>
        </div>
      </header>

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