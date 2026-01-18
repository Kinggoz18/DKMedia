import { Suspense, useEffect, useState } from "react";
import ConfirmComponent from '@/components/cms/ConfirmComponent';
import EventService from '@/lib/redux/Events/EventService';
import { EventList } from '@/components/cms/EventList';
import IEvent from '@/lib/interfaces/Redux/IEvent';
import { EventPriority } from '@/lib/enums/eventPriority';
import SubscriptionService from '@/lib/redux/Subscription/SubscriptionService';
import EmailStatsService from '@/services/EmailStatsService';


export default function HomeSection() {
  const [user, setUser] = useState<any>(null);
  const eventService = new EventService();
  const subscriptionService = new SubscriptionService();
  const emailStatsService = new EmailStatsService();
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [dailyEmailsLeft, setDailyEmailsLeft] = useState(0);

  // Get user from localStorage only on client
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userData = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") ?? "") : "";
      setUser(userData);
    }
  }, []);

  const [isDeletePopup, setIsDeletePopup] = useState(false);
  const [eventToDelete, setEventToDelete] = useState("");
  // const [isAddEventPopup, setIsAddEventPopup] = useState(false);
  const [allEvents, setAllEvents] = useState<[IEvent]>([{
    _id: "",
    title: "",
    date: "",
    image: "",
    priority: EventPriority.Regular,
    organizer: {
      name: "",
      logo: "",
    },
    ticketLink: "",
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
      console.error('Failed to delete event:', error);
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
   * Fetch all events
   */
  async function fetchEvents() {
    try {
      const data = await eventService.getAllEvents();
      setAllEvents(data)
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  /**
   * Fetch total subscribers count
   */
  async function fetchSubscriberCount() {
    try {
      const response = await subscriptionService.getAllSubscription(1, 1);
      setTotalSubscribers(response.pagination.total);
    } catch (error: any) {
      console.error('Failed to fetch subscriber count:', error);
      setTotalSubscribers(0);
    }
  }

  /**
   * Fetch email usage statistics
   */
  async function fetchEmailStats() {
    try {
      const stats = await emailStatsService.getEmailStats();
      setDailyEmailsLeft(stats.remaining);
    } catch (error: any) {
      console.error('Failed to fetch email stats:', error);
      setDailyEmailsLeft(0);
    }
  }

  useEffect(() => {
    fetchEvents();
    fetchSubscriberCount();
    fetchEmailStats();
  }, []);

  // Calculate total events
  const totalEvents = Array.isArray(allEvents) ? allEvents.length : 0;

  return (
    <div className='w-full min-h-full flex flex-col gap-6 lg:gap-8 pb-8 p-4 lg:p-8 overflow-y-auto'>
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className='text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent'>
          Welcome back, {user?.displayName}
        </h1>
        <p className='text-base lg:text-lg text-neutral-500'>Manage your events and content from here</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 lg:p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalSubscribers}</p>
              <p className="text-xs text-neutral-500">Number of subscribers</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 lg:p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{Array.isArray(allEvents) ? allEvents.filter(e => new Date(e.date).getTime() > new Date().getTime()).length : 0}</p>
              <p className="text-xs text-neutral-500">Upcoming events</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 lg:p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{dailyEmailsLeft}</p>
              <p className="text-xs text-neutral-500">Daily email left</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 lg:p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalEvents}</p>
              <p className="text-xs text-neutral-500">Total events</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Upcoming event section */}
      <div className='glass-card flex flex-col w-full min-h-[320px] gap-y-4 rounded-xl p-5 lg:p-6'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg lg:text-xl font-bold text-white'>Upcoming Events</h2>
          <span className="text-sm text-neutral-500">{Array.isArray(allEvents) ? allEvents.filter(e => new Date(e.date).getTime() > new Date().getTime()).length : 0} events</span>
        </div>
        <div className='overflow-x-auto gap-x-4 flex flex-row w-full pb-2 scrollbar-thin'>
          <Suspense fallback={<p className="text-neutral-400">Fetching events...</p>}>
            <EventList onDeleteClick={onDeleteClick} allEvents={allEvents} isUpcomingSection={true} />
          </Suspense>
        </div>
      </div>

      {/* Previous event section */}
      <div className='glass-card flex flex-col w-full min-h-[320px] gap-y-4 rounded-xl p-5 lg:p-6'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg lg:text-xl font-bold text-white'>Previous Events</h2>
        </div>
        <div className='overflow-x-auto gap-x-4 flex flex-row w-full pb-2 scrollbar-thin'>
          <Suspense fallback={<p className="text-neutral-400">Fetching events...</p>}>
            <EventList onDeleteClick={onDeleteClick} allEvents={allEvents} isUpcomingSection={false} />
          </Suspense>
        </div>
      </div>

      {isDeletePopup && <>
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30"></div>
        <ConfirmComponent
          message="Are you sure you want to delete this Event?"
          onNoClick={onNoDeleteClick}
          onYesClick={onYesDeleteClick}
        /></>}
    </div>
  )
}
