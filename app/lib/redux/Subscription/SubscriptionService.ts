import axios from "axios";
import { IResponse } from "../../interfaces/IResponse";
import { ISubscription } from "../../interfaces/Redux/ISubscription";
import { BACKEND_URL } from "../../config/api";
import { getProtectedRequestConfig } from "../../utils/csrfToken";

export default class SubscriptionService {

  apiUrl: string;

  constructor() {
    this.apiUrl = `${BACKEND_URL}/subscriptions`;
  }

  //Called in frontend
  // async addSubscription() {
  //   try {
  //     const response = (await (axios.p(`${this.apiUrl}`))).data as IResponse;
  //     if (!response.success) {
  //       throw new Error(response.data)
  //     }
  //     return response.data as ISubscription
  //   } catch (error: any) {
  //     console.log({ error })
  //     throw new Error(error.message)
  //   }
  // }


  /**
   * Delete a user subscription
   * @param id 
   * @returns 
   */
  async deleteSubscription(id: string) {
    try {
      const response = (await (axios.delete(`${this.apiUrl}/${id}`, getProtectedRequestConfig()))).data as IResponse;
      if (!response.success) {
        throw new Error(response.data)
      }
      return response.data as string
    } catch (error: any) {
      console.log({ error })
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  }

  /**
   * Get a subscription
   * @param id 
   * @returns 
   */
  async getSubscription(id: string) {
    try {
      const response = (await (axios.get(`${this.apiUrl}/${id}`, getProtectedRequestConfig()))).data as IResponse;
      if (!response.success) {
        throw new Error(response.data)
      }
      return response.data as ISubscription
    } catch (error: any) {
      console.log({ error })
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  }

  /**
   * Get all subscription
   * @param page Page number (default: 1)
   * @param limit Items per page (default: 20)
   * @returns 
   */
  async getAllSubscription(page: number = 1, limit: number = 20) {
    try {
      const response = (await (axios.get(`${this.apiUrl}?page=${page}&limit=${limit}`, getProtectedRequestConfig()))).data as IResponse;
      if (!response.success) {
        throw new Error(response.data)
      }
      return response.data as {
        subscriptions: [ISubscription],
        pagination: {
          page: number,
          limit: number,
          total: number,
          totalPages: number
        }
      }
    } catch (error: any) {
      console.log({ error })
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  }

  /**
   * Send bulk newsletter to all subscribers
   * @param subject 
   * @param message 
   * @param html 
   * @returns Success message string
   */
  async sendBulkNewsletter(subject: string, message: string, html?: string): Promise<string> {
    try {
      const response = (await axios.post(`${this.apiUrl}/send-newsletter`, {
        subject,
        message,
        html
      }, getProtectedRequestConfig())).data as IResponse;
      if (!response.success) {
        throw new Error(response.data as string)
      }
      return response.data as string;
    } catch (error: any) {
      console.log({ error })
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  }

  /**
   * Schedule bulk newsletter to be sent at a specific time
   * @param subject 
   * @param message 
   * @param scheduledTime 
   * @param html 
   * @returns Success message string
   */
  async scheduleBulkNewsletter(subject: string, message: string, scheduledTime: string, html?: string): Promise<string> {
    try {
      const response = (await axios.post(`${this.apiUrl}/schedule-newsletter`, {
        subject,
        message,
        scheduledTime,
        html
      }, getProtectedRequestConfig())).data as IResponse;
      if (!response.success) {
        throw new Error(response.data as string)
      }
      return response.data as string;
    } catch (error: any) {
      console.log({ error })
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  }

}