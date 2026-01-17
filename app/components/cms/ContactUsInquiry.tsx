import { useState } from "react";
import ContactUsProps from "@/lib/interfaces/ContactUsProps";

export default function ContactUsInquiry(props: ContactUsProps) {
  const {
    firstName,
    lastName,
    subject,
    company,
    email,
    phone,
    message, 
    onDeleteClick,
    onReplyClick
  } = props;

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="glass-card rounded-xl overflow-hidden transition-all duration-300 hover:border-primary-500/30 group">
      {/* Header */}
      <div className="p-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {firstName?.charAt(0)?.toUpperCase() || '?'}{lastName?.charAt(0)?.toUpperCase() || ''}
          </div>
          
          {/* Info */}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white truncate">{firstName} {lastName}</h3>
            <div className="flex items-center gap-2 text-sm text-neutral-400 flex-wrap">
              <span className="flex items-center gap-1 truncate">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="truncate">{email}</span>
              </span>
              {phone && (
                <span className="flex items-center gap-1">
                  <span className="text-neutral-600">•</span>
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onReplyClick && (
            <button 
              onClick={onReplyClick}
              className="w-9 h-9 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 flex items-center justify-center transition-all text-primary-400 hover:text-primary-300 flex-shrink-0"
              title="Reply to inquiry"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
          )}
          {onDeleteClick && (
            <button 
              onClick={onDeleteClick}
              className="w-9 h-9 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-all text-red-400 hover:text-red-300 flex-shrink-0"
              title="Delete inquiry"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Subject & Company */}
      <div className="px-4 pb-3 flex flex-wrap gap-2">
        <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-xs font-medium">
          {subject}
        </span>
        {company && (
          <span className="px-3 py-1 bg-neutral-700/50 text-neutral-300 rounded-full text-xs font-medium flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {company}
          </span>
        )}
      </div>

      {/* Message Toggle */}
      <div className="border-t border-neutral-800/50">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-neutral-400 hover:text-primary-400 hover:bg-neutral-800/30 transition-colors"
        >
          <span>{isExpanded ? 'Hide Message' : 'View Message'}</span>
          <svg className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {/* Expandable Message */}
        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[500px]' : 'max-h-0'}`}>
          <div className="p-4 pt-0 text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap">
            {message}
          </div>
        </div>
      </div>
    </div>
  )
}
