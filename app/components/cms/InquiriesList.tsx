import IContactUs from "@/lib/interfaces/Redux/IContactUs";
import ContactUsInquiry from "./ContactUsInquiry";

interface ContactUsInquiriesProps {
  allInquiries: IContactUs[]
  onDeleteClick: (id: string) => void;
  onReplyClick?: (inquiry: IContactUs) => void;
}

export function ContactUsInquiriesList(props: ContactUsInquiriesProps) {
  const {
    allInquiries,
    onDeleteClick,
    onReplyClick,
  } = props;

  // Ensure allInquiries is always an array to prevent crashes
  const safeInquiries = Array.isArray(allInquiries) ? allInquiries : [];

  return safeInquiries.map((element) => (
    <ContactUsInquiry
      key={element?._id}
      _id={element?._id}
      lastName={element?.lastName}
      firstName={element?.firstName}
      subject={element?.subject}
      company={element?.company}
      email={element?.email}
      phone={element?.phone}
      message={element?.message}
      onDeleteClick={() => onDeleteClick(element?._id ?? "")}
      onReplyClick={onReplyClick ? () => onReplyClick(element) : undefined}
    />
  ))

}