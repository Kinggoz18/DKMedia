import MediaService from "../redux/Media/MediaService";

export default interface UploadMediaProps {
  closePopup: () => void;
  handleThrowError: (errorMsg: string) => void;
  mediaService: MediaService;
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
  fetchAllMedia: () => Promise<void>
}