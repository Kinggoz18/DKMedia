import axios from "axios";
import { IResponse } from "../../interfaces/IResponse";
import IContact, { IContactUpdate } from "../../interfaces/Redux/IContact";
import { BACKEND_URL } from "../../config/api";
import { getProtectedRequestConfig } from "../../utils/csrfToken";

export class ContactService {
  apiUrl: string;

  constructor() {
    this.apiUrl = `${BACKEND_URL}/contact`;
  }

  /**
   * Add/Update contact
   * @returns 
   */
  async addContact(data: IContactUpdate) {
    try {
      const response = (await axios.post(`${this.apiUrl}`, data, getProtectedRequestConfig())).data as IResponse;
      if (!response?.success) {
        throw new Error(response.data);
      }
      return response.data as IContact;
    } catch (error: any) {
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  }

  /**
   * Clear contacts
   * @returns 
   */
  async deleteContact() {
    try {
      const response = (await axios.delete(`${this.apiUrl}`, getProtectedRequestConfig())).data as IResponse;
      if (!response?.success) {
        throw new Error(response.data);
      }
      return response.data as string;
    } catch (error: any) {
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  }

  /**
   * Get contact
   * @returns 
   */
  async getContacts() {
    try {
      const response = (await axios.get(`${this.apiUrl}`, getProtectedRequestConfig())).data as IResponse;
      if (!response?.success) {
        throw new Error(response.data);
      }
      return response.data as IContact;
    } catch (error: any) {
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  }

}