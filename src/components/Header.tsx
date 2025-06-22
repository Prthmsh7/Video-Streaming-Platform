import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Mic, 
  VideoIcon, 
  Bell, 
  User,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onLogoClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-dark-bg border-b border-dark-secondary z-50 h-14">
      <div className="flex items-center justify-between px-4 h-full">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={onMenuClick}
            className="p-2 hover:bg-dark-hover rounded-full transition-colors"
          >
            <Menu size={20} />
          </button>
          
          <div 
            className="flex items-center space-x-1 cursor-pointer"
            onClick={onLogoClick}
          >
            <div className="bg-youtube-red p-1 rounded">
              <VideoIcon size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold">StreamTube</span>
          </div>
        </div>

        {/* Center section - Search */}
        <div className="flex items-center flex-1 max-w-2xl mx-8">
          <div className="flex items-center w-full">
            <div className="flex items-center flex-1 bg-dark-secondary border border-dark-hover rounded-l-full">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent px-4 py-2 flex-1 outline-none text-white placeholder-gray-400"
              />
            </div>
            <button className="bg-dark-hover border border-dark-hover border-l-0 px-6 py-2 rounded-r-full hover:bg-gray-600 transition-colors">
              <Search size={20} />
            </button>
          </div>
          
          <button className="ml-4 p-2 hover:bg-dark-hover rounded-full transition-colors">
            <Mic size={20} />
          </button>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-dark-hover rounded-full transition-colors btn-hover">
            <VideoIcon size={20} />
          </button>
          
          <button className="p-2 hover:bg-dark-hover rounded-full transition-colors btn-hover relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-youtube-red text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-1 hover:bg-dark-hover rounded-full transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User size={16} />
              </div>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 top-12 bg-dark-secondary border border-dark-hover rounded-lg shadow-lg w-64 py-2">
                <div className="px-4 py-3 border-b border-dark-hover">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-medium">John Doe</p>
                      <p className="text-sm text-gray-400">john.doe@example.com</p>
                    </div>
                  </div>
                </div>
                
                <div className="py-2">
                  <button className="flex items-center space-x-3 px-4 py-2 hover:bg-dark-hover w-full text-left">
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                  <button className="flex items-center space-x-3 px-4 py-2 hover:bg-dark-hover w-full text-left">
                    <HelpCircle size={16} />
                    <span>Help</span>
                  </button>
                  <hr className="my-2 border-dark-hover" />
                  <button className="flex items-center space-x-3 px-4 py-2 hover:bg-dark-hover w-full text-left">
                    <LogOut size={16} />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;