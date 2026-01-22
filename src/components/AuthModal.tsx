import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setUsername('');
    setError('');
    setShowPassword(false);
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Sign in
        await signInWithEmailAndPassword(auth, email.trim(), password);
        onAuthSuccess();
        handleClose();
      } else {
        // Sign up
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;

        // Update profile
        await updateProfile(user, {
          displayName: fullName.trim()
        });

        // Create profile in Firestore
        try {
          await setDoc(doc(db, 'users', user.uid), {
            username: username.trim(),
            full_name: fullName.trim(),
            email: email.trim(),
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`, // Generate default avatar
            subscribers_count: 0,
            created_at: new Date().toISOString()
          });
        } catch (profileError) {
          console.error("Profile creation in Firestore failed:", profileError);
          // We don't throw here to allow the auth success flow to complete
          // The user exists in Auth, just missing Firestore profile (can be created later or handled graciously)
        }

        onAuthSuccess();
        handleClose();
      }
    } catch (error: any) {
      console.error('Auth error:', error);

      // Check if user was actually created/signed in despite the error (partial success)
      if (auth.currentUser) {
        console.log("User created but profile setup might have failed. Closing modal.");
        onAuthSuccess();
        handleClose();
        return;
      }

      let errorMessage = 'Authentication failed';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid password';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'User not found';
      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl w-full max-w-md border border-primary/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <h2 className="text-xl font-bold text-text-primary">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-primary/20 rounded-lg transition-all duration-300 disabled:opacity-50"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-text-primary">
                    <User size={16} />
                    <span>Full Name</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary placeholder-text-muted transition-all duration-300"
                    required={!isLogin}
                  />
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-text-primary">
                    <User size={16} />
                    <span>Username</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="Enter username"
                    className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary placeholder-text-muted transition-all duration-300"
                    required={!isLogin}
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-text-primary">
                <Mail size={16} />
                <span>Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary placeholder-text-muted transition-all duration-300"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-text-primary">
                <Lock size={16} />
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 bg-dark-surface border border-dark-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary placeholder-text-muted transition-all duration-300"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {!isLogin && (
                <p className="text-xs text-text-muted">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                </>
              ) : (
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          {/* Toggle Auth Mode */}
          <div className="mt-6 text-center">
            <p className="text-text-secondary text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="ml-2 text-primary hover:text-primary-light font-medium transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;