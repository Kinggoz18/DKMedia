import { useState } from "react"
import UploadOrganizationProps from "@/lib/interfaces/UploadOrganizationProps";
import Exit from "./Exit";
import IOrganizer from "@/lib/interfaces/Redux/IOrganizer";
import EventService from "@/lib/redux/Events/EventService";

export default function UploadOrganizationPopup(props: UploadOrganizationProps) {
  const {
    closePopup,
    handleThrowError,
    organizerService,
    setIsUploading,
    fetchAllOrganiziers, } = props;

  const eventService = new EventService();

  const [organizationName, setOrganizationName] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File>();
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  /**
  * Save the organizer
  * @returns
  */
  async function onUploadClick() {
    if (!uploadedImage || organizationName === "") {
      handleThrowError("Please fill in all the required filleds.")
      return;
    } else {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("media", uploadedImage);
      try {
        const uploadedLogoUrl = await eventService.saveImageToCloudinary(formData);

        if (!uploadedLogoUrl) {
          throw new Error("Something went wrong, while uploading the logo to cloudinary");
        }

        const data: IOrganizer = {
          name: organizationName,
          logo: uploadedLogoUrl,
        }

        const newOrganizer = await organizerService.addOrganizer(data);
        if (!newOrganizer || !newOrganizer?._id) {
          throw new Error("Something went wrong while uploading the media")
        }

        setUploadedImage(undefined)
        setUploadedImageUrl("")
        setIsUploading(false);
        await fetchAllOrganiziers();
        closePopup()
      } catch (error: any) {
        handleThrowError(error?.message ?? error);
        setUploadedImage(undefined)
        setUploadedImageUrl("")
        setIsUploading(false);
        closePopup()
      }
    }
  }

  /**
   * Handler to set uploaded image
   * @param {*} files
   * @returns
   */
  const handleSetUploadImage = (files?: FileList) => {
    if (!files) return;

    const file = files[0];
    const fileSize = Number((file.size / (1024 * 1024)).toFixed(2));

    if (fileSize > 10) {
      handleThrowError("Image file is too large.");
      setUploadedImage(undefined);
      setUploadedImageUrl("");
      return;
    }

    const fr = new FileReader();
    fr.readAsArrayBuffer(file);
    fr.onload = function () {
      if (!fr.result) return;

      const blob = new Blob([fr.result]);
      const url = URL.createObjectURL(blob);

      if (!url) return;
      setUploadedImageUrl(url);
      setUploadedImage(file);
    };
  };


  return (
    <div className="fixed inset-0 flex items-start justify-center z-40 p-4 pt-8 overflow-y-auto">
      <div className="relative w-full max-w-[450px] glass-card rounded-2xl text-white animate-fade-up animate-duration-300">
        <Exit onClick={closePopup} />

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-neutral-800/50">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            Add Organization
          </h2>
          <p className="text-neutral-500 text-sm mt-1">Add a new event organizer</p>
        </div>

        <div className="flex flex-col gap-y-5 p-6">
          <div className="flex flex-col gap-y-2">
            <label className="font-medium text-neutral-300 text-sm">Organization Name</label>
            <input
              type="text"
              placeholder="Enter organization name"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className="input-modern py-3 px-4 w-full rounded-xl font-medium"
            />
          </div>

          <div className="flex flex-col gap-y-2">
            <label className="font-medium text-neutral-300 text-sm">Logo</label>
            <div className="relative flex flex-col h-[180px] rounded-xl border-2 border-dashed border-neutral-700 hover:border-primary-500/50 bg-neutral-900/50 transition-all duration-300 items-center justify-center cursor-pointer group">
              {!uploadedImageUrl ? (
                <div className="flex flex-col items-center gap-3 p-4">
                  <div className="w-14 h-14 rounded-full bg-neutral-800 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                    <svg className="w-7 h-7 text-neutral-400 group-hover:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-neutral-300 font-medium">Drop logo here or click to upload</p>
                    <p className="text-neutral-500 text-sm mt-1">JPEG, PNG up to 10MB</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4">
                  <img
                    src={uploadedImageUrl}
                    alt="Preview"
                    className="h-24 w-24 object-contain rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-neutral-200 font-medium truncate">{uploadedImage?.name}</p>
                    <p className="text-neutral-500 text-sm">Click to change</p>
                  </div>
                </div>
              )}
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*"
                onChange={(e) => handleSetUploadImage(e.target.files ?? undefined)}
              />
            </div>
          </div>

          <button 
            onClick={onUploadClick}
            className="w-full py-4 mt-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-500 text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5"
          >
            Save Organization
          </button>
        </div>
      </div>
    </div>
  )
}
