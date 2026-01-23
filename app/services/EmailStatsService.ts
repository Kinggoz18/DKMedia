import axios from "axios";
import { IResponse } from "../lib/interfaces/IResponse";
import { BACKEND_URL } from "../lib/config/api";
import { getProtectedRequestConfig } from "../lib/utils/csrfToken";

export interface EmailUsageStats {
  currentCount: number;
  dailyLimit: number;
  remaining: number;
  percentageUsed: number;
}

export default class EmailStatsService {
  apiUrl: string;

  constructor() {
    this.apiUrl = `${BACKEND_URL}/email`;
  }

  /**
   * Get email usage statistics
   * @returns Email usage stats
   */
  async getEmailStats(): Promise<EmailUsageStats> {
    try {
      const response = (await axios.get(`${this.apiUrl}/stats`, getProtectedRequestConfig())).data as IResponse;
      if (!response.success) {
        throw new Error(response.data as string || 'Failed to fetch email stats');
      }
      return response.data as EmailUsageStats;
    } catch (error: any) {
      throw new Error(error?.response?.data?.data ?? error?.response?.data?.message ?? error?.message ?? error);
    }
  }
}

