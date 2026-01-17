import PrimaryButton from '@/components/cms/PrimaryButton';
import SectionTitle from '@/components/cms/SectionTitle';
import { Suspense, useEffect, useRef, useState } from "react";
import ConfirmComponent from '@/components/cms/ConfirmComponent';
import UploadOrganizationPopup from '@/components/cms/UploadOrganizationPopup';
import OrganizationList from '@/components/cms/OrganizationList';
import OrganizerService from '@/lib/redux/Organizers/OrganizerService';
import ThrowAsyncError, { toggleError } from '@/components/cms/ThrowAsyncError';
import IOrganizer from '@/lib/interfaces/Redux/IOrganizer';
import ProcessingIcon from '@/components/cms/ProcessingIcon';


export default function ManageMedia() {
  const [isDeletePopup, setIsDeletePopup] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] = useState("");
  const [isUploadOrganizationPopup, setIsUploadOrganizationPopup] = useState(false);
  const [organizers, setOrganizers] = useState<[IOrganizer]>([{
    _id: "",
    name: "",
    logo: ""
  }])

  const organizerService = new OrganizerService();

  const [isUploading, setIsUploading] = useState(false);

  const errorRef = useRef<HTMLDivElement>(null);
  const [responseError, setResponseError] = useState("");

  /**
   * Trigger delete popup
   */
  function onDeleteClick(id: string) {
    if (!id)
      throw new Error("Id is missing");

    setIsDeletePopup(true);
    setOrganizationToDelete(id);
  }

  /**
   * Confirm delete organization action
   */
  async function onYesDeleteClick() {
    try {
      await organizerService.deleteOrganizer(organizationToDelete);
      setIsDeletePopup(false)
      setOrganizationToDelete("");
      await fetchAllOrganiziers();
    } catch (error: any) {
      setIsDeletePopup(false)
      setOrganizationToDelete("");
      handleThrowError(error?.message)
    }
  }

  /**
   * Cancel delete organization action
   */
  function onNoDeleteClick() {
    setIsDeletePopup(false)
    setOrganizationToDelete("");
  }


  /**
   * Upload organization
   */
  function onUploadOrganizationClick() {
    setIsUploadOrganizationPopup(true)
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
   * Fetch all organizers
   */
  async function fetchAllOrganiziers() {
    try {
      const response = await organizerService.getAllOrganizer();
      setOrganizers(response);
    } catch (error: any) {
      handleThrowError(error?.message ?? error)
    }
  }

  useEffect(() => {
    fetchAllOrganiziers()
  }, []);

  const safeOrganizers = Array.isArray(organizers) && organizers.length > 0 && organizers[0]?._id !== "" ? organizers : [];

  return (
    <>
      {isUploading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
          <div className="glass-card p-8 rounded-2xl flex flex-col items-center gap-4">
            <ProcessingIcon width={"48"} height={"48"}></ProcessingIcon>
            <p className="text-neutral-300 font-medium">Processing...</p>
          </div>
        </div>
      )}

      <div className='w-full min-h-full flex flex-col gap-6 lg:gap-8 pb-8 p-4 lg:p-8 overflow-y-auto'>
        <SectionTitle title="Manage Organizations" />

        <div className='glass-card flex flex-col w-full flex-1 min-h-[400px] gap-y-4 rounded-xl p-5 lg:p-6'>
          <div className='flex items-center justify-between mb-2'>
            <h2 className='text-lg lg:text-xl font-bold text-white'>Event Organizers</h2>
            <span className="text-sm text-neutral-500">{safeOrganizers.length} organizations</span>
          </div>
          {safeOrganizers.length > 0 ? (
            <div className='w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-y-auto flex-1 pb-4 scrollbar-thin'>
              <Suspense fallback={<p className="text-neutral-400 col-span-full">Fetching organizations...</p>}>
                <OrganizationList
                  onDeleteClick={onDeleteClick}
                  allOrganizations={safeOrganizers}
                />
              </Suspense>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-4">
              <div className="w-20 h-20 rounded-full bg-neutral-800/50 flex items-center justify-center">
                <svg className="w-10 h-10 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p>No organizations added yet</p>
            </div>
          )}
        </div>

        <div className="flex justify-center lg:justify-start">
          <PrimaryButton title="Add Organization" onBtnClick={onUploadOrganizationClick} />
        </div>

        {isDeletePopup && <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30"></div>
          <ConfirmComponent
            message="Are you sure you want to delete this organization?"
            onNoClick={onNoDeleteClick}
            onYesClick={onYesDeleteClick}
          /></>}

        {isUploadOrganizationPopup &&
          <>
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30"></div>
            <UploadOrganizationPopup
              closePopup={() => setIsUploadOrganizationPopup(false)}
              handleThrowError={handleThrowError}
              organizerService={organizerService}
              setIsUploading={setIsUploading}
              fetchAllOrganiziers={fetchAllOrganiziers}
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
