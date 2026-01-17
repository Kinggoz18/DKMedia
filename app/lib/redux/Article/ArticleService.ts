import { apiClient } from "../../config/axios";
import { IResponse } from "../../interfaces/IResponse";
import IArticle from "../../interfaces/Redux/IArticle";

import { BACKEND_URL } from "../../config/api";

export class ArticleService {
  apiUrl: string;

  constructor() {
    this.apiUrl = `${BACKEND_URL}/articles`;
  }

  async addArticle(data: IArticle) {
    try {
      const response = (await apiClient.post(`${this.apiUrl}`, data)).data as IResponse;
      if (!response.success) {
        throw new Error(response.data)
      }
      return response.data as IArticle;
    } catch (error: any) {
      console.log(error);
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  }

  async deleteArticle(id: string) {
    try {
      const response = (await apiClient.delete(`${this.apiUrl}/${id}`)).data as IResponse;
      if (!response.success) {
        throw new Error(response.data)
      }
      return response.data as string;
    } catch (error: any) {
      console.log(error);
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  }

  async getArticleById(id: string) {
    try {
      const response = (await apiClient.get(`${this.apiUrl}/${id}`)).data as IResponse;
      if (!response.success) {
        throw new Error(response.data)
      }
      return response.data as IArticle;
    } catch (error: any) {
      console.log(error);
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  }

  async getAllArticle() {
    try {
      const response = (await apiClient.get(`${this.apiUrl}`)).data as IResponse;
      if (!response.success) {
        throw new Error(response.data)
      }
      return response.data as [IArticle];
    } catch (error: any) {
      console.log(error);
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  }
}