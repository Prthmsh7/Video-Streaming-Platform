import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Video } from '../types/Video';
import { User, Settings, Video as VideoIcon } from 'lucide-react';
import EditProfileModal from '../components/EditProfileModal';

const ChannelPage: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // This could be userId
    const [channel, setChannel] = useState<any>(null);
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const currentUser = auth.currentUser;
    const isOwner = currentUser?.uid === id;
    const [showEditModal, setShowEditModal] = useState(false);

    const fetchChannel = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const userDoc = await getDoc(doc(db, 'users', id));
            if (userDoc.exists()) {
                setChannel(userDoc.data());
            }

            const videosRef = collection(db, 'videos');
            const q = query(videosRef, where('user_id', '==', id));
            const querySnapshot = await getDocs(q);
            const userVideos: Video[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                userVideos.push({
                    id: doc.id,
                    title: data.title,
                    channel: data.channel_name,
                    views: '0 views',
                    timestamp: 'Just now',
                    duration: data.duration,
                    thumbnail: data.thumbnail_url,
                    videoUrl: data.video_url,
                    channelAvatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2',
                    description: data.description,
                    likes: '0',
                    subscribers: '0'
                } as Video);
            });
            setVideos(userVideos);

        } catch (error) {
            console.error("Error fetching channel:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChannel();
    }, [id]);

    if (loading) return <div className="p-20 text-center">Loading channel...</div>;
    if (!channel) return <div className="p-20 text-center">Channel not found</div>;

    return (
        <div className="fade-in">
            {/* Banner */}
            <div className="h-48 md:h-64 bg-gradient-to-r from-primary/20 to-secondary/20 w-full relative">
                {isOwner && (
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="absolute bottom-4 right-4 bg-black/60 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-black/80 transition-all"
                    >
                        <Settings size={16} /> Customize Channel
                    </button>
                )}
            </div>

            {/* Channel Header */}
            <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10 mb-8">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                    <div className="w-32 h-32 rounded-full border-4 border-dark-bg bg-dark-eval-1 overflow-hidden">
                        <img
                            src={channel.avatar_url || 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'}
                            alt={channel.username}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1 text-center md:text-left mb-2">
                        <h1 className="text-3xl font-bold text-text-primary">{channel.full_name || channel.username}</h1>
                        <p className="text-text-secondary">@{channel.username} • {channel.subscribers_count || 0} subscribers</p>
                    </div>
                    <div>
                        <button className="bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-primary-dark transition-all">
                            {isOwner ? 'Manage Videos' : 'Subscribe'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="max-w-7xl mx-auto px-6 border-b border-dark-border mb-8">
                <div className="flex space-x-8">
                    <button className="py-3 border-b-2 border-primary text-text-primary font-medium">Videos</button>
                    <button className="py-3 border-b-2 border-transparent text-text-secondary hover:text-text-primary">About</button>
                </div>
            </div>

            {/* Videos Grid */}
            <div className="max-w-7xl mx-auto px-6 pb-20">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <VideoIcon size={20} /> Uploads
                </h2>
                {videos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {videos.map(video => (
                            <div key={video.id} className="group cursor-pointer">
                                <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                        {video.duration}
                                    </div>
                                </div>
                                <h3 className="font-semibold text-text-primary line-clamp-2">{video.title}</h3>
                                <p className="text-text-secondary text-sm">{video.views} • {video.timestamp}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-text-muted">
                        <p>No videos uploaded yet.</p>
                    </div>
                )}
            </div>

            <EditProfileModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                userId={id!}
                onProfileUpdate={() => {
                    fetchChannel();
                }}
            />
        </div>
    );
};

export default ChannelPage;
