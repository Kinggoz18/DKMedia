import MediaService from "@/services/MediaService";
import Media from "../Media";

export default async function MediaPage() {

  const mediaService = new MediaService();
  const allMedia = await mediaService.getAllMedia();

  return (
    <Media allMedia={allMedia} />
  )
}
