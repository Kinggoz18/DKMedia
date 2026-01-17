import MediaProps from "@/lib/interfaces/MediaProps";
import DeleteIconBtn from "./DeleteIconBtn";

export default function UploadedMedia(props: MediaProps) {
  const {
    mediaType,
    mediaLink,
    eventTag,
    onDeleteClick,
    hashtags,
    caption,
  } = props;

  function onMediaClick() {
    window.open(mediaLink, '_blank');
  }

  return (
    <div className='relative aspect-square rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary-500/10'>
      {/* Media */}
      {mediaType === "Image" ? (
        <img 
          onClick={onMediaClick} 
          src={mediaLink} 
          alt={caption || "Media"} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <video 
          onClick={onMediaClick} 
          src={mediaLink} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content Overlay */}
      <div className="absolute inset-0 p-3 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {/* Top - Media Type Badge & Delete */}
        <div className="flex justify-between items-start">
          <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
            mediaType === "Image" 
              ? "bg-blue-500/80 text-white" 
              : "bg-purple-500/80 text-white"
          }`}>
            {mediaType === "Image" ? "📷" : "🎬"} {mediaType}
          </span>
          <DeleteIconBtn onDeleteClick={onDeleteClick} className="!relative !right-0 !bg-red-500/80 hover:!bg-red-600 !rounded-lg" />
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

      {/* Play Icon for Videos */}
      {mediaType === "Video" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}
