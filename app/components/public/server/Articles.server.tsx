import AbousUs from '../AbousUs';
import IAboutUs from '@/lib/interfaces/IAboutUs';
import IArticle from '@/lib/interfaces/IArticle';
import { ArticleService } from '@/services/ArticleService';
import Articles from '../Articles';

export default async function ArticlesPage() {
  const articlesService = new ArticleService();
  let articles: IArticle[];;

  try {
    articles = await articlesService.getAllArticle();
  } catch (error) {
    console.error("Error fetching about us:", error);
    return <p>Failed to load Articles. Please try again later.</p>;
  }

  return (
    <Articles
      articles={articles}
    />
  );
}