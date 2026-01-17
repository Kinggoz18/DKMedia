import { useState } from "react"
import UploadArticleProps from "@/lib/interfaces/UploadArticleProps";
import IArticle from "@/lib/interfaces/Redux/IArticle";

export default function UploadArticlePopup(props: UploadArticleProps) {
  const { closePopup,
    setIsUploading,
    handleThrowError,
    fetchArticles,
    articleService, } = props;

  const [articleTitle, setArticleTitle] = useState("");
  const [articleLink, setArticleLink] = useState("");

  /**
   * Upload the article
   * @returns 
   */
  async function onUploadClick() {
    if (!articleTitle && !articleLink) {
      return handleThrowError("Please fill in all the required filleds.")
    } else {
      try {
        if (!isValidURL(articleLink)) {
          return handleThrowError("Please enter a valid url")
        }

        setIsUploading(true)
        const data: IArticle = {
          title: articleTitle,
          link: articleLink,
        }
        const newOrganizer = await articleService.addArticle(data);
        if (!newOrganizer || !newOrganizer?._id) {
          throw new Error("Something went wrong while uploading the media")
        }

        setArticleTitle("")
        setArticleLink("")
        setIsUploading(false);
        await fetchArticles();
        closePopup()
      } catch (error: any) {
        handleThrowError(error?.message ?? error);
        setArticleTitle("")
        setArticleLink("")
        setIsUploading(false);
        closePopup()
      }
    }
    closePopup()
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

  return (
    <div className="fixed inset-0 flex items-start justify-center z-40 p-4 pt-8 overflow-y-auto">
      <div className="relative w-full max-w-[450px] glass-card rounded-2xl text-white animate-fade-up animate-duration-300">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={closePopup}
            className="w-10 h-10 rounded-lg bg-neutral-800/50 hover:bg-neutral-700/50 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-neutral-800/50">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            Upload Article
          </h2>
          <p className="text-neutral-500 text-sm mt-1">Add a new article link</p>
        </div>

        <div className="flex flex-col gap-y-5 p-6">
          <div className="flex flex-col gap-y-2">
            <label className="font-medium text-neutral-300 text-sm">Article Title</label>
            <input
              type="text"
              placeholder="Enter article title"
              value={articleTitle}
              onChange={(e) => setArticleTitle(e.target.value)}
              className="input-modern py-3 px-4 w-full rounded-xl font-medium"
            />
          </div>

          <div className="flex flex-col gap-y-2">
            <label className="font-medium text-neutral-300 text-sm">Article Link</label>
            <input
              type="url"
              placeholder="https://..."
              value={articleLink}
              onChange={(e) => setArticleLink(e.target.value)}
              className="input-modern py-3 px-4 w-full rounded-xl font-medium"
            />
          </div>

          <button 
            onClick={onUploadClick}
            className="w-full py-4 mt-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-500 text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5"
          >
            Upload Article
          </button>
        </div>
      </div>
    </div>
  )
}
