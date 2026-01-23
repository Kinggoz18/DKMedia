import axios from "axios";
import { IResponse } from "../../interfaces/IResponse";
import { INewsletterHistory, INewsletterHistoryResponse } from "../../interfaces/Redux/INewsletterHistory";
import { BACKEND_URL } from "../../config/api";
import { getProtectedRequestConfig } from "../../utils/csrfToken";

export default class NewsletterHistoryService {
  apiUrl: string;

  constructor() {
    this.apiUrl = `${BACKEND_URL}/newsletter-history`;
  }

  /**
   * Get newsletter history with pagination
   * @param page 
   * @param limit 
   * @returns 
   */
  async getNewsletterHistory(page: number = 1, limit: number = 20): Promise<INewsletterHistoryResponse> {
    try {
      const response = (await axios.get(`${this.apiUrl}?page=${page}&limit=${limit}`, getProtectedRequestConfig())).data as IResponse;
      if (!response.success) {
        throw new Error(response.data as string)
      }
      return response.data as INewsletterHistoryResponse;
    } catch (error: any) {
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  }

  /**
   * Add newsletter history entry
   * @param subject 
   * @param message 
   * @param recipientsCount 
   * @param status 
   * @param errorMessage 
   * @returns 
   */
  async addNewsletterHistory(
    subject: string,
    message: string,
    recipientsCount: number,
    status: 'sent' | 'failed' = 'sent',
    errorMessage?: string
  ): Promise<INewsletterHistory> {
    try {
      const response = (await axios.post(`${this.apiUrl}`, {
        subject,
        message,
        recipientsCount,
        status,
        errorMessage
      }, getProtectedRequestConfig())).data as IResponse;
      if (!response.success) {
        throw new Error(response.data as string)
      }
      return response.data as INewsletterHistory;
    } catch (error: any) {
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  }
}

