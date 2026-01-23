import { mediaType } from "../enums/mediaType";
import IEvent from "./IEvent";

export default interface IMedia {
  _id?: string;
  mediaType: mediaType;
  mediaLink: string;
  eventTag?: IEvent;
  hashtags?: string[];
  caption?: string;
}