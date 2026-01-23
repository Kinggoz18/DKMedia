import MediaService from "@/services/MediaService";
import Media from "../Media";

export default async function MediaPage() {

  const mediaService = new MediaService();
  const response = await mediaService.getAllMedia(1, 20);
  // Handle both old format (array) and new format (object with media and pagination)
  const allMedia = Array.isArray(response) ? response : (response.media || []);

  return (
    <Media allMedia={allMedia} />
  )
}
