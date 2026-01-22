import React, { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { BarChart3, Users, PlaySquare, Settings, Save, LayoutDashboard, Film, Video } from 'lucide-react';
import { Video as VideoType } from '../types/Video';

const StudioPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'content' | 'settings'>('dashboard');
    const [user, setUser] = useState<any>(null);
    const [profileData, setProfileData] = useState({
        full_name: '',
        username: '',
        avatar_url: '',
        bio: ''
    });
    const [stats, setStats] = useState({
        totalViews: 0,
        totalLikes: 0,
        totalVideos: 0,
        subscribers: 0
    });
    const [videos, setVideos] = useState<VideoType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const currentUser = auth.currentUser;
            if (!currentUser) return;
            setUser(currentUser);

            try {
                // Fetch Profile
                const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setProfileData({
                        full_name: data.full_name || '',
                        username: data.username || '',
                        avatar_url: data.avatar_url || '',
                        bio: data.bio || ''
                    });
                    setStats(prev => ({ ...prev, subscribers: data.subscribers_count || 0 }));
                }

                // Fetch Videos
                const videosRef = collection(db, 'videos');
                const q = query(videosRef, where('user_id', '==', currentUser.uid));
                const querySnapshot = await getDocs(q);

                let views = 0;
                let likes = 0;
                const userVideos: VideoType[] = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    views += data.views || 0;
                    likes += data.likes || 0;
                    userVideos.push({
                        id: doc.id,
                        ...data
                    } as any);
                });

                setStats(prev => ({
                    ...prev,
                    totalViews: views,
                    totalLikes: likes,
                    totalVideos: userVideos.length
                }));
                setVideos(userVideos);

            } catch (error) {
                console.error("Error fetching studio data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, {
                    displayName: profileData.full_name,
                    photoURL: profileData.avatar_url
                });

                await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                    full_name: profileData.full_name,
                    username: profileData.username,
                    avatar_url: profileData.avatar_url,
                    bio: profileData.bio
                });
                alert("Profile updated successfully!");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-20 text-center">Loading Studio...</div>;

    return (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-dark-bg text-text-primary fade-in">
            {/* Sidebar */}
            <aside className="w-full md:w-64 border-r border-dark-border bg-dark-surface p-4">
                <div className="flex flex-col space-y-2">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-white/5'}`}
                    >
                        <LayoutDashboard size={20} />
                        <span className="font-medium">Dashboard</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('content')}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'content' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-white/5'}`}
                    >
                        <Film size={20} />
                        <span className="font-medium">Content</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-white/5'}`}
                    >
                        <Settings size={20} />
                        <span className="font-medium">Settings</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                {activeTab === 'dashboard' && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                        <h2 className="text-2xl font-bold">Channel Analytics</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="p-6 rounded-2xl bg-dark-card border border-dark-border card-hover">
                                <div className="flex items-center space-x-4 mb-2">
                                    <div className="p-3 bg-blue-500/20 rounded-xl text-blue-500">
                                        <BarChart3 size={24} />
                                    </div>
                                    <h3 className="text-text-secondary font-medium">Total Views</h3>
                                </div>
                                <p className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-dark-card border border-dark-border card-hover">
                                <div className="flex items-center space-x-4 mb-2">
                                    <div className="p-3 bg-green-500/20 rounded-xl text-green-500">
                                        <Users size={24} />
                                    </div>
                                    <h3 className="text-text-secondary font-medium">Subscribers</h3>
                                </div>
                                <p className="text-3xl font-bold">{stats.subscribers.toLocaleString()}</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-dark-card border border-dark-border card-hover">
                                <div className="flex items-center space-x-4 mb-2">
                                    <div className="p-3 bg-purple-500/20 rounded-xl text-purple-500">
                                        <PlaySquare size={24} />
                                    </div>
                                    <h3 className="text-text-secondary font-medium">Videos</h3>
                                </div>
                                <p className="text-3xl font-bold">{stats.totalVideos}</p>
                            </div>
                        </div>

                        {/* Recent Videos Section */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold">Latest Content</h3>
                            {videos.slice(0, 3).map(video => (
                                <div key={video.id} className="flex items-center p-4 bg-dark-card border border-dark-border rounded-xl">
                                    <div className="w-32 aspect-video rounded-lg overflow-hidden mr-4">
                                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold line-clamp-1">{video.title}</h4>
                                        <p className="text-sm text-text-secondary">{new Date((video as any).created_at?.toDate()).toLocaleDateString()}</p>
                                    </div>
                                    <div className="ml-auto flex items-center gap-6 text-sm text-text-secondary">
                                        <span>{video.views} views</span>
                                        <span>{video.likes} likes</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'content' && (
                    <div className="animate-in slide-in-from-right-4 duration-500">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Channel Content</h2>
                        </div>
                        <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-dark-surface border-b border-dark-border">
                                    <tr>
                                        <th className="p-4 font-semibold text-text-secondary">Video</th>
                                        <th className="p-4 font-semibold text-text-secondary hidden md:table-cell">Date</th>
                                        <th className="p-4 font-semibold text-text-secondary">Views</th>
                                        <th className="p-4 font-semibold text-text-secondary">Likes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dark-border">
                                    {videos.map(video => (
                                        <tr key={video.id} className="hover:bg-active/5 transition-colors">
                                            <td className="p-4">
                                                <div className="flex gap-3">
                                                    <div className="w-24 h-14 rounded-lg overflow-hidden bg-black/20 flex-shrink-0">
                                                        <img src={video.thumbnail} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex flex-col justify-center">
                                                        <p className="font-medium line-clamp-1">{video.title}</p>
                                                        <p className="text-xs text-text-muted line-clamp-1">{video.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-text-secondary hidden md:table-cell">
                                                {(video as any).created_at ? new Date((video as any).created_at.toDate()).toLocaleDateString() : 'Active'}
                                            </td>
                                            <td className="p-4 text-text-secondary">{video.views}</td>
                                            <td className="p-4 text-text-secondary">{video.likes}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {videos.length === 0 && (
                                <div className="p-10 text-center text-text-secondary">
                                    No videos uploaded yet.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="max-w-2xl animate-in slide-in-from-right-4 duration-500">
                        <h2 className="text-2xl font-bold mb-6">Channel Settings</h2>
                        <form onSubmit={handleProfileUpdate} className="space-y-6 bg-dark-card p-6 rounded-2xl border border-dark-border">
                            <div className="flex items-center gap-6 mb-6">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary">
                                    <img src={profileData.avatar_url || 'https://via.placeholder.com/150'} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-text-secondary mb-1">Avatar URL</label>
                                    <input
                                        type="text"
                                        value={profileData.avatar_url}
                                        onChange={(e) => setProfileData({ ...profileData, avatar_url: e.target.value })}
                                        className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-xl focus:border-primary focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-text-secondary mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={profileData.full_name}
                                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                        className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-xl focus:border-primary focus:outline-none text-text-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-text-secondary mb-1">Username</label>
                                    <input
                                        type="text"
                                        value={profileData.username}
                                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                        className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-xl focus:border-primary focus:outline-none text-text-primary"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-text-secondary mb-1">Bio / Description</label>
                                <textarea
                                    rows={4}
                                    value={profileData.bio}
                                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                    className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-xl focus:border-primary focus:outline-none text-text-primary resize-none"
                                    placeholder="Tell viewers about your channel..."
                                />
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all flex items-center gap-2"
                                >
                                    {isSaving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudioPage;
