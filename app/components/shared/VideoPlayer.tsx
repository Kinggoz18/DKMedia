import { useRef, useEffect, useState } from "react";

interface VideoPlayerProps {
  videoSrc: string;
  videoId: string;
  isPlaying: boolean;
  onPlay: (videoId: string) => void;
  onPause: () => void;
  className?: string;
  thumbnail?: string;
}

export default function VideoPlayer({
  videoSrc,
  videoId,
  isPlaying,
  onPlay,
  onPause,
  className = "",
  thumbnail,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const wasPlayingRef = useRef(false);
  const hasSeekedRef = useRef(false);

  // Seek to 0.5 seconds on initial load to avoid black frame
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const seekToHalfSecond = () => {
      // Only seek if video is paused, at the start, and hasn't been seeked yet
      if (!isPlaying && video.currentTime < 0.5 && !hasSeekedRef.current) {
        video.currentTime = 0.5;
        hasSeekedRef.current = true;
      }
    };

    const handleLoadedMetadata = () => {
      seekToHalfSecond();
    };

    const handleCanPlay = () => {
      seekToHalfSecond();
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);

    // If metadata is already loaded, seek immediately
    if (video.readyState >= 1) {
      seekToHalfSecond();
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [videoSrc, isPlaying]);

  // Reset seek flag when video source changes
  useEffect(() => {
    hasSeekedRef.current = false;
  }, [videoSrc]);

  // Handle play/pause based on isPlaying prop
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        // Unmute the video when it starts playing
        videoRef.current.muted = false;
        videoRef.current.play().catch((error) => {
          console.error("Error playing video:", error);
        });
        wasPlayingRef.current = true;
      } else {
        // Only reset if this video was previously playing (another video started)
        if (wasPlayingRef.current && videoRef.current.currentTime > 0) {
          videoRef.current.currentTime = 0.5; // Seek to 0.5s instead of 0 to avoid black frame
          hasSeekedRef.current = true;
          wasPlayingRef.current = false;
        }
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handlePlayPauseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      wasPlayingRef.current = false;
      onPause();
    } else {
      onPlay(videoId);
    }
  };

  return (
    <div
      className={`relative ${className} z-30`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
        playsInline
        preload="metadata"
        muted={!isPlaying}
        loop={false}
      />

      {/* Play/Pause Overlay Button - Only center button, not full overlay */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
        >
          <div
            className={`w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 cursor-pointer pointer-events-auto ${
              isHovered ? "scale-110 bg-white/30" : ""
            }`}
            onClick={handlePlayPauseClick}
          >
            <svg
              className="w-6 h-6 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
      
      {/* Pause button overlay when playing */}
      {isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
        >
          <div
            className={`w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 cursor-pointer pointer-events-auto opacity-0 hover:opacity-100 ${
              isHovered ? "scale-110 bg-white/30" : ""
            }`}
            onClick={handlePlayPauseClick}
          >
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          </div>
        </div>
      )}

      {/* Gradient Overlay for better visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
