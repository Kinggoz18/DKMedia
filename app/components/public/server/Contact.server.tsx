import IContact from '@/lib/interfaces/IContact';
import Contact from '../Contact';

interface ContactPageProps {
  contact: IContact;
}

export default function ContactPage({ contact }: ContactPageProps) {
  if (!contact) {
    return <p>Failed to load contacts. Please try again later.</p>;
  }

  return (
    <Contact contact={contact} />
  );
}
