import { Suspense, useEffect, useRef, useState } from "react";
import ConfirmComponent from '@/components/cms/ConfirmComponent';
import SubscriptionList from '@/components/cms/SubscriptionList';
import SubscriptionService from '@/lib/redux/Subscription/SubscriptionService';
import NewsletterHistoryService from '@/lib/redux/NewsletterHistory/NewsletterHistoryService';
import { ISubscription } from '@/lib/interfaces/Redux/ISubscription';
import { INewsletterHistory } from '@/lib/interfaces/Redux/INewsletterHistory';
import ThrowAsyncError, { toggleError } from '@/components/cms/ThrowAsyncError';
import SectionTitle from '@/components/cms/SectionTitle';
import ProcessingIcon from '@/components/cms/ProcessingIcon';

type ViewMode = 'subscribers' | 'history';

export default function Subscriptions() {
  const subscriptionService = new SubscriptionService();
  const newsletterHistoryService = new NewsletterHistoryService();

  const [viewMode, setViewMode] = useState<ViewMode>('subscribers');
  const [isDeletePopup, setIsDeletePopup] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState("");
  const [isNewsletterPopup, setIsNewsletterPopup] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [newsletterSubject, setNewsletterSubject] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);
  const [responseError, setResponseError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [allSubscriptions, setAllSubscriptions] = useState<[ISubscription]>([{
    _id: "",
    firstName: "",
    lastName: "",
    email: "",
  }]);

  // Newsletter history state
  const [newsletterHistory, setNewsletterHistory] = useState<INewsletterHistory[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSubscriberPage, setCurrentSubscriberPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalHistory, setTotalHistory] = useState(0);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [totalSubscriberPages, setTotalSubscriberPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

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
   * Trigger delete popup
   */
  async function onDeleteClick(id: string) {
    if (!id)
      throw new Error("Id is missing");

    setIsDeletePopup(true);
    setSubscriptionToDelete(id);
  }

  /**
   * Confirm delete subscription action
   */
  async function onYesDeleteClick() {
    const response = await subscriptionService.deleteSubscription(subscriptionToDelete);
    setSubscriptionToDelete("");

    if (response !== "Subscription deleted") {
      handleThrowError("Failed to delete subscription")
    }
    // If we're on the last page and it becomes empty after deletion, go to previous page
    if (currentSubscriberPage > 1 && safeSubscriptions.length === 1) {
      setCurrentSubscriberPage(currentSubscriberPage - 1);
    } else {
      await fetchSubscriptions(currentSubscriberPage);
    }
    setIsDeletePopup(false)
  }

  /**
   * Cancel delete subscription action
   */
  function onNoDeleteClick() {
    setIsDeletePopup(false)
    setSubscriptionToDelete("");
  }


  async function fetchSubscriptions(page: number = 1) {
    try {
      const response = await subscriptionService.getAllSubscription(page, itemsPerPage);
      setAllSubscriptions(response.subscriptions);
      setTotalSubscribers(response.pagination.total);
      setTotalSubscriberPages(response.pagination.totalPages);
    } catch (error: any) {
      handleThrowError(error?.message || "Failed to fetch subscriptions");
    }
  }

  async function fetchNewsletterHistory(page: number = 1) {
    try {
      const response = await newsletterHistoryService.getNewsletterHistory(page, itemsPerPage);
      setNewsletterHistory(response.history);
      setTotalPages(response.pagination.totalPages);
      setTotalHistory(response.pagination.total);
    } catch (error: any) {
      handleThrowError(error?.message || "Failed to fetch newsletter history");
    }
  }

  useEffect(() => {
    fetchSubscriptions(currentSubscriberPage)
  }, [currentSubscriberPage])

  useEffect(() => {
    if (viewMode === 'history') {
      fetchNewsletterHistory(currentPage);
    }
  }, [viewMode, currentPage])

  const safeSubscriptions = Array.isArray(allSubscriptions) && allSubscriptions.length > 0 && allSubscriptions[0]?._id !== "" ? allSubscriptions : [];

  // Filter subscriptions by search query
  const filteredSubscriptions = safeSubscriptions.filter(subscription => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const fullName = `${subscription?.firstName || ''} ${subscription?.lastName || ''}`.toLowerCase();
    return fullName.includes(query) || 
           subscription?.firstName?.toLowerCase().includes(query) || 
           subscription?.lastName?.toLowerCase().includes(query) ||
           subscription?.email?.toLowerCase().includes(query);
  });

  /**
   * Send newsletter to all subscribers
   */
  async function handleSendNewsletter() {
    if (!newsletterSubject.trim() || !newsletterMessage.trim()) {
      handleThrowError("Please fill in both subject and message");
      return;
    }

    // Validate scheduled time if scheduling
    if (isScheduled) {
      if (!scheduledDateTime.trim()) {
        handleThrowError("Please select a scheduled date and time");
        return;
      }
      const scheduleDate = new Date(scheduledDateTime);
      const now = new Date();
      if (scheduleDate <= now) {
        handleThrowError("Scheduled time must be in the future");
        return;
      }
    }

    setIsSending(true);
    try {
      let message: string;
      
      if (isScheduled) {
        // Schedule bulk newsletter
        message = await subscriptionService.scheduleBulkNewsletter(
          newsletterSubject,
          newsletterMessage,
          scheduledDateTime
        ) as string;
        
        // Save to newsletter history with 'scheduled' status (we'll treat it as 'sent' for history)
        try {
          await newsletterHistoryService.addNewsletterHistory(
            newsletterSubject,
            newsletterMessage,
            totalSubscribers,
            'sent', // Treat scheduled as sent in history
            undefined
          );
        } catch (historyError: any) {
          console.error("Failed to save newsletter history:", historyError);
        }
        
        setSuccessMessage(message);
      } else {
        // Send bulk newsletter immediately
        message = await subscriptionService.sendBulkNewsletter(
          newsletterSubject,
          newsletterMessage
        ) as string;
        
        // Extract numbers from message for status determination
        const sentMatch = message.match(/(\d+)\s*emails?\s*sent/i);
        const scheduledMatch = message.match(/(\d+)\s*scheduled/i);
        const sentCount = sentMatch ? parseInt(sentMatch[1], 10) : 0;
        const scheduledCount = scheduledMatch ? parseInt(scheduledMatch[1], 10) : 0;
        
        // Determine status based on result
        const status = sentCount > 0 ? 'sent' : 'failed';
        const errorMessage = scheduledCount > 0 
          ? `${sentCount} sent, ${scheduledCount} scheduled for next day due to daily limit`
          : undefined;
        
        // Save to newsletter history
        try {
          await newsletterHistoryService.addNewsletterHistory(
            newsletterSubject,
            newsletterMessage,
            totalSubscribers,
            status,
            errorMessage
          );
        } catch (historyError: any) {
          console.error("Failed to save newsletter history:", historyError);
        }
        
        setSuccessMessage(message);
      }
      
      // Reset form
      setNewsletterSubject("");
      setNewsletterMessage("");
      setIsScheduled(false);
      setScheduledDateTime("");
      setIsNewsletterPopup(false);
      
      // Refresh history if on history view
      if (viewMode === 'history') {
        await fetchNewsletterHistory(currentPage);
      }
      
      // Show success briefly
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error: any) {
      // Save failed attempt to history
      try {
        await newsletterHistoryService.addNewsletterHistory(
          newsletterSubject,
          newsletterMessage,
          totalSubscribers,
          'failed',
          error?.message || "Failed to send newsletter"
        );
      } catch (historyError) {
        console.error("Failed to save newsletter history:", historyError);
      }
      handleThrowError(error?.message || "Failed to send newsletter");
    } finally {
      setIsSending(false);
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  return (
    <>
      {isSending && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
          <div className="glass-card p-8 rounded-2xl flex flex-col items-center gap-4">
            <ProcessingIcon width={"48"} height={"48"}></ProcessingIcon>
            <p className="text-neutral-300 font-medium">Sending newsletter...</p>
          </div>
        </div>
      )}

      <div className='w-full min-h-full flex flex-col gap-6 lg:gap-8 pb-8 p-4 lg:p-8 overflow-y-auto'>
        <SectionTitle title="Manage Subscriptions" />

        {/* Success Message */}
        {successMessage && (
          <div className="glass-card p-4 rounded-xl border border-green-500/30 bg-green-500/10 flex items-center gap-3">
            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-400 font-medium">{successMessage}</span>
          </div>
        )}

        {/* Stats and Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{totalSubscribers}</p>
                <p className="text-sm text-neutral-500">Total Subscribers</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-5 md:col-span-2">
            <div className="flex items-center justify-between h-full">
              <div>
                <h3 className="text-lg font-semibold text-white">Send Newsletter</h3>
                <p className="text-sm text-neutral-500">Reach all your subscribers at once</p>
              </div>
                <button
                  onClick={() => setIsNewsletterPopup(true)}
                  disabled={totalSubscribers === 0}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Compose Newsletter
              </button>
            </div>
          </div>
        </div>

        {/* Toggle Section */}
        <div className='glass-card flex flex-col w-full gap-4 rounded-xl p-5 lg:p-6'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
            <h2 className='text-lg lg:text-xl font-bold text-white'>
              {viewMode === 'subscribers' ? 'Subscriber List' : 'Newsletter History'}
            </h2>
            
            {/* Toggle Buttons */}
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setViewMode('subscribers')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  viewMode === 'subscribers'
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-300'
                }`}
              >
                Subscribers
              </button>
              <button
                onClick={() => setViewMode('history')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  viewMode === 'history'
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-300'
                }`}
              >
                History
              </button>
            </div>
          </div>

          {/* Search Bar for Subscribers */}
          {viewMode === 'subscribers' && (
            <div className="relative w-full">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or email..."
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
          )}

          {/* Content Area */}
          <div className='w-full flex flex-col gap-y-3 overflow-y-auto flex-1 min-h-[400px] pb-4 scrollbar-thin'>
            {viewMode === 'subscribers' ? (
              // Subscribers List
              filteredSubscriptions.length > 0 ? (
                <>
                  <Suspense fallback={<p className="text-neutral-400">Fetching subscriptions...</p>}>
                    <SubscriptionList
                      allSubscriptions={filteredSubscriptions}
                      onDeleteClick={onDeleteClick}
                    />
                  </Suspense>
                  {searchQuery && filteredSubscriptions.length < safeSubscriptions.length && (
                    <div className="text-sm text-neutral-500 text-center py-2">
                      Showing {filteredSubscriptions.length} of {safeSubscriptions.length} subscribers
                    </div>
                  )}

                  {/* Pagination */}
                  {totalSubscriberPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-neutral-800/50">
                      <span className="text-sm text-neutral-400">
                        Showing {((currentSubscriberPage - 1) * itemsPerPage) + 1} to {Math.min(currentSubscriberPage * itemsPerPage, totalSubscribers)} of {totalSubscribers} subscribers
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentSubscriberPage(prev => Math.max(1, prev - 1))}
                          disabled={currentSubscriberPage === 1}
                          className="px-4 py-2 rounded-xl bg-neutral-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-700 transition-colors text-sm font-medium"
                        >
                          Previous
                        </button>
                        <span className="px-4 py-2 rounded-xl bg-neutral-800/50 text-neutral-300 text-sm font-medium flex items-center">
                          Page {currentSubscriberPage} of {totalSubscriberPages}
                        </span>
                        <button
                          onClick={() => setCurrentSubscriberPage(prev => Math.min(totalSubscriberPages, prev + 1))}
                          disabled={currentSubscriberPage === totalSubscriberPages}
                          className="px-4 py-2 rounded-xl bg-neutral-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-700 transition-colors text-sm font-medium"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-4">
                  <div className="w-20 h-20 rounded-full bg-neutral-800/50 flex items-center justify-center">
                    <svg className="w-10 h-10 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p>{searchQuery ? `No subscribers found matching "${searchQuery}"` : "No subscribers yet"}</p>
                </div>
              )
            ) : (
              // Newsletter History
              newsletterHistory.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {newsletterHistory.map((item) => (
                      <div
                        key={item._id}
                        className="glass-card p-4 lg:p-5 rounded-xl border border-neutral-700/50 hover:border-primary-500/30 transition-all duration-300"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-base lg:text-lg font-semibold text-white truncate">{item.subject}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.status === 'sent' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {item.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-neutral-400 line-clamp-2 mb-3">{item.message}</p>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {item.recipientsCount} recipients
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatDate(item.sentAt)}
                              </span>
                            </div>
                            {item.errorMessage && (
                              <p className="text-xs text-red-400 mt-2">Error: {item.errorMessage}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-neutral-800/50">
                      <span className="text-sm text-neutral-400">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalHistory)} of {totalHistory} newsletters
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 rounded-xl bg-neutral-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-700 transition-colors text-sm font-medium"
                        >
                          Previous
                        </button>
                        <span className="px-4 py-2 rounded-xl bg-neutral-800/50 text-neutral-300 text-sm font-medium flex items-center">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 rounded-xl bg-neutral-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-700 transition-colors text-sm font-medium"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-4">
                  <div className="w-20 h-20 rounded-full bg-neutral-800/50 flex items-center justify-center">
                    <svg className="w-10 h-10 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <p>No newsletter history yet</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Delete Confirmation */}
      {isDeletePopup && <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30"></div>
        <ConfirmComponent
          message="Are you sure you want to delete this subscription?"
          onNoClick={onNoDeleteClick}
          onYesClick={onYesDeleteClick}
        /></>}

        {/* Newsletter Compose Popup */}
        {isNewsletterPopup && <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30"></div>
          <div className="fixed inset-0 flex items-center justify-center z-40 p-4">
            <div className="glass-card w-full max-w-[600px] rounded-2xl animate-fade-up animate-duration-300">
              <div className="px-6 pt-6 pb-4 border-b border-neutral-800/50 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Compose Newsletter</h2>
                  <p className="text-neutral-500 text-sm mt-1">Send to {totalSubscribers} subscribers</p>
                </div>
                <button
                  onClick={() => setIsNewsletterPopup(false)}
                  className="w-10 h-10 rounded-lg bg-neutral-800/50 hover:bg-neutral-700/50 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300">Subject</label>
                  <input
                    type="text"
                    value={newsletterSubject}
                    onChange={(e) => setNewsletterSubject(e.target.value)}
                    placeholder="Enter newsletter subject..."
                    className="input-modern w-full py-3 px-4 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300">Message</label>
                  <textarea
                    value={newsletterMessage}
                    onChange={(e) => setNewsletterMessage(e.target.value)}
                    placeholder="Write your newsletter content here..."
                    rows={8}
                    className="input-modern w-full py-3 px-4 rounded-xl resize-none"
                  />
                </div>

                {/* Schedule Option */}
                <div className="space-y-3 pt-2 border-t border-neutral-800/50">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isScheduled}
                      onChange={(e) => setIsScheduled(e.target.checked)}
                      className="w-5 h-5 rounded border-neutral-700 bg-neutral-800 text-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-neutral-300">Schedule for later</span>
                  </label>
                  
                  {isScheduled && (
                    <div className="space-y-2 pl-8">
                      <label className="text-sm font-medium text-neutral-300">Scheduled Date & Time</label>
                      <input
                        type="datetime-local"
                        value={scheduledDateTime}
                        onChange={(e) => setScheduledDateTime(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        className="input-modern w-full py-3 px-4 rounded-xl"
                      />
                      <p className="text-xs text-neutral-500">
                        Emails will be sent at the scheduled time using the email queue
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={handleSendNewsletter}
                    disabled={isSending || (isScheduled && !scheduledDateTime.trim())}
                    className="flex-1 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isScheduled ? 'Schedule Newsletter' : 'Send Newsletter'}
                  </button>
                  <button
                    onClick={() => setIsNewsletterPopup(false)}
                    className="px-8 py-4 bg-neutral-700/50 hover:bg-neutral-600/50 text-neutral-200 rounded-xl font-semibold border border-neutral-600/50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
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
