import React, { useState, useEffect } from 'react';
import { X, User, Save } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onProfileUpdate: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, userId, onProfileUpdate }) => {
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && userId) {
            fetchProfile();
        }
    }, [isOpen, userId]);

    const fetchProfile = async () => {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setFullName(data.full_name || '');
                setUsername(data.username || '');
                setAvatarUrl(data.avatar_url || '');
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (auth.currentUser) {
                // Update Auth Profile
                await updateProfile(auth.currentUser, {
                    displayName: fullName.trim(),
                    photoURL: avatarUrl.trim()
                });

                // Update Firestore Profile
                await updateDoc(doc(db, 'users', userId), {
                    full_name: fullName.trim(),
                    username: username.trim(), // Note: changing username might require uniqueness check in real app
                    avatar_url: avatarUrl.trim()
                });

                onProfileUpdate();
                onClose();
            }
        } catch (err: any) {
            console.error("Error updating profile:", err);
            setError('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass rounded-2xl w-full max-w-md border border-primary/20">
                <div className="flex items-center justify-between p-6 border-b border-dark-border">
                    <h2 className="text-xl font-bold text-text-primary">Edit Profile</h2>
                    <button onClick={onClose} className="p-2 hover:bg-primary/20 rounded-lg transition-all">
                        <X size={20} className="text-text-secondary" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-primary">Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl focus:border-primary focus:outline-none text-text-primary"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-primary">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl focus:border-primary focus:outline-none text-text-primary"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-primary">Avatar URL</label>
                        <input
                            type="text"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl focus:border-primary focus:outline-none text-text-primary"
                            placeholder="https://..."
                        />
                        <p className="text-xs text-text-muted">Enter a direct link to an image</p>
                    </div>

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-text-primary hover:bg-white/5 rounded-lg">Cancel</button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-primary-dark"
                        >
                            {isLoading ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
