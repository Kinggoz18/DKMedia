import { useEffect, useRef, useState } from "react";
import Articles from '@/components/cms/Articles';
import PrimaryButton from '@/components/cms/PrimaryButton';
import SectionTitle from '@/components/cms/SectionTitle';
import ConfirmComponent from '@/components/cms/ConfirmComponent';
import UploadArticlePopup from '@/components/cms/UploadArticlePopup';
import IArticle from '@/lib/interfaces/Redux/IArticle';
import { ArticleService } from '@/lib/redux/Article/ArticleService';
import ThrowAsyncError, { toggleError } from '@/components/cms/ThrowAsyncError';
import ProcessingIcon from '@/components/cms/ProcessingIcon';

interface ArticlesListProps {
  allArticles: IArticle[],
  onDeleteClick: (id: string) => void
}

/**
* Render articles
* @returns 
*/
function ArticlesList(props: ArticlesListProps) {
  const { allArticles, onDeleteClick } = props;

  // Ensure allArticles is always an array to prevent crashes
  const safeArticles = Array.isArray(allArticles) ? allArticles : [];

  return safeArticles.map((element, index) => (
    <Articles
      key={index}
      _id={element?._id}
      articleLink={element?.link}
      onDeleteClick={() => onDeleteClick(element?._id ?? "")}
      title={element?.title}
    />
  ))
}

export default function ManageMedia() {
  const articleService = new ArticleService();
  const [isDeletePopup, setIsDeletePopup] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState("");
  const [isUploadArticlePopup, setIsUploadArticlePopup] = useState(false);


  const [isUploading, setIsUploading] = useState(false);

  const errorRef = useRef<HTMLDivElement>(null);
  const [responseError, setResponseError] = useState("");

  const [articleData, setArticleData] = useState<IArticle[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);

  /**
   * Trigger delete popup
   */
  function onDeleteClick(id: string) {
    if (!id)
      throw new Error("Id is missing");

    setIsDeletePopup(true);
    setArticleToDelete(id);
  }

  /**
   * Confirm delete article action
   */
  async function onYesDeleteClick() {
    setIsUploading(true);
    try {
      await articleService.deleteArticle(articleToDelete);
      setIsDeletePopup(false);
      setArticleToDelete("");
      // If we're on the last page and it becomes empty after deletion, go to previous page
      if (currentPage > 1 && safeArticles.length === 1) {
        setCurrentPage(currentPage - 1);
      } else {
        await fetchAllArticles(currentPage);
      }
      setIsUploading(false);
    } catch (error: any) {
      setIsDeletePopup(false);
      setArticleToDelete("");
      setIsUploading(false);
      handleThrowError(error?.message || 'Failed to delete article');
    }
  }

  /**
   * Cancel delete article action
   */
  function onNoDeleteClick() {
    setIsDeletePopup(false)
    setArticleToDelete("");
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
   * Upload article
   */
  function onUploadArticleClick() {
    setIsUploadArticlePopup(true)
  }

  /**
   * Fetch all articles
   */
  async function fetchAllArticles(page: number = 1) {
    try {
      const response = await articleService.getAllArticle(page, itemsPerPage);
      // Handle both old format (array) and new format (object with articles and pagination)
      if (Array.isArray(response)) {
        setArticleData(response);
        setTotalArticles(response.length);
        setTotalPages(1);
      } else {
        setArticleData(response.articles);
        setTotalArticles(response.pagination.total);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (error: any) {
      console.error('Error fetching articles:', error);
      handleThrowError(error?.message || 'Failed to fetch articles');
      setArticleData([]);
      setTotalArticles(0);
      setTotalPages(1);
    }
  }

  useEffect(() => {
    fetchAllArticles(currentPage);
  }, [currentPage]);

  // Filter out any articles with empty _id (placeholder data)
  const safeArticles = Array.isArray(articleData) 
    ? articleData.filter(article => article?._id && article._id !== "")
    : [];

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
        <SectionTitle title="Manage Articles" />

        <div className='glass-card flex flex-col w-full flex-1 min-h-[400px] gap-y-4 rounded-xl p-5 lg:p-6'>
          <div className='flex items-center justify-between mb-2'>
            <h2 className='text-lg lg:text-xl font-bold text-white'>Published Articles</h2>
            <span className="text-sm text-neutral-500">{totalArticles} articles</span>
          </div>
          {safeArticles.length > 0 ? (
            <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto flex-1 pb-4 scrollbar-thin'>
              <ArticlesList allArticles={safeArticles} onDeleteClick={onDeleteClick} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-4">
              <div className="w-20 h-20 rounded-full bg-neutral-800/50 flex items-center justify-center">
                <svg className="w-10 h-10 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <p>No articles published yet</p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-800">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-neutral-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-700 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-neutral-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-neutral-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-700 transition-colors"
            >
              Next
            </button>
          </div>
        )}

        <div className="flex justify-center lg:justify-start">
          <PrimaryButton title="Add Article" onBtnClick={onUploadArticleClick} />
        </div>

        {isDeletePopup && <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30"></div>
          <ConfirmComponent
            message="Are you sure you want to delete this article?"
            onNoClick={onNoDeleteClick}
            onYesClick={onYesDeleteClick}
          /></>}

        {isUploadArticlePopup &&
          <>
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30"></div>
            <UploadArticlePopup
              closePopup={() => setIsUploadArticlePopup(false)}
              setIsUploading={setIsUploading}
              handleThrowError={handleThrowError}
              fetchArticles={fetchAllArticles}
              articleService={articleService}
            />
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
