import ArticleProps from "@/lib/interfaces/ArticleProps";

export default function Articles(props: ArticleProps) {
  const {
    title,
    articleLink,
    onDeleteClick,
  } = props;

  return (
    <div className='glass-card rounded-xl overflow-hidden group hover:border-primary-500/30 transition-all duration-300'>
      {/* Icon Header */}
      <div className="h-24 bg-gradient-to-br from-primary-500/20 via-primary-600/10 to-transparent flex items-center justify-center relative">
        <div className="w-14 h-14 rounded-xl bg-neutral-800/80 flex items-center justify-center">
          <svg className="w-7 h-7 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        
        {/* Delete Button */}
        <button 
          onClick={onDeleteClick}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-all text-red-400 hover:text-red-300"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-white line-clamp-2 leading-snug min-h-[2.5rem]">{title}</h3>
        
        <a 
          href={articleLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors group/link"
        >
          <span className="truncate max-w-[180px]">{articleLink}</span>
          <svg className="w-4 h-4 flex-shrink-0 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  )
}
