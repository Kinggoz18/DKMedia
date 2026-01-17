
export default interface ArticleProps {
  _id?: string;
  title: string;
  articleLink: string;
  onDeleteClick?: () => void;
}