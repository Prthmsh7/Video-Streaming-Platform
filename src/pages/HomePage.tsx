import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from '../types/Video';
import { Database } from 'lucide-react';

interface HomePageProps {
    videos: Video[];
}

const HomePage: React.FC<HomePageProps> = ({ videos }) => {
    const navigate = useNavigate();

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video) => (
                    <div
                        key={video.id}
                        onClick={() => navigate(`/watch/${video.id}`)}
                        className="group cursor-pointer"
                    >
                        <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                            <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-mono backdrop-blur-sm">
                                {video.duration}
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <img
                                src={video.channelAvatar}
                                alt={video.channel}
                                className="w-9 h-9 rounded-full object-cover"
                            />
                            <div>
                                <h3 className="font-semibold text-text-primary line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                    {video.title}
                                </h3>
                                <p className="text-text-secondary text-sm mt-1 hover:text-text-primary transition-colors">
                                    {video.channel}
                                </p>
                                <div className="text-text-muted text-xs flex items-center mt-1">
                                    <span>{video.views}</span>
                                    <span className="mx-1">•</span>
                                    <span>{video.timestamp}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {videos.length === 0 && (
                    <div className="col-span-full text-center py-20">
                        <Database size={48} className="mx-auto mb-4 text-text-muted opacity-50" />
                        <p className="text-text-secondary text-lg font-medium">No videos found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;
