import axios from "axios";
import { IResponse } from "../../interfaces/IResponse";
import IAboutUs, { IAboutUsUpdate } from "../../interfaces/Redux/IAboutUs";
import { BACKEND_URL } from "../../config/api";
import { getProtectedRequestConfig } from "../../utils/csrfToken";

export default class AboutUsService {
  apiUrl: string;

  constructor() {
    this.apiUrl = `${BACKEND_URL}/about-us`;
  }

  /**
   * Update about us section
   * @param updateData 
   * @returns 
   */
  async updateAboutUs(updateData: IAboutUsUpdate) {
    try {
      const response = (await axios.post(`${this.apiUrl}`, updateData, getProtectedRequestConfig())).data as IResponse
      if (!response.success) {
        throw new Error(response.data)
      }
      return response.data as IAboutUs;
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  /**
   * GET about us section
   * @returns 
   */
  async getAboutUs() {
    try {
      const response = (await axios.get(`${this.apiUrl}`, getProtectedRequestConfig())).data as IResponse
      if (!response.success) {
        throw new Error(response.data)
      }
      return response.data as IAboutUs;
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  /**
   * DELETE about us section
   * @returns 
   */
  async deleteAboutUs() {
    try {
      const response = (await axios.delete(`${this.apiUrl}`, getProtectedRequestConfig())).data as IResponse
      if (!response.success) {
        throw new Error(response.data)
      }
      return response.data as string;
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

}