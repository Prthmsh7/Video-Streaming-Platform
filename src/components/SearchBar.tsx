import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchBar: React.FC = () => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto px-4">
            <div className="relative group">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search videos, channels..."
                    className="w-full bg-dark-surface border border-dark-border rounded-full py-2 pl-10 pr-4 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-text-primary placeholder-text-muted"
                />
                <Search
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors duration-300"
                />
                <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-dark-border p-1.5 rounded-full hover:bg-primary/20 hover:text-primary transition-all duration-300"
                >
                    <Search size={14} />
                </button>
            </div>
        </form>
    );
};

export default SearchBar;
