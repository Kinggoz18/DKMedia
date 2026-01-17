import PrimaryButton from '@/components/cms/PrimaryButton';
import SectionTitle from '@/components/cms/SectionTitle';
import { useEffect, useRef, useState } from "react";
import ConfirmComponent from '@/components/cms/ConfirmComponent';
import AboutUsService from '@/lib/redux/AboutUs/AboutUsService';
import IAboutUs, { IAboutUsUpdate } from '@/lib/interfaces/Redux/IAboutUs';
import AboutUsParagraphs from '@/components/cms/AboutUsParagraphs';
import ThrowAsyncError, { toggleError } from '@/components/cms/ThrowAsyncError';
import ProcessingIcon from '@/components/cms/ProcessingIcon';

export default function AboutUs() {
  const initialState: IAboutUs = {
    _id: "",
    title: "Enter about us title...",
    paragraphs: []
  }

  const aboutUsService = new AboutUsService();
  const [isDeletePopup, setIsDeletePopup] = useState(false);
  const [aboutUsData, setAboutUsData] = useState<IAboutUs>(initialState)
  const [isUploading, setIsUploading] = useState(false);

  const [updatedData, setUpdatedData] = useState<IAboutUs>(initialState)

  const paragaphsRef = useRef<HTMLTextAreaElement>(null)
  const [aboutUsTitle, setAboutUsTitle] = useState("");

  const errorRef = useRef<HTMLDivElement>(null);
  const [responseError, setResponseError] = useState("");

  /**
  * Trigger delete popup
  */
  function onDeleteClick() {
    setIsDeletePopup(true);
  }

  /**
   * Confirm delete about us paragraph
   */
  async function onYesDeleteClick() {
    const response = await aboutUsService.deleteAboutUs();
    if (response !== "Deleted about us") {
      handleThrowError("Failed to clear about us")
    }
    await fetchAboutUs()
    setAboutUsTitle("")
    setUpdatedData(initialState)
    setIsDeletePopup(false)
  }

  /**
   * Cancel delete about us paragraph
   */
  function onNoDeleteClick() {
    setIsDeletePopup(false)
  }

  /**
   * Update about us paragraph
   */
  async function onUpdateAboutUsClick() {
    if (aboutUsTitle === "" && (!updatedData?.paragraphs || updatedData?.paragraphs?.length <= 0)) {
      handleThrowError("Please enter new data");
      return;
    }
    const data: IAboutUsUpdate = {
      title: aboutUsTitle === "" ? aboutUsData?.title : aboutUsTitle,
      paragraphs: (!updatedData?.paragraphs || updatedData?.paragraphs?.length <= 0) 
        ? undefined 
        : [...(aboutUsData?.paragraphs || []), ...(updatedData?.paragraphs || [])]
    }

    setIsUploading(true);
    try {
      const response = await aboutUsService.updateAboutUs(data);
      if (!response || !response?._id) {
        throw new Error("Something went wrong while trying to update about us");
      }
      await fetchAboutUs();
      setAboutUsTitle("")
      setUpdatedData(initialState)
      setIsUploading(false);
    } catch (error: any) {
      setIsUploading(false);
      handleThrowError(error?.message ?? error);
    }
  }

  /**
   * Add the paragraph to the current list
   */
  function onAddPragraphClick() {
    const ref = paragaphsRef?.current;
    if (!ref) return;

    const value = ref.value;
    if (value === "")
      return;

    setUpdatedData((prevState) => ({
      ...prevState,
      paragraphs: [...prevState.paragraphs, value], // Create a new array
    }));
    ref.value = ""
  }

  /**
   * Fetch about us section
   */
  async function fetchAboutUs() {
    try {
      const response = await aboutUsService.getAboutUs();
      if (response?._id) { setAboutUsData(response); }
      else {
        setAboutUsData(initialState)
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  /**
   * Remove updated paragraphs
   */
  function onDeleteParagraph(paragraph: string) {
    setUpdatedData((prevState) => ({
      ...prevState,
      paragraphs: prevState.paragraphs.filter(s => s !== paragraph),
    }));
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


  useEffect(() => {
    fetchAboutUs()
  }, [])

  return (
    <>
      {isUploading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
          <div className="glass-card p-8 rounded-2xl flex flex-col items-center gap-4">
            <ProcessingIcon width={"48"} height={"48"}></ProcessingIcon>
            <p className="text-neutral-300 font-medium">Saving changes...</p>
          </div>
        </div>
      )}
      <div className='w-full min-h-full flex flex-col gap-6 lg:gap-8 pb-8 p-4 lg:p-8 overflow-y-auto'>
        <SectionTitle title="About Us" />

      <div className="flex flex-col gap-6 lg:gap-8 w-full max-w-4xl">
        <div className="glass-card flex flex-col gap-y-5 rounded-xl p-5 lg:p-6">
          <div className="space-y-2">
            <label htmlFor="AboutUsTitle" className="text-sm font-medium text-neutral-300">Section Title</label>
            <input
              name="AboutUsTitle"
              type="text"
              placeholder={aboutUsData?.title || "Enter about us title..."}
              value={aboutUsTitle}
              onChange={(e) => setAboutUsTitle(e.target.value)}
              className="input-modern w-full py-3 px-4 rounded-xl font-semibold"
            />
          </div>
          
          <div className="space-y-2 pt-4 border-t border-neutral-800/50">
            <label className="text-sm font-medium text-neutral-300">Add Paragraph</label>
            <textarea
              ref={paragaphsRef}
              name="AboutUsParagraph"
              placeholder="Write your paragraph here..."
              rows={4}
              className="input-modern w-full py-3 px-4 rounded-xl resize-none"
            ></textarea>
            <button 
              onClick={onAddPragraphClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-700/50 hover:bg-neutral-600/50 text-neutral-200 rounded-xl font-medium transition-colors border border-neutral-600/50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Paragraph
            </button>
          </div>
        </div>
        
        <div className="glass-card flex flex-col gap-y-4 rounded-xl p-5 lg:p-6 min-h-[200px]">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg text-white">Paragraphs</h2>
            <span className="text-sm text-neutral-500">
              {(aboutUsData?.paragraphs?.length || 0) + (updatedData?.paragraphs?.length || 0)} total
            </span>
          </div>
          <div className="overflow-y-auto max-h-[400px] scrollbar-thin">
            <AboutUsParagraphs paragraphs={aboutUsData?.paragraphs} updatedParagraphs={updatedData?.paragraphs} onDeleteParagraph={onDeleteParagraph} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={onUpdateAboutUsClick}
            disabled={isUploading}
            className="w-full sm:w-auto min-w-[180px] py-3.5 px-8 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
          <button 
            onClick={onDeleteClick}
            className="w-full sm:w-auto min-w-[180px] py-3.5 px-8 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl font-semibold transition-all border border-red-600/30"
          >
            Clear All
          </button>
        </div>
      </div>

      {isDeletePopup && <>
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30"></div>
        <ConfirmComponent
          message="Are you sure you want to clear the About Us section?"
          onNoClick={onNoDeleteClick}
          onYesClick={onYesDeleteClick}
        /></>}

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
