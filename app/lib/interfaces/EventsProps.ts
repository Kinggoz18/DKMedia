import { EventPriority } from "../enums/eventPriority";
import OrganizerProps from "./OrganizerProps";

export default interface EventsProps {
  _id?: string;
  title: string;
  date: string;
  image: string;
  priority: EventPriority;
  organizer: OrganizerProps;
  isUpcoming: boolean;
  ticketLink: string
  onDeleteClick?: () => void;
}