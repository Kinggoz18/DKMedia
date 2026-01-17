import IMedia from "@/lib/interfaces/Redux/IMedia";
import UploadedMedia from "./UploadedMedia";

interface RenderMediaProps {
  allMedia: IMedia[];
  onDeleteClick: (id: string) => void;
}

//TODO: Complete event tag logic
function MediaList(props: RenderMediaProps) {
  const { onDeleteClick, allMedia } = props;

  // Ensure allMedia is always an array to prevent crashes
  const safeMedia = Array.isArray(allMedia) ? allMedia : [];

  return safeMedia.map((element, index) => (
    <UploadedMedia
      key={index}
      mediaType={element?.mediaType}
      mediaLink={element?.mediaLink}
      eventTag={element?.eventTag}
      hashtags={element?.hashtags}
      caption={element?.caption}
      onDeleteClick={() => onDeleteClick(element?._id ?? "")}
    />
  ))
}

export default MediaList;