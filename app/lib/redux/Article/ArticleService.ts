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
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  }

  async getAllArticle(page: number = 1, limit: number = 20) {
    try {
      const response = (await apiClient.get(`${this.apiUrl}`, {
        params: { page, limit }
      })).data as IResponse;
      if (!response.success) {
        throw new Error(response.data)
      }
      // Handle both old format (array) and new format (object with articles and pagination)
      if (Array.isArray(response.data)) {
        return {
          articles: response.data as IArticle[],
          pagination: {
            page: 1,
            limit: response.data.length,
            total: response.data.length,
            totalPages: 1
          }
        };
      }
      return response.data as { articles: IArticle[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
    } catch (error: any) {
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  }
}