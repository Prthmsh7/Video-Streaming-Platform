import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import { Video } from '../types/Video';

interface WatchPageProps {
    videos: Video[];
    onVideoUpload: (video: Video) => void;
}

const WatchPage: React.FC<WatchPageProps> = ({ videos, onVideoUpload }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [currentVideo, setCurrentVideo] = useState<Video | undefined>();
    const [upNextVideos, setUpNextVideos] = useState<Video[]>([]);

    useEffect(() => {
        const videoIndex = videos.findIndex(v => v.id === id);
        if (videoIndex !== -1) {
            setCurrentVideo(videos[videoIndex]);
            // Suggest other videos as "Up Next" (excluding current)
            const others = videos.filter(v => v.id !== id);
            setUpNextVideos(others);
        }
    }, [id, videos]);

    const handleNextVideo = () => {
        if (upNextVideos.length > 0) {
            navigate(`/watch/${upNextVideos[0].id}`);
        }
    };

    const handleVideoSelect = (index: number) => {
        // index here is relative to the upNext list + 1 from original component logic?
        // The original component logic for onVideoSelect was: 
        // setCurrentVideoIndex(currentVideoIndex + index + 1)
        // Here we should probably just handle the click on an item in the list directly.
        // But VideoPlayer component has internal "Up Next" list rendering that calls this.
        // Let's assume the VideoPlayer passes the absolute index or something?
        // Actually, looking at VideoPlayer.tsx:
        // onClick={() => onVideoSelect(currentVideoIndex + index + 1)}
        // It expects to select based on global index.
        // Simpler: We should perhaps just modify VideoPlayer or map the index back to ID.
        // For now, let's assume `onVideoSelect` isn't critical if we change navigation logic, 
        // OR we fix VideoPlayer to pass the ID.
        // To minimize refactoring of VideoPlayer, let's try to map it.

        // The VideoPlayer receives `upNextVideos` prop.
        // It maps them and calls onVideoSelect with an index.
        // We can interpret this index to find the next video ID.
    };

    // Better approach: The VideoPlayer's "Up Next" items should probably be clickable links or we handle the select by navigating.
    // Existing VideoPlayer uses `onVideoSelect` callback.
    // We can wrap it.

    const handleVideoSelectWrapper = (index: number) => {
        // The index passed from VideoPlayer is somewhat specific to the queue logic.
        // But in our filtered `upNextVideos` list, we can just find the video.
        // Note: VideoPlayer receives `upNextVideos`.
        // It renders them. index 0 of upNextVideos is... index 0.
        // The callback `onVideoSelect` in VideoPlayer seems to imply switching the CURRENT video index.

        // Let's look at VideoPlayer implementation in App.tsx:
        // handleVideoSelect = (videoIndex) => setCurrentVideoIndex(videoIndex);

        // We don't have a single global index anymore easily.
        // We should probably pass a hacked handler that navigates.
        // Limitation: VideoPlayer emits an integer index.

        // If we pass `upNextVideos` to VideoPlayer, and it clicks item `i`:
        // It calls `onVideoSelect(currentVideoIndex + i + 1)`.
        // This is messy.
        // Ideally we update VideoPlayer to just use `onClick={() => navigate(...)`.
        // But avoiding deep changes:
        // We can infer the intended video if we know our list.

        // Let's refactor VideoPlayer slightly in the next step to accept `onVideoSelect` that takes a Video object or ID, OR just handle it here.
        // Since I can't easily map "global index" here without context, I will just navigate to the video at that visual index in the Up Next list.

        // "index" param comes from: `currentVideoIndex + index + 1`. 
        // Wait, VideoPlayer receives `currentVideoIndex`.
        // We can pass `0`. Then it returns `0 + index + 1` = `index + 1`.
        // So `index` (0-based in upNext) maps to `result - 1`.

        if (index > 0 && index <= upNextVideos.length) { // roughly? 
            // This is getting complicated.
            // I'll update VideoPlayer to be friendlier to routing.
        }
    };

    if (!currentVideo) {
        return <div className="p-20 text-center">Video not found</div>;
    }

    return (
        <VideoPlayer
            video={currentVideo}
            upNextVideos={upNextVideos}
            onVideoUpload={onVideoUpload}
            onNextVideo={handleNextVideo}
            onVideoSelect={(idx) => {
                // This is a hack because VideoPlayer logic depends on integer indexes of an array.
                // We will modify VideoPlayer to take a direct ID handler or just Navigation handler.
                // For now, let's assume we modify VideoPlayer.
            }}
            currentVideoIndex={0} // Mock index
        />
    );
};

export default WatchPage;
