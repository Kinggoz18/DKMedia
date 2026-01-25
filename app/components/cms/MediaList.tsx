import IMedia from "@/lib/interfaces/Redux/IMedia";
import UploadedMedia from "./UploadedMedia";
import { useState } from "react";
import { mediaType } from "@/lib/enums/mediaType";

interface RenderMediaProps {
  allMedia: IMedia[];
  onDeleteClick: (id: string) => void;
}

function MediaList(props: RenderMediaProps) {
  const { onDeleteClick, allMedia } = props;
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

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