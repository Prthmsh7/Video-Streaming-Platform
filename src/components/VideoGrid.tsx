import React from 'react';
import VideoCard from './VideoCard';
import { Video } from '../types/Video';

interface VideoGridProps {
  onVideoSelect: (video: Video) => void;
}

const VideoGrid: React.FC<VideoGridProps> = ({ onVideoSelect }) => {
  const videos: Video[] = [
    {
      id: '1',
      title: 'Building a Modern React Application with TypeScript',
      channel: 'Tech Tutorials',
      views: '1.2M views',
      timestamp: '2 days ago',
      duration: '15:42',
      thumbnail: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=640&h=360&dpr=2',
      channelAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
      description: 'Learn how to build a modern React application using TypeScript, including best practices and advanced patterns.',
      likes: '45K',
      subscribers: '892K'
    },
    {
      id: '2',
      title: 'Amazing Nature Documentary: Wildlife in 4K',
      channel: 'Nature World',
      views: '3.5M views',
      timestamp: '1 week ago',
      duration: '28:15',
      thumbnail: 'https://images.pexels.com/photos/33109/fall-autumn-red-season.jpg?auto=compress&cs=tinysrgb&w=640&h=360&dpr=2',
      channelAvatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
      description: 'Explore the breathtaking beauty of wildlife captured in stunning 4K resolution.',
      likes: '128K',
      subscribers: '2.1M'
    },
    {
      id: '3',
      title: 'Cooking Masterclass: Italian Pasta from Scratch',
      channel: 'Chef\'s Kitchen',
      views: '890K views',
      timestamp: '3 days ago',
      duration: '22:30',
      thumbnail: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=640&h=360&dpr=2',
      channelAvatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
      description: 'Learn to make authentic Italian pasta from scratch with traditional techniques.',
      likes: '32K',
      subscribers: '456K'
    },
    {
      id: '4',
      title: 'Epic Gaming Montage: Best Moments 2024',
      channel: 'Gaming Central',
      views: '2.1M views',
      timestamp: '5 days ago',
      duration: '12:18',
      thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=640&h=360&dpr=2',
      channelAvatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
      description: 'The most epic gaming moments compiled into one amazing montage.',
      likes: '87K',
      subscribers: '1.3M'
    },
    {
      id: '5',
      title: 'Relaxing Music for Study and Work - 2 Hours',
      channel: 'Peaceful Sounds',
      views: '5.2M views',
      timestamp: '2 weeks ago',
      duration: '2:00:00',
      thumbnail: 'https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg?auto=compress&cs=tinysrgb&w=640&h=360&dpr=2',
      channelAvatar: 'https://images.pexels.com/photos/598745/pexels-photo-598745.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
      description: 'Perfect background music for studying, working, or relaxing.',
      likes: '156K',
      subscribers: '3.4M'
    },
    {
      id: '6',
      title: 'Travel Vlog: Exploring Tokyo\'s Hidden Gems',
      channel: 'Wanderlust Adventures',
      views: '1.8M views',
      timestamp: '1 week ago',
      duration: '18:45',
      thumbnail: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=640&h=360&dpr=2',
      channelAvatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
      description: 'Join us as we discover the hidden gems of Tokyo that most tourists never see.',
      likes: '72K',
      subscribers: '987K'
    },
    {
      id: '7',
      title: 'Fitness Challenge: 30-Day Transformation',
      channel: 'FitLife',
      views: '967K views',
      timestamp: '4 days ago',
      duration: '16:22',
      thumbnail: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=640&h=360&dpr=2',
      channelAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
      description: 'Follow along with our 30-day fitness transformation challenge.',
      likes: '41K',
      subscribers: '654K'
    },
    {
      id: '8',
      title: 'DIY Home Decor: Budget-Friendly Ideas',
      channel: 'Creative Home',
      views: '743K views',
      timestamp: '6 days ago',
      duration: '14:33',
      thumbnail: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=640&h=360&dpr=2',
      channelAvatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
      description: 'Transform your home with these budget-friendly DIY decor ideas.',
      likes: '28K',
      subscribers: '432K'
    }
  ];

  return (
    <div className="pt-6 px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map((video) => (
          <VideoCard 
            key={video.id} 
            video={video} 
            onClick={() => onVideoSelect(video)}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoGrid;