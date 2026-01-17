import axios from "axios";
import { IResponse } from "@/lib/interfaces/IResponse";
import IArticle from "@/lib/interfaces/IArticle";
import { BACKEND_URL } from "@/lib/config/api";
export class ArticleService {
  apiUrl: string;

  constructor() {
    this.apiUrl = `${BACKEND_URL}/articles`;
  }

  // async addArticle(data: IArticle) {
  //   try {
  //     const response = (await axios.post(`${this.apiUrl}`, data)).data as IResponse;
  //     if (!response.success) {
  //       throw new Error(response.data)
  //     }
  //     return response.data as IArticle;
  //   } catch (error: any) {
  //     console.log(error);
  //     throw new Error(error?.response?.data?.data ?? error?.response?.data?.messageerror?.message ?? error)
  //   }
  // }

  // async deleteArticle(id: string) {
  //   try {
  //     const response = (await axios.delete(`${this.apiUrl}/${id}`)).data as IResponse;
  //     if (!response.success) {
  //       throw new Error(response.data)
  //     }
  //     return response.data as string;
  //   } catch (error: any) {
  //     console.log(error);
  //     throw new Error(error?.response?.data?.data ?? error?.response?.data?.messageerror?.message ?? error)
  //   }
  // }

  async getArticleById(id: string) {
    try {
      const response = (await axios.get(`${this.apiUrl}/${id}`)).data as IResponse;
      if (!response.success) {
        throw new Error(response.data)
      }
      return response.data as IArticle;
    } catch (error: any) {
      console.log(error);
      throw new Error(error?.response?.data?.data ?? error?.response?.data?.messageerror?.message ?? error)
    }
  }

  async getAllArticle() {
    try {
      const response = (await axios.get(`${this.apiUrl}`)).data as IResponse;
      if (!response.success) {
        throw new Error(response.data)
      }
      return response.data as [IArticle];
    } catch (error: any) {
      console.log(error);
      throw new Error(error?.response?.data?.data ?? error?.response?.data?.messageerror?.message ?? error)
    }
  }
}