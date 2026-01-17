import { useEffect, useState } from "react";
import IOrganizer from "@/lib/interfaces/Redux/IOrganizer";
import { AddEventPopupProps } from "@/lib/interfaces/AddEventPopupProps";
import OrganizerService from "@/lib/redux/Organizers/OrganizerService";
import { EventPriority } from "@/lib/enums/eventPriority";
import Exit from "./Exit";
import PrimaryButton from "./PrimaryButton";
import IEvent from "@/lib/interfaces/Redux/IEvent";

export default function AddEventPopup(props: AddEventPopupProps) {
  const {
    closePopup,
    eventService,
    fetchEvents,
    handleThrowError,
    setIsUploading
  } = props;

  const organizerService = new OrganizerService();
  const currentDate = new Date().toISOString().slice(0, 16);
  const [organziers, setOrganizers] = useState<[IOrganizer]>([{ _id: "", name: "", logo: "" }]);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File>();
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [ticketLink, setTicketLink] = useState("");
  const [eventPriority, setEventPriority] = useState<EventPriority>(EventPriority.default);
  const [selectedOrganizer, setSelectedOrganizer] = useState<IOrganizer>({ _id: "", name: "", logo: "" })

  /**
   * Fetch all organizers
   */
  async function fetchOrganizers() {
    const response = await organizerService.getAllOrganizer();
    console.log({ response })
    setOrganizers(response)
  }

  /**
   * Handler to select organizer
   */
  function handleSelectOrganizer(id: string) {
    console.log({ id, organziers })
    const safeOrganizers = Array.isArray(organziers) ? organziers : [];
    const selected = safeOrganizers.find((o) => o?._id === id);
    console.log({ id, selected })
    if (!selected) {
      console.log("Invalid selection");
      return;
    };
    setSelectedOrganizer(selected);
  }

  /**
   * Handler to select priority
   */
  function handleSelectEventPriority(priority: string) {
    if (!priority) {
      console.log("Invalid selection");
      return;
    };

    setEventPriority(priority as EventPriority);
  }

  /**
   * Handler to set uploaded image
   * @param {FileList} files
   * @returns {void}
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

  /**
   * Check if the form is valid
   */
  const isFormValid = (): boolean => {
    if (eventTitle == "" ||
      eventDate == "" ||
      uploadedImageUrl == "" ||
      eventPriority === EventPriority.default ||
      selectedOrganizer.logo == "" || selectedOrganizer.name == "")
      return false;
    console.log({ eventTitle, eventDate, uploadedImageUrl, eventPriority, selectedOrganizerLogo: selectedOrganizer?.logo, selectedOrganizerName: selectedOrganizer?.name })

    return true;
  }

  /**
   * Upload the event
   */
  const handleUploadEvent = async () => {
    try {
      if (!isFormValid()) {
        setIsUploading(false)
        handleThrowError("Fill in all the missing fields")
        return;
      }

      if (!isValidURL(ticketLink)) {
        setIsUploading(false)
        handleThrowError("Please enter a valid URL")
        return;
      }

      if (!uploadedImage) {
        setIsUploading(false)
        handleThrowError("Fill in all the missing fields")
        return;
      };

      console.log("sumbiting event")
      //Save the image
      const formData = new FormData();
      formData.append("media", uploadedImage);
      setIsUploading(true)
      const imageResponse = await eventService.saveImageToCloudinary(formData)

      //Upload the event
      const data: IEvent = {
        title: eventTitle,
        date: eventDate,
        image: imageResponse,
        priority: eventPriority,
        organizer: selectedOrganizer,
        ticketLink: ticketLink,
      };
      await eventService.addEvent(data);
      await fetchEvents();
      setIsUploading(false)
      closePopup();
    } catch (error: any) {
      console.log({ error })
      setIsUploading(false)
      handleThrowError(error?.message)
      closePopup();
    }
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

  useEffect(() => {
    fetchOrganizers()
  }, []);

  return (
    <div className="fixed inset-0 flex items-start justify-center z-40 p-4 pt-8 overflow-y-auto">
      <div className='relative w-full max-w-[600px] glass-card rounded-2xl text-white animate-fade-up animate-duration-300'>
        <Exit onClick={closePopup} />
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-neutral-800/50">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            Add New Event
          </h2>
          <p className="text-neutral-500 text-sm mt-1">Fill in the details for your upcoming event</p>
        </div>
        
        <div className="flex flex-col gap-y-5 p-6">
          {/***************** Event title *************************/}
          <div className="flex flex-col gap-y-2">
            <label htmlFor="EventTitle" className="font-medium text-neutral-300 text-sm">Event Title</label>
            <input
              name="EventTitle"
              type="text"
              placeholder="Enter event title"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="input-modern py-3 px-4 w-full rounded-xl font-medium"
            />
          </div>

          {/* Two column grid for date and ticket */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/***************** Event Date *************************/}
            <div className="flex flex-col gap-y-2">
              <label htmlFor="EventDate" className="font-medium text-neutral-300 text-sm">Date & Time</label>
              <input
                name="EventDate"
                type="datetime-local"
                min={currentDate}
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="input-modern py-3 px-4 w-full rounded-xl font-medium"
              />
            </div>

            {/***************** Event ticket link *************************/}
            <div className="flex flex-col gap-y-2">
              <label htmlFor="TicketLink" className="font-medium text-neutral-300 text-sm">Ticket Link</label>
              <input
                name="TicketLink"
                type="url"
                placeholder="https://..."
                value={ticketLink}
                onChange={(e) => setTicketLink(e.target.value)}
                className="input-modern py-3 px-4 w-full rounded-xl font-medium"
              />
            </div>
          </div>

          {/* Two column grid for priority and organizer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/***************** Event Priority *************************/}
            <div className="flex flex-col gap-y-2">
              <label htmlFor="eventPriority" className="font-medium text-neutral-300 text-sm">Priority Level</label>
              <select 
                name="eventPriority" 
                onChange={(e) => handleSelectEventPriority(e.target.value)} 
                className="input-modern py-3 px-4 rounded-xl font-medium cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat"
              >
                <option value={EventPriority.default}>Select priority</option>
                <option value={EventPriority.Highlight}>⭐ Highlight</option>
                <option value={EventPriority.Regular}>📅 Regular</option>
              </select>
            </div>

            {/***************** Event Organizer *************************/}
            <div className="flex flex-col gap-y-2">
              <label htmlFor="eventOrganizer" className="font-medium text-neutral-300 text-sm">Organizer</label>
              <select 
                name="eventOrganizer" 
                onChange={(e) => handleSelectOrganizer(e.target.value)} 
                className="input-modern py-3 px-4 rounded-xl font-medium cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat"
              >
                <option value="">Select organizer</option>
                {(Array.isArray(organziers) ? organziers : []).map((element) => (
                  <option key={element?._id} value={element?._id}>{element?.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/***************** Upload event image *************************/}
          <div className="flex flex-col gap-y-2">
            <label className="font-medium text-neutral-300 text-sm">Event Image</label>
            <div className="relative flex flex-col h-[180px] rounded-xl border-2 border-dashed border-neutral-700 hover:border-primary-500/50 bg-neutral-900/50 transition-all duration-300 items-center justify-center cursor-pointer group">
              {!uploadedImage ? (
                <div className="flex flex-col items-center gap-3 p-4">
                  <div className="w-14 h-14 rounded-full bg-neutral-800 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                    <svg className="w-7 h-7 text-neutral-400 group-hover:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-neutral-300 font-medium">Drop image here or click to upload</p>
                    <p className="text-neutral-500 text-sm mt-1">JPEG, PNG up to 10MB</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4">
                  <img
                    src={uploadedImageUrl || "/upload-image.svg"}
                    alt="Preview"
                    className="h-24 w-24 object-cover rounded-lg"
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

          {/* Submit Button */}
          <button 
            onClick={handleUploadEvent}
            className="w-full py-4 mt-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-500 text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5"
          >
            Create Event
          </button>
        </div>
      </div>
    </div>
  )
}
