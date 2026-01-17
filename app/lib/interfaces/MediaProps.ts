import { mediaType } from "../enums/mediaType";
import IEvent from "./Redux/IEvent";

export default interface MediaProps {
  _id?: string;
  mediaType: mediaType;
  mediaLink: string;
  eventTag?: IEvent;
  hashtags?: string[];
  caption?: string;
  onDeleteClick?: () => void;
}