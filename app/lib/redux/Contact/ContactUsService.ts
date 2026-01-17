import axios from "axios";
import { IResponse } from "../../interfaces/IResponse";
import IContactUs from "../../interfaces/Redux/IContactUs";
import { BACKEND_URL } from "../../config/api";
import { getProtectedRequestConfig } from "../../utils/csrfToken";

export class ContactUsService {
  apiUrl: string;

  constructor() {
    this.apiUrl = `${BACKEND_URL}/contact-us`;
  }

  /**
   * Delete a contact us inquiry
   * @param id 
   * @returns 
   */
  async deleteContactUsInquiry(id: string) {
    try {
      const response = (await axios.delete(`${this.apiUrl}/${id}`, getProtectedRequestConfig())).data as IResponse;
      if (!response?.success) {
        throw new Error(response?.data);
      }
      return response.data as string
    } catch (error: any) {
      throw new Error(error?.message ?? error)
    }
  }

  /**
   * Get all contact us inquiry
   * @returns 
   */
  async getAllContactUsInquiry() {
    try {
      const response = (await axios.get(`${this.apiUrl}`, getProtectedRequestConfig())).data as IResponse;
      if (!response?.success) {
        throw new Error(response?.data);
      }
      return response.data as IContactUs[]
    } catch (error: any) {
      throw new Error(error?.message ?? error)
    }
  }

  /**
   * Get a contact us inquiry by it's id
   * @returns 
   */
  async getContactInquiryById(id: string) {
    try {
      const response = (await axios.get(`${this.apiUrl}/${id}`, getProtectedRequestConfig())).data as IResponse;
      if (!response?.success) {
        throw new Error(response?.data);
      }
      return response.data as IContactUs
    } catch (error: any) {
      throw new Error(error?.message ?? error)
    }
  }
}