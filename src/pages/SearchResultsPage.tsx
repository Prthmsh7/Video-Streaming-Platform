import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Video } from '../types/Video';
import { Search, Database } from 'lucide-react';

const SearchResultsPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const q = searchParams.get('q') || '';
    const navigate = useNavigate();

    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                // In a real app with Algolia/Typesense, this would be better.
                // For basic Firestore, we'll fetch all and filter client side 
                // OR use a simple title match if we stored keywords.
                // For this demo, since we are using local state for videos in App.tsx (mostly),
                // we might not find much in Firestore unless we uploaded.
                // BUT the prompt implies we should search "users similar or exact".

                // Let's implement searching the 'videos' collection in Firestore.
                // Firestore doesn't support full text search natively.
                // We will do a basic startAt/endAt query on title if possible, or simple client filtering of a limited set.

                const videosRef = collection(db, 'videos');
                // Get generic list (limit 20)
                const querySnapshot = await getDocs(videosRef);
                const results: Video[] = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    // Client-side simple match
                    if (data.title.toLowerCase().includes(q.toLowerCase()) ||
                        data.channel_name.toLowerCase().includes(q.toLowerCase())) {
                        results.push({
                            id: doc.id,
                            title: data.title,
                            channel: data.channel_name,
                            views: '0 views', // Mock
                            timestamp: 'Just now',
                            duration: data.duration,
                            thumbnail: data.thumbnail_url,
                            videoUrl: data.video_url,
                            channelAvatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2', // Mock
                            description: data.description,
                            likes: '0',
                            subscribers: '0'
                        } as Video);
                    }
                });

                setVideos(results);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setLoading(false);
            }
        };

        if (q) {
            fetchResults();
        }
    }, [q]);

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <h2 className="text-xl font-bold mb-6 text-text-primary">Search Results for "{q}"</h2>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {videos.map(video => (
                        <div
                            key={video.id}
                            onClick={() => navigate(`/watch/${video.id}`)}
                            className="flex gap-4 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-all"
                        >
                            <div className="relative w-64 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                                    {video.duration}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-text-primary">{video.title}</h3>
                                <p className="text-sm text-text-secondary mt-1">{video.channel}</p>
                                <p className="text-xs text-text-muted mt-2 line-clamp-2">{video.description}</p>
                            </div>
                        </div>
                    ))}

                    {videos.length === 0 && (
                        <div className="text-center py-12">
                            <Search size={48} className="mx-auto mb-4 text-text-muted opacity-50" />
                            <p className="text-text-secondary">No results found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchResultsPage;
