import axios from "axios";
import IEvent, { IEventUpdate } from "@/lib/interfaces/IEvent";
import { IResponse } from "@/lib/interfaces/IResponse";
import { BACKEND_URL } from "@/lib/config/api";
/**
 * Event service class
 */
class EventService {
  apiUrl: string;

  constructor() {
    this.apiUrl = `${BACKEND_URL}/events`;
  }


  /**
   * GET all events
   */
  async getAllEvents() {
    try {
      const response = (await axios.get(`${this.apiUrl}`)).data as IResponse;
      if (!response.success) {
        throw new Error(response.data)
      }
      return response.data as IEvent[];
    } catch (error: any) {
      throw new Error(error?.response?.data?.data ?? error?.response?.data?.message ?? error?.message ?? error)
    }
  }

  /**
   * GET an event by its Id
   */
  async getEventById(eventId: string) {
    try {
      const response = (await (axios.get(`${this.apiUrl}/${eventId}`))).data as IResponse;
      if (!response.success) {
        throw new Error(response.data)
      }
      return response.data as IEvent
    } catch (error: any) {
      throw new Error(error?.response?.data?.data ?? error?.response?.data?.message ?? error?.message ?? error)
    }
  }


}

export default EventService;