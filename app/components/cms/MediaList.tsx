import IMedia from "@/lib/interfaces/Redux/IMedia";
import UploadedMedia from "./UploadedMedia";
import { useState } from "react";
import { mediaType } from "@/lib/enums/mediaType";

interface RenderMediaProps {
  allMedia: IMedia[];
  onDeleteClick: (id: string) => void;
}

//TODO: Complete event tag logic
function MediaList(props: RenderMediaProps) {
  const { onDeleteClick, allMedia } = props;
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  // Ensure allMedia is always an array to prevent crashes
  const safeMedia = Array.isArray(allMedia) ? allMedia : [];

  const handlePlay = (videoId: string) => {
    setPlayingVideoId(videoId);
  };

  const handlePause = () => {
    setPlayingVideoId(null);
  };

  return safeMedia.map((element, index) => {
    const videoId = element?._id || element?.mediaLink || `video-${index}`;
    const isPlaying = playingVideoId === videoId;

    return (
      <UploadedMedia
        key={index}
        _id={element?._id}
        mediaType={element?.mediaType}
        mediaLink={element?.mediaLink}
        eventTag={element?.eventTag}
        hashtags={element?.hashtags}
        caption={element?.caption}
        onDeleteClick={() => onDeleteClick(element?._id ?? "")}
        isPlaying={isPlaying}
        onPlay={handlePlay}
        onPause={handlePause}
      />
    );
  });
}

export default MediaList;