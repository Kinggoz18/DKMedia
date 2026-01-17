import OrganizerService from "../redux/Organizers/OrganizerService";

export default interface UploadOrganizationProps {
  closePopup: () => void;
  handleThrowError: (errorMsg: string) => void;
  organizerService: OrganizerService;
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
  fetchAllOrganiziers: () => Promise<void>
}