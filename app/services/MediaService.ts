import axios from "axios";
import { IResponse } from "@/lib/interfaces/IResponse";
import IMedia from "@/lib/interfaces/IMedia";
import { BACKEND_URL } from "@/lib/config/api";
export default class MediaService {
  apiUrl: string;

  constructor() {
    this.apiUrl = `${BACKEND_URL}/upload-media`;
  }

  // /**
  //  * POST media
  //  * @param mediaToAdd 
  //  * @returns 
  //  */
  // async addMedia(mediaToAdd: IMedia) {
  //   try {
  //     const response = (await axios.post(`${this.apiUrl}`, mediaToAdd)).data as IResponse;
  //     if (!response.success) {
  //       throw new Error(response.data)
  //     }
  //     return response.data as IMedia;
  //   } catch (error: any) {
  //     console.log({ error })
  //     throw new Error(error?.response?.data?.data ?? error?.response?.data?.messageerror?.message ?? error)
  //   }
  // }

  // /**
  //  * DELETE media
  //  * @param mediaToAdd 
  //  * @returns 
  //  */
  // async deleteMedia(id: string) {
  //   try {
  //     const response = (await axios.delete(`${this.apiUrl}/${id}`)).data as IResponse;
  //     if (!response.success) {
  //       throw new Error(response.data)
  //     }
  //     return response.data as string;
  //   } catch (error: any) {
  //     console.log({ error })
  //     throw new Error(error?.response?.data?.data ?? error?.response?.data?.messageerror?.message ?? error)
  //   }
  // }

  /**
   * GET all media
   * @param mediaToAdd 
   * @returns 
   */
  async getAllMedia() {
    try {
      const response = (await axios.get(`${this.apiUrl}`)).data as IResponse;
      if (!response.success) {
        throw new Error(response.data)
      }
      return response.data as [IMedia];
    } catch (error: any) {
      console.log({ error })
      throw new Error(error?.response?.data?.data ?? error?.response?.data?.messageerror?.message ?? error)
    }
  }

  /**
   * Get media by id
   * @param mediaToAdd 
   * @returns 
   */
  async getMediaById(id: string) {
    try {
      const response = (await axios.get(`${this.apiUrl}/${id}`)).data as IResponse;
      if (!response.success) {
        throw new Error(response.data)
      }
      return response.data as IMedia;
    } catch (error: any) {
      console.log({ error })
      throw new Error(error?.response?.data?.data ?? error?.response?.data?.messageerror?.message ?? error)
    }
  }
}