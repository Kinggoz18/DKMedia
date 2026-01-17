import PrimaryButton from '@/components/cms/PrimaryButton';
import SectionTitle from '@/components/cms/SectionTitle';
import { Suspense, useEffect, useRef, useState } from "react";
import ConfirmComponent from '@/components/cms/ConfirmComponent';
import UploadMediaPopup from '@/components/cms/UploadMediaPopup';
import MediaService from '@/lib/redux/Media/MediaService';
import MediaList from '@/components/cms/MediaList';
import IMedia from '@/lib/interfaces/Redux/IMedia';
import { mediaType } from '@/lib/enums/mediaType';
import ThrowAsyncError, { toggleError } from '@/components/cms/ThrowAsyncError';
import ProcessingIcon from '@/components/cms/ProcessingIcon';

export default function ManageMedia() {
  const mediaService = new MediaService();
  const [isDeletePopup, setIsDeletePopup] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState("");
  const [isUploadMediaPopup, setIsUploadMediaPopup] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [allMedia, setAllMedia] = useState<[IMedia]>([{
    _id: "",
    mediaType: mediaType.Default,
    mediaLink: "",
  }])

  const errorRef = useRef<HTMLDivElement>(null);
  const [responseError, setResponseError] = useState("");

  /**
  * Trigger delete popup
  */
  function onDeleteClick(id: string) {
    if (!id)
      throw new Error("Id is missing");

    setIsDeletePopup(true);
    setMediaToDelete(id);
  }

  /**
   * Confirm delete media action
   */
  async function onYesDeleteClick() {
    const response = await mediaService.deleteMedia(mediaToDelete);
    setMediaToDelete("");

    if (response !== "deleted successfuly") {
      handleThrowError("Failed to delete media")
    }
    await fetchAllMedia()
    setIsDeletePopup(false)
  }

  /**
   * Cancel delete media action
   */
  function onNoDeleteClick() {
    setIsDeletePopup(false)
    setMediaToDelete("");
  }

  /**
   * Upload media
   */
  function onUploadMediaClick() {
    setIsUploadMediaPopup(true)
  }

  /**
* Throw error
* @param {*} errorMsg
*/
  const handleThrowError = (errorMsg: string) => {
    setResponseError(errorMsg);
    setTimeout(() => {
      toggleError(errorRef);
    }, 400);
  };

  /**
   * Fetch all media
   */
  async function fetchAllMedia() {
    try {
      const response = await mediaService.getAllMedia();
      setAllMedia(response);
    } catch (error: any) {
      console.log({ error });
      handleThrowError(error?.message ?? error);
    }
  }

  useEffect(() => {
    fetchAllMedia()
  }, [])

  const safeMedia = Array.isArray(allMedia) && allMedia.length > 0 && allMedia[0]?._id !== "" ? allMedia : [];

  return (<>
    {isUploading && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
        <div className="glass-card p-8 rounded-2xl flex flex-col items-center gap-4">
          <ProcessingIcon width={"48"} height={"48"}></ProcessingIcon>
          <p className="text-neutral-300 font-medium">Uploading...</p>
        </div>
      </div>
    )}
    <div className='w-full min-h-full flex flex-col gap-6 lg:gap-8 pb-8 p-4 lg:p-8 overflow-y-auto'>
      <SectionTitle title="Manage Media" />

      <div className='glass-card flex flex-col w-full flex-1 min-h-[400px] gap-y-4 rounded-xl p-5 lg:p-6'>
        <div className='flex items-center justify-between mb-2'>
          <h2 className='text-lg lg:text-xl font-bold text-white'>Uploaded Recaps</h2>
          <span className="text-sm text-neutral-500">{safeMedia.length} items</span>
        </div>
        {safeMedia.length > 0 ? (
          <div className='w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-y-auto flex-1 pb-4 scrollbar-thin'>
            <Suspense fallback={<p className="text-neutral-400 col-span-full">Fetching media...</p>}>
              <MediaList onDeleteClick={onDeleteClick} allMedia={safeMedia} />
            </Suspense>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-4">
            <div className="w-20 h-20 rounded-full bg-neutral-800/50 flex items-center justify-center">
              <svg className="w-10 h-10 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p>No media uploaded yet</p>
          </div>
        )}
      </div>

      <div className="flex justify-center lg:justify-start">
        <PrimaryButton title="Upload Media" onBtnClick={onUploadMediaClick} />
      </div>

      {/* Delete media section */}
      {isDeletePopup && <>
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30"></div>
        <ConfirmComponent
          message="Are you sure you want to delete this Media?"
          onNoClick={onNoDeleteClick}
          onYesClick={onYesDeleteClick}
        /></>}

      {isUploadMediaPopup &&
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30"></div>
          <UploadMediaPopup
            closePopup={() => setIsUploadMediaPopup(false)}
            handleThrowError={handleThrowError}
            mediaService={mediaService}
            setIsUploading={setIsUploading}
            fetchAllMedia={fetchAllMedia}
          />
        </>}

      {/* Throw error section */}
      <ThrowAsyncError
        responseError={responseError}
        errorRef={errorRef}
        className={"!bottom-[5%] !left-[50%] !-translate-x-1/2 lg:!left-[20%] lg:!translate-x-0"}
      />
    </div>
  </>
  )
}
