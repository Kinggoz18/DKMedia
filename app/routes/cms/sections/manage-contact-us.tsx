import { useEffect, useRef, useState, useMemo } from "react";
import ConfirmComponent from '@/components/cms/ConfirmComponent';
import ThrowAsyncError, { toggleError } from '@/components/cms/ThrowAsyncError';
import ProcessingIcon from '@/components/cms/ProcessingIcon';
import IContactUs from '@/lib/interfaces/Redux/IContactUs';
import { ContactService } from '@/lib/redux/Contact/ContactService';
import { ContactUsService } from '@/lib/redux/Contact/ContactUsService';
import { ContactUsInquiriesList } from '@/components/cms/InquiriesList';
import IContact, { IContactUpdate } from '@/lib/interfaces/Redux/IContact';
import SectionTitle from '@/components/cms/SectionTitle';
import ReplyInquiryPopup from '@/components/cms/ReplyInquiryPopup';

const ITEMS_PER_PAGE = 20;

export default function ManageContactUs() {
  const contactService = new ContactService();
  const contactUsService = new ContactUsService();

  const [isDeletePopup, setIsDeletePopup] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState("");
  const [isReplyPopupOpen, setIsReplyPopupOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<IContactUs | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const [responseError, setResponseError] = useState("");
  const [contactInfo, setContactInfo] = useState<IContact>({
    email: "",
    instagramLink: "",
    tiktokLink: "",
  })

  const [newEmail, setNewEmail] = useState("");
  const [newInstagram, setNewInstagram] = useState("");
  const [newTikTok, setNewTikTok] = useState("");

  // Search and pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [allInquiries, setAllInquires] = useState<IContactUs[]>([{
    _id: "",
    firstName: "",
    lastName: "",
    subject: "",
    company: "",
    email: "",
    phone: "",
    message: "",
  }])

  /**
   * Trigger delete popup
   */
  function onDeleteClick(id: string) {
    if (!id)
      throw new Error("Id is missing");

    setIsDeletePopup(true);
    setInquiryToDelete(id);
  }

  /**
   * Confirm delete inquiry action
   */
  async function onYesDeleteClick() {
    try {
      await contactUsService.deleteContactUsInquiry(inquiryToDelete);
      setIsDeletePopup(false)
      setInquiryToDelete("");
      await fetchInquires();
    } catch (error: any) {
      setIsDeletePopup(false)
      setInquiryToDelete("");
      handleThrowError(error?.message)
    }
  }

  /**
   * Cancel delete inquiry action
   */
  function onNoDeleteClick() {
    setIsDeletePopup(false)
    setInquiryToDelete("");
  }

  /**
 * Check if the url is valid
 */
  function isValidURL(input: string) {
    try {
      new URL(input);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update contact
   */
  async function onUpdateContactClick() {
    if (newEmail === "" && newInstagram === "" && newTikTok === "") {
      return handleThrowError("Please fill in empty fields");
    }

    if (newInstagram !== "" && !isValidURL(newInstagram)) {
      return handleThrowError("Please enter a valid link");
    }

    if (newTikTok !== "" && !isValidURL(newTikTok)) {
      return handleThrowError("Please enter a valid link");
    }

    setIsUploading(true);
    try {
      const data: IContactUpdate = {
        email: newEmail !== "" ? newEmail : undefined,
        instagramLink: newInstagram !== "" ? newInstagram : undefined,
        tiktokLink: newTikTok !== "" ? newTikTok : undefined,
      }

      const response = await contactService.addContact(data);
      if (!response || !response?._id) {
        throw new Error('Sorry, something went wrong while trying to update contact information')
      }
      await fecthContactInfo();
      setNewEmail("")
      setNewInstagram("")
      setNewTikTok("")
      setIsUploading(false);
    } catch (error: any) {
      setIsUploading(false);
      return handleThrowError(error?.message ?? error);
    }
  }

  /**
   * Fetch all inquiries
   */
  async function fetchInquires() {
    try {
      const data = await contactUsService.getAllContactUsInquiry();
      setAllInquires(data)
    } catch (error: any) {
      console.log({ error })
      handleThrowError(error?.message)
    }
  }

  /**
   * Fetch contact information
   */
  async function fecthContactInfo() {
    try {
      const data = await contactService.getContacts();
      setContactInfo(data)
    } catch (error: any) {
      console.log({ error })
      handleThrowError(error?.message)
    }
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
   * Handle reply click
   */
  function onReplyClick(inquiry: IContactUs) {
    setSelectedInquiry(inquiry);
    setIsReplyPopupOpen(true);
  }

  /**
   * Handle reply sent successfully
   */
  function onReplySent() {
    // Optionally refresh inquiries or show success message
    fetchInquires();
  }

  useEffect(() => {
    fecthContactInfo();
    fetchInquires();
  }, []);

  const safeInquiries = Array.isArray(allInquiries) && allInquiries.length > 0 && allInquiries[0]?._id !== "" ? allInquiries : [];

  // Filter inquiries by search query
  const filteredInquiries = useMemo(() => {
    if (!searchQuery.trim()) return safeInquiries;
    const query = searchQuery.toLowerCase();
    return safeInquiries.filter(inquiry => 
      inquiry?.firstName?.toLowerCase().includes(query) ||
      inquiry?.lastName?.toLowerCase().includes(query) ||
      inquiry?.email?.toLowerCase().includes(query) ||
      inquiry?.subject?.toLowerCase().includes(query) ||
      inquiry?.company?.toLowerCase().includes(query)
    );
  }, [safeInquiries, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredInquiries.length / ITEMS_PER_PAGE);
  const paginatedInquiries = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInquiries.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredInquiries, currentPage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
        <SectionTitle title="Contact Us" />
        
        {/* Contact section */}
        <div className='glass-card flex flex-col gap-y-5 w-full rounded-xl p-5 lg:p-6'>
          <div className="flex items-center gap-3 pb-4 border-b border-neutral-800/50">
            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Social Links</h2>
              <p className="text-sm text-neutral-500">Update your contact information</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className='text-sm font-medium text-neutral-300'>Contact Email</label>
              <input
                type="email"
                placeholder={contactInfo?.email || "Enter email"}
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="input-modern w-full py-3 px-4 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className='text-sm font-medium text-neutral-300'>TikTok Link</label>
              <input
                type="text"
                value={newTikTok}
                onChange={(e) => setNewTikTok(e.target.value)}
                placeholder={contactInfo?.tiktokLink || "Enter TikTok link"}
                className="input-modern w-full py-3 px-4 rounded-xl"
              />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <label className='text-sm font-medium text-neutral-300'>Instagram Link</label>
              <input
                type="text"
                value={newInstagram}
                onChange={(e) => setNewInstagram(e.target.value)}
                placeholder={contactInfo?.instagramLink || "Enter Instagram link"}
                className="input-modern w-full py-3 px-4 rounded-xl"
              />
            </div>
          </div>

          <button 
            onClick={onUpdateContactClick}
            disabled={isUploading}
            className="w-fit mt-2 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Changes
          </button>
        </div>

        {/* Contact us inquiries section */}
        <div className='glass-card flex flex-col w-full flex-1 min-h-[400px] gap-y-4 rounded-xl p-5 lg:p-6'>
          <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2'>
            <div>
              <h2 className='text-lg lg:text-xl font-bold text-white'>Submitted Inquiries</h2>
              <span className="text-sm text-neutral-500">
                {filteredInquiries.length} of {safeInquiries.length} inquiries
                {searchQuery && ` matching "${searchQuery}"`}
              </span>
            </div>
            
            {/* Search Bar */}
            <div className="relative w-full lg:w-80">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, email, subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className='w-full overflow-y-auto flex flex-col gap-y-3 flex-1 pb-4 scrollbar-thin'>
            {paginatedInquiries.length > 0 ? (
              <ContactUsInquiriesList
                allInquiries={paginatedInquiries}
                onDeleteClick={onDeleteClick}
                onReplyClick={onReplyClick}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-4">
                <div className="w-20 h-20 rounded-full bg-neutral-800/50 flex items-center justify-center">
                  <svg className="w-10 h-10 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <p>{searchQuery ? `No inquiries matching "${searchQuery}"` : "No inquiries yet"}</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4 border-t border-neutral-800/50">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-neutral-800/50 text-neutral-400 hover:text-white hover:bg-neutral-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        currentPage === page 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-neutral-800/50 text-neutral-400 hover:text-white hover:bg-neutral-700/50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-neutral-800/50 text-neutral-400 hover:text-white hover:bg-neutral-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <span className="ml-4 text-sm text-neutral-500">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          )}
        </div>

        {isDeletePopup && <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30"></div>
          <ConfirmComponent
            message="Are you sure you want to delete this inquiry?"
            onNoClick={onNoDeleteClick}
            onYesClick={onYesDeleteClick}
          /></>}

        {isReplyPopupOpen && selectedInquiry && (
          <ReplyInquiryPopup
            isOpen={isReplyPopupOpen}
            onClose={() => {
              setIsReplyPopupOpen(false);
              setSelectedInquiry(null);
            }}
            inquiryEmail={selectedInquiry.email}
            originalSubject={selectedInquiry.subject}
            onReplySent={onReplySent}
            inquiryId={selectedInquiry._id || ""}
          />
        )}

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
