import React from 'react';
import VideoPlayer from './components/VideoPlayer';
import { Video } from './types/Video';

function App() {
  // Sample video data
  const sampleVideo: Video = {
    id: '1',
    title: 'Building a Modern React Application with TypeScript',
    channel: 'Tech Tutorials',
    views: '1.2M views',
    timestamp: '2 days ago',
    duration: '15:42',
    thumbnail: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=2',
    channelAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
    description: 'Learn how to build a modern React application using TypeScript, including best practices and advanced patterns. In this comprehensive tutorial, we\'ll cover component architecture, state management, type safety, and performance optimization techniques that will help you build scalable and maintainable applications.',
    likes: '45K',
    subscribers: '892K'
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <VideoPlayer video={sampleVideo} />
    </div>
  );
}

export default App;