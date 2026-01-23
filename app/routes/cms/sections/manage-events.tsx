import SectionTitle from '@/components/cms/SectionTitle';
import { Suspense, useEffect, useRef, useState } from "react";
import ConfirmComponent from '@/components/cms/ConfirmComponent';
import { EventList } from '@/components/cms/EventList';
import EventService from '@/lib/redux/Events/EventService';
import IEvent from '@/lib/interfaces/Redux/IEvent';
import { EventPriority } from '@/lib/enums/eventPriority';
import AddEventPopup from '@/components/cms/AddEventPopup';
import PrimaryButton from '@/components/cms/PrimaryButton';
import ThrowAsyncError, { toggleError } from '@/components/cms/ThrowAsyncError';
import ProcessingIcon from '@/components/cms/ProcessingIcon';

export default function ManageEvents() {
  const eventService = new EventService();

  const [isDeletePopup, setIsDeletePopup] = useState(false);
  const [eventToDelete, setEventToDelete] = useState("");
  const [isAddEventPopup, setIsAddEventPopup] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const errorRef = useRef<HTMLDivElement>(null);
  const [responseError, setResponseError] = useState("");


  const [allEvents, setAllEvents] = useState<[IEvent]>([{
    _id: "",
    title: "",
    date: "",
    image: "",
    priority: EventPriority.Regular,
    ticketLink: "",
    organizer: {
      name: "",
      logo: "",
    },
  }])

  /**
   * Trigger delete popup
   */
  function onDeleteClick(id: string) {
    if (!id)
      throw new Error("Id is missing");

    setIsDeletePopup(true);
    setEventToDelete(id);
  }

  /**
   * Confirm delete event action
   */
  async function onYesDeleteClick() {
    try {
      await eventService.deleteEvent(eventToDelete);
      setIsDeletePopup(false)
      setEventToDelete("");
      await fetchEvents();
    } catch (error: any) {
      setIsDeletePopup(false)
      setEventToDelete("");
      handleThrowError(error?.message)
    }
  }

  /**
   * Cancel delete event action
   */
  function onNoDeleteClick() {
    setIsDeletePopup(false)
    setEventToDelete("");
  }

  /**
   * Toggle add event popup
   */
  function handleToggleAddEvent() {
    setIsAddEventPopup(true);
  }

  /**
   * Fetch all events
   */
  async function fetchEvents() {
    try {
      const data = await eventService.getAllEvents();
      setAllEvents(data)
    } catch (error: any) {
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

  useEffect(() => {
    fetchEvents()
  }, []);

  return (<>
    {isUploading && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
        <div className="glass-card p-8 rounded-2xl flex flex-col items-center gap-4">
          <ProcessingIcon width={"48"} height={"48"}></ProcessingIcon>
          <p className="text-neutral-300 font-medium">Processing...</p>
        </div>
      </div>
    )}
    <div className='w-full min-h-full flex flex-col gap-6 lg:gap-8 pb-8 p-4 lg:p-8 overflow-y-auto'>
      <SectionTitle title="Manage Events" />
      
      {/* Upcoming event section */}
      <div className='flex flex-col overflow-hidden w-full min-h-[300px] gap-y-4 bg-[#1a1a1a] rounded-xl p-4 lg:p-6 border border-neutral-800'>
        <div className='text-lg lg:text-xl font-bold text-white flex flex-row w-full items-center justify-between'>
          <div>Upcoming Events</div>
        </div>
        <div className='overflow-x-auto overflow-y-hidden gap-x-4 flex flex-row w-full pb-2 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent'>
          <Suspense fallback={<p className="text-neutral-400">Fetching events...</p>}>
            <EventList onDeleteClick={onDeleteClick} allEvents={allEvents} isUpcomingSection={true} />
          </Suspense>
        </div>
      </div>

      {/* Previous event section */}
      <div className='flex flex-col overflow-hidden w-full min-h-[300px] gap-y-4 bg-[#1a1a1a] rounded-xl p-4 lg:p-6 border border-neutral-800'>
        <div className='text-lg lg:text-xl font-bold text-white'>Previous Events</div>
        <div className='overflow-x-auto overflow-y-hidden gap-x-4 flex flex-row w-full pb-2 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent'>
          <Suspense fallback={<p className="text-neutral-400">Fetching events...</p>}>
            <EventList onDeleteClick={onDeleteClick} allEvents={allEvents} isUpcomingSection={false} />
          </Suspense>
        </div>
      </div>

      <div className="flex justify-center lg:justify-start mt-4">
        <PrimaryButton title="Add Event" onBtnClick={handleToggleAddEvent} />
      </div>

      {/* Throw error section */}
      <ThrowAsyncError
        responseError={responseError}
        errorRef={errorRef}
        className={"!bottom-[5%] !left-[50%] !-translate-x-1/2 lg:!left-[20%] lg:!translate-x-0"}
      />

      {/* Delete event section */}
      {isDeletePopup && <>
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30"></div>
        <ConfirmComponent
          message="Are you sure you want to delete this Event?"
          onNoClick={onNoDeleteClick}
          onYesClick={onYesDeleteClick}
        /></>}

      {/* Add event section */}
      {isAddEventPopup &&
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30"></div>
          <AddEventPopup closePopup={() => setIsAddEventPopup(false)} eventService={eventService} fetchEvents={fetchEvents} handleThrowError={handleThrowError} setIsUploading={setIsUploading} />
        </>}
    </div>
  </>

  )
}
