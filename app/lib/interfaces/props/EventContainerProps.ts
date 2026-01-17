import { EventPriority } from "@/lib/enums/eventPriority";
import IOrganizer from "../IOrganizer";


export default interface EventContainerProps {
  _id?: string;
  title: string;
  date: string;
  image: string;
  priority: EventPriority;
  ticketLink: string;
  organizer: IOrganizer;
}
