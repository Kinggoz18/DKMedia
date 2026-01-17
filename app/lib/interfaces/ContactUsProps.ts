
export default interface ContactUsProps {
  _id?: string;
  firstName: string;
  lastName: string;
  subject: string,
  company?: string;
  email: string;
  phone?: string;
  message: string;
  onDeleteClick?: () => void;
  onReplyClick?: () => void;
}