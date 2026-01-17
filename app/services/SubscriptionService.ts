import axios from "axios";
import { IResponse } from "@/lib/interfaces/IResponse";
import { ISubscription, ISubscriptionUpdate } from "@/lib/interfaces/ISubscription";
import { BACKEND_URL } from "@/lib/config/api";
export default class SubscriptionService {

  apiUrl: string;

  constructor() {
    this.apiUrl = `${BACKEND_URL}/subscriptions`;
  }

  async addSubscription(data: ISubscriptionUpdate) {
    try {
      const response = (await (axios.post(`${this.apiUrl}`, data))).data as IResponse;
      if (!response.success) {
        throw new Error(response.data)
      }
      return response.data as ISubscription
    } catch (error: any) {
      console.log({ error })
      throw new Error(error?.response?.data?.data ?? error?.response?.data?.messageerror?.message ?? error)
    }
  }


  // /**
  //  * Delete a user subscription
  //  * @param id 
  //  * @returns 
  //  */
  // async deleteSubscription(id: string) {
  //   try {
  //     const response = (await (axios.delete(`${this.apiUrl}/${id}`))).data as IResponse;
  //     if (!response.success) {
  //       throw new Error(response.data)
  //     }
  //     return response.data as string
  //   } catch (error: any) {
  //     console.log({ error })
  //     throw new Error(error?.response?.data?.data ?? error?.response?.data?.messageerror?.message ?? error)
  //   }
  // }

  /**
   * Get a subscription
   * @param id 
   * @returns 
   */
  async getSubscription(id: string) {
    try {
      const response = (await (axios.get(`${this.apiUrl}/${id}`))).data as IResponse;
      if (!response.success) {
        throw new Error(response.data)
      }
      return response.data as ISubscription
    } catch (error: any) {
      console.log({ error })
      throw new Error(error?.response?.data?.data ?? error?.response?.data?.messageerror?.message ?? error)
    }
  }

  /**
   * Get all subscription
   * @param id 
   * @returns 
   */
  async getAllSubscription() {
    try {
      const response = (await (axios.get(`${this.apiUrl}`))).data as IResponse;
      if (!response.success) {
        throw new Error(response.data)
      }
      return response.data as [ISubscription]
    } catch (error: any) {
      console.log({ error })
      throw new Error(error?.response?.data?.data ?? error?.response?.data?.messageerror?.message ?? error)
    }
  }

}