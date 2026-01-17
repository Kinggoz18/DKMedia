import axios from "axios";
import { IResponse } from "../../interfaces/IResponse";
import IOrganizer, { IOrganizerUpdate } from "../../interfaces/Redux/IOrganizer";
import { BACKEND_URL } from "../../config/api";
import { getProtectedRequestConfig } from "../../utils/csrfToken";

export default class OrganizerService {
  apiUrl: string;

  constructor() {
    this.apiUrl = `${BACKEND_URL}/organizers`;
  }

  /**
   * POST organizer
   * @param organizerToAdd 
   * @returns 
   */
  async addOrganizer(organizerToAdd: IOrganizer) {
    try {
      const response = (await axios.post(`${this.apiUrl}`, organizerToAdd, getProtectedRequestConfig())).data as IResponse;
      if (!response.success) {
        throw new Error(response.data)
      }
      return response.data as IOrganizer;
    } catch (error: any) {
      console.log({ error })
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  }

  /**
   * DELETE organizer
   * @param organizerToAdd 
   * @returns 
   */
  async deleteOrganizer(id: string) {
    try {
      const response = (await axios.delete(`${this.apiUrl}/${id}`, getProtectedRequestConfig())).data as IResponse;
      if (!response.success) {
        throw new Error(response.data)
      }
      return response.data as string;
    } catch (error: any) {
      console.log({ error })
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  }

  /**
   * GET all organizer
   * @param organizerToAdd 
   * @returns 
   */
  async getAllOrganizer() {
    try {
      const response = (await axios.get(`${this.apiUrl}`, getProtectedRequestConfig())).data as IResponse;
      if (!response.success) {
        throw new Error(response.data)
      }
      return response.data as [IOrganizer];
    } catch (error: any) {
      console.log({ error })
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  }

  /**
   * Get organizer by id
   * @param organizerToAdd 
   * @returns 
   */
  async getOrganizerById(id: string) {
    try {
      const response = (await axios.get(`${this.apiUrl}/${id}`, getProtectedRequestConfig())).data as IResponse;
      if (!response.success) {
        throw new Error(response.data)
      }
      return response.data as IOrganizer;
    } catch (error: any) {
      console.log({ error })
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  }

  /**
   * Get organizer by id
   * @param organizerToAdd 
   * @returns 
   */
  async updateOrganizerById(updateData: IOrganizerUpdate) {
    try {
      const response = (await axios.put(`${this.apiUrl}/`, updateData, getProtectedRequestConfig())).data as IResponse;
      if (!response.success) {
        throw new Error(response.data)
      }
      return response.data as IOrganizer;
    } catch (error: any) {
      console.log({ error })
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  }
}