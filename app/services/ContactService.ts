import axios from "axios";
import { IResponse } from "@/lib/interfaces/IResponse";
import IContact, { IContactUpdate } from "@/lib/interfaces/IContact";
import { BACKEND_URL } from "@/lib/config/api";
export class ContactService {
  apiUrl: string;

  constructor() {
    this.apiUrl = `${BACKEND_URL}/contact`;
  }

  // /**
  //  * Add/Update contact
  //  * @returns 
  //  */
  // async addContact(data: IContactUpdate) {
  //   try {
  //     const response = (await axios.post(`${this.apiUrl}`, data)).data as IResponse;
  //     if (!response?.success) {
  //       throw new Error(response.data);
  //     }
  //     return response.data as IContact;
  //   } catch (error: any) {
  //     throw new Error(error?.response?.data?.data ?? error?.response?.data?.messageerror?.message ?? error)
  //   }
  // }

  // /**
  //  * Clear contacts
  //  * @returns 
  //  */
  // async deleteContact() {
  //   try {
  //     const response = (await axios.delete(`${this.apiUrl}`)).data as IResponse;
  //     if (!response?.success) {
  //       throw new Error(response.data);
  //     }
  //     return response.data as string;
  //   } catch (error: any) {
  //     throw new Error(error?.response?.data?.data ?? error?.response?.data?.messageerror?.message ?? error)
  //   }
  // }

  /**
   * Get contact
   * @returns 
   */
  async getContacts() {
    try {
      const response = (await axios.get(`${this.apiUrl}`)).data as IResponse;
      if (!response?.success) {
        throw new Error(response.data);
      }
      return response.data as IContact;
    } catch (error: any) {
      throw new Error(error?.response?.data?.data ?? error?.response?.data?.messageerror?.message ?? error)
    }
  }

}