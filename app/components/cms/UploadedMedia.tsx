import MediaProps from "@/lib/interfaces/MediaProps";
import DeleteIconBtn from "./DeleteIconBtn";
import VideoPlayer from "@/components/shared/VideoPlayer";
import { mediaType } from "@/lib/enums/mediaType";

interface UploadedMediaWithPlayStateProps extends MediaProps {
  isPlaying?: boolean;
  onPlay?: (videoId: string) => void;
  onPause?: () => void;
}

export default function UploadedMedia(props: UploadedMediaWithPlayStateProps) {
  const {
    _id,
    mediaType: type,
    mediaLink,
    eventTag,
    onDeleteClick,
    hashtags,
    caption,
    isPlaying = false,
    onPlay,
    onPause,
  } = props;

  function onMediaClick() {
    if (type === mediaType.Image) {
      window.open(mediaLink, '_blank');
    }
  }

  const videoId = _id || mediaLink;

  return (
    <div className='relative aspect-square rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary-500/10'>
      {/* Media */}
      {type === mediaType.Image ? (
        <img 
          onClick={onMediaClick} 
          src={mediaLink} 
          alt={caption || "Media"} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 z-30"
        />
      ) : (
        <VideoPlayer
          videoSrc={mediaLink}
          videoId={videoId}
          isPlaying={isPlaying}
          onPlay={onPlay || (() => {})}
          onPause={onPause || (() => {})}
          className="absolute inset-0 w-full h-full"
        />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content Overlay */}
      <div className="absolute inset-0 p-3 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
        {/* Top - Media Type Badge & Delete */}
        <div className="flex justify-between items-start">
          <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
            type === mediaType.Image 
              ? "bg-blue-500/80 text-white" 
              : "bg-purple-500/80 text-white"
          }`}>
            {type === mediaType.Image ? "📷" : "🎬"} {type}
          </span>
          {onDeleteClick && (
            <DeleteIconBtn onDeleteClick={onDeleteClick} className="!relative !right-0 !bg-red-500/80 hover:!bg-red-600 !rounded-lg" />
          )}
        </div>

        {/* Bottom - Caption & Hashtags */}
        <div className="space-y-2">
          {caption && (
            <p className="text-white text-sm font-medium line-clamp-2">{caption}</p>
          )}
          {hashtags && hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {hashtags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs text-primary-400 font-medium">#{tag}</span>
              ))}
              {hashtags.length > 3 && (
                <span className="text-xs text-neutral-400">+{hashtags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
