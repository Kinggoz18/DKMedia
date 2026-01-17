import { ArticleService } from "../redux/Article/ArticleService";

export default interface UploadArticleProps {
  closePopup: () => void;
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
  handleThrowError: (errorMsg: string) => void;
  fetchArticles: () => Promise<void>;
  articleService: ArticleService;
}