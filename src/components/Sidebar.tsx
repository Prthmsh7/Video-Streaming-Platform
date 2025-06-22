import React from 'react';
import { 
  Home, 
  Compass, 
  PlaySquare, 
  Clock, 
  ThumbsUp, 
  Download,
  Music,
  Gamepad2,
  Newspaper,
  Trophy,
  Lightbulb,
  Shirt,
  Settings,
  Flag,
  HelpCircle,
  MessageSquare
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const mainItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: Compass, label: 'Explore' },
    { icon: PlaySquare, label: 'Subscriptions' },
  ];

  const libraryItems = [
    { icon: PlaySquare, label: 'Library' },
    { icon: Clock, label: 'History' },
    { icon: PlaySquare, label: 'Your videos' },
    { icon: Clock, label: 'Watch later' },
    { icon: ThumbsUp, label: 'Liked videos' },
    { icon: Download, label: 'Downloads' },
  ];

  const exploreItems = [
    { icon: Music, label: 'Music' },
    { icon: Gamepad2, label: 'Gaming' },
    { icon: Newspaper, label: 'News' },
    { icon: Trophy, label: 'Sports' },
    { icon: Lightbulb, label: 'Learning' },
    { icon: Shirt, label: 'Fashion & Beauty' },
  ];

  const subscriptions = [
    { name: 'Tech Channel', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=2' },
    { name: 'Music World', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=2' },
    { name: 'Gaming Hub', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=2' },
    { name: 'Cooking Master', avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=2' },
  ];

  const SidebarItem = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
    <button className={`flex items-center space-x-6 px-6 py-2 hover:bg-dark-hover rounded-lg transition-colors w-full text-left ${
      active ? 'bg-dark-hover' : ''
    }`}>
      <Icon size={20} />
      {isOpen && <span className="text-sm">{span}</span>}
    </button>
  );

  return (
    <aside className={`fixed left-0 top-14 h-[calc(100vh-3.5rem)] bg-dark-bg border-r border-dark-secondary transition-all duration-300 z-40 ${
      isOpen ? 'w-60' : 'w-16'
    } overflow-y-auto`}>
      <div className="py-3">
        {/* Main Navigation */}
        <div className="mb-3">
          {mainItems.map((item, index) => (
            <SidebarItem key={index} icon={item.icon} label={item.label} active={item.active} />
          ))}
        </div>

        {isOpen && (
          <>
            <hr className="border-dark-secondary my-3" />

            {/* Library */}
            <div className="mb-3">
              {libraryItems.map((item, index) => (
                <SidebarItem key={index} icon={item.icon} label={item.label} />
              ))}
            </div>

            <hr className="border-dark-secondary my-3" />

            {/* Subscriptions */}
            <div className="mb-3">
              <h3 className="px-6 py-2 text-sm font-medium text-gray-400 uppercase tracking-wide">
                Subscriptions
              </h3>
              {subscriptions.map((sub, index) => (
                <button key={index} className="flex items-center space-x-6 px-6 py-2 hover:bg-dark-hover rounded-lg transition-colors w-full text-left">
                  <img src={sub.avatar} alt={sub.name} className="w-6 h-6 rounded-full" />
                  <span className="text-sm truncate">{sub.name}</span>
                </button>
              ))}
            </div>

            <hr className="border-dark-secondary my-3" />

            {/* Explore */}
            <div className="mb-3">
              <h3 className="px-6 py-2 text-sm font-medium text-gray-400 uppercase tracking-wide">
                Explore
              </h3>
              {exploreItems.map((item, index) => (
                <SidebarItem key={index} icon={item.icon} label={item.label} />
              ))}
            </div>

            <hr className="border-dark-secondary my-3" />

            {/* More from StreamTube */}
            <div className="mb-3">
              <h3 className="px-6 py-2 text-sm font-medium text-gray-400 uppercase tracking-wide">
                More from StreamTube
              </h3>
              <SidebarItem icon={Settings} label="Settings" />
              <SidebarItem icon={Flag} label="Report history" />
              <SidebarItem icon={HelpCircle} label="Help" />
              <SidebarItem icon={MessageSquare} label="Send feedback" />
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;