import AbousUs from '../AbousUs';
import IAboutUs from '@/lib/interfaces/IAboutUs';
import IArticle from '@/lib/interfaces/IArticle';
import { ArticleService } from '@/services/ArticleService';
import Articles from '../Articles';

export default async function ArticlesPage() {
  const articlesService = new ArticleService();
  let articles: IArticle[] = [];

  try {
    const response = await articlesService.getAllArticle(1, 100); // Get first 100 for public page
    // Handle both old format (array) and new format (object with articles and pagination)
    if (Array.isArray(response)) {
      articles = response;
    } else {
      articles = response.articles;
    }
  } catch (error) {
    console.error("Error fetching articles:", error);
    return <p>Failed to load Articles. Please try again later.</p>;
  }

  return (
    <Articles
      articles={articles}
    />
  );
}