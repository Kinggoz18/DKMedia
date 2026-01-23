import axios from "axios";
import IEvent, { IEventUpdate } from "../../interfaces/Redux/IEvent";
import { IResponse } from "../../interfaces/IResponse";
import { BACKEND_URL } from "../../config/api";
import { getProtectedRequestConfig, getProtectedFetchOptions } from "../../utils/csrfToken";

/**
 * Event service class
 */
class EventService {
  apiUrl: string;

  constructor() {
    this.apiUrl = `${BACKEND_URL}/events`;
  }

  /**
   * POST an event
   * @param eventToAdd 
   */
  async addEvent(eventToAdd: IEvent) {
    try {
      const response = (await axios.post(this.apiUrl, eventToAdd, getProtectedRequestConfig())).data as IResponse;
      if (!response.success) {
        throw new Error(response.data);
      }
      return response.data as IEvent;
    } catch (error: any) {
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  }

  /**
   * DELETE an event
   */
  async deleteEvent(eventId: string) {
    try {
      const response = (await axios.delete(`${this.apiUrl}/${eventId}`, getProtectedRequestConfig())).data as IResponse;
      if (!response.success) {
        throw new Error(response.data);
      }
      return response.data as string;
    } catch (error: any) {
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  }

  /**
   * GET all events
   */
  async getAllEvents() {
    try {
      const response = (await axios.get(`${this.apiUrl}`, getProtectedRequestConfig())).data as IResponse;
      if (!response.success) {
        throw new Error(response.data)
      }
      return response.data as [IEvent];
    } catch (error: any) {
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  }

  /**
   * GET an event by its Id
   */
  async getEventById(eventId: string) {
    try {
      const response = (await (axios.get(`${this.apiUrl}/${eventId}`, getProtectedRequestConfig()))).data as IResponse;
      if (!response.success) {
        throw new Error(response.data)
      }
      return response.data as IEvent
    } catch (error: any) {
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  }

  /**
   * GET an event by its Id
   */
  async updateEventById(updateData: IEventUpdate) {
    try {
      const response = (await (axios.put(`${this.apiUrl}`, updateData, getProtectedRequestConfig()))).data as IResponse;
      if (!response.success) {
        throw new Error(response.data)
      }
      return response.data as IEvent
    } catch (error: any) {
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  }


  /**
   * POST a music data to cloudinary
   * @param {*} file
   * @returns
   */
  async saveImageToCloudinary(file: FormData) {
    try {
      const response = await fetch(
        `${this.apiUrl}/upload/image`,
        getProtectedFetchOptions({
          method: "post",
          body: file
        })
      );
      const updatedResponse = await response?.json() as IResponse;
      if (!updatedResponse?.success) {
        throw new Error(updatedResponse?.data?.message ?? updatedResponse?.data?.error ?? updatedResponse?.data)
      }

      return updatedResponse.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  };

  /**
   * UPDATE a music uploaded by a user
   * @param {*} file
   * @returns
   */
  async saveVideoToCloudinary(file: FormData) {
    try {
      const response = await fetch(
        `${this.apiUrl}/upload/video`,
        getProtectedFetchOptions({
          method: "post",
          body: file
        })
      );
      const updatedResponse = await response?.json() as IResponse;
      if (!updatedResponse?.success) {
        throw new Error(updatedResponse?.data?.message ?? updatedResponse?.data?.error ?? updatedResponse?.data)
      }
      return updatedResponse.data;
      // return updatedResponse;
    } catch (error: any) {
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  };

}

export default EventService;