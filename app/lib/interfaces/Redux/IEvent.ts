import { EventPriority } from "../../enums/eventPriority";
import IOrganizer from "./IOrganizer";

export default interface IEvent {
  _id?: string;
  title: string;
  date: string;
  endTime?: string;
  timezone?: string;
  location?: string;
  image: string;
  priority: EventPriority;
  organizer: IOrganizer;
  ticketLink: string
}

export interface IEventUpdate {
  id: string;
  title?: string;
  date?: string;
  endTime?: string;
  timezone?: string;
  location?: string;
  image?: string;
  priorit?: EventPriority;
  organizer?: IOrganizer;
  ticketLink?: string;
}