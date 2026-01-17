import { useState, useRef } from "react";
import ProcessingIcon from "./ProcessingIcon";
import ThrowAsyncError, { toggleError } from "./ThrowAsyncError";

interface ReplyInquiryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  inquiryEmail: string;
  originalSubject: string;
  onReplySent: () => void;
  inquiryId: string;
}

export default function ReplyInquiryPopup({
  isOpen,
  onClose,
  inquiryEmail,
  originalSubject,
  onReplySent,
  inquiryId
}: ReplyInquiryPopupProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [responseError, setResponseError] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleThrowError = (errorMsg: string) => {
    setResponseError(errorMsg);
    setTimeout(() => {
      toggleError(errorRef);
    }, 400);
  };

  const handleSendReply = async () => {
    if (!subject.trim() || !message.trim()) {
      return handleThrowError("Subject and message are required");
    }

    setIsSending(true);
    try {
      const response = await fetch(`/api/v1/contact-us/${inquiryId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': localStorage.getItem('csrf_token') || '',
        },
        credentials: 'include',
        body: JSON.stringify({
          subject,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.data || 'Failed to send reply');
      }

      // Reset form
      setSubject("");
      setMessage("");
      onReplySent();
      onClose();
    } catch (error: any) {
      handleThrowError(error?.message || 'Failed to send reply');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    if (!isSending) {
      setSubject("");
      setMessage("");
      setResponseError("");
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={handleClose}></div>
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div 
          className="glass-card rounded-2xl p-6 lg:p-8 w-full max-w-[600px] max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Reply to Inquiry</h2>
              <p className="text-sm text-neutral-400 mt-1">To: {inquiryEmail}</p>
            </div>
            <button
              onClick={handleClose}
              disabled={isSending}
              className="w-10 h-10 rounded-lg bg-neutral-800/50 hover:bg-neutral-700/50 flex items-center justify-center text-neutral-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Original Subject
              </label>
              <div className="px-4 py-2 bg-neutral-800/50 rounded-xl text-neutral-400 text-sm">
                {originalSubject}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Reply Subject <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter reply subject"
                disabled={isSending}
                className="input-modern w-full py-3 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Message <span className="text-red-400">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your reply message"
                rows={8}
                disabled={isSending}
                className="input-modern w-full py-3 px-4 rounded-xl resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handleSendReply}
              disabled={isSending || !subject.trim() || !message.trim()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <ProcessingIcon width="20" height="20" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Send Reply</span>
                </>
              )}
            </button>
            <button
              onClick={handleClose}
              disabled={isSending}
              className="px-6 py-3 bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-300 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>

          <ThrowAsyncError
            responseError={responseError}
            errorRef={errorRef}
            className="!bottom-[10%]"
          />
        </div>
      </div>
    </>
  );
}

