import axios from "axios";
import { IResponse } from "../../interfaces/IResponse";
import IUserSlice from "../../interfaces/Redux/IUserSlice";
import { BACKEND_URL } from "../../config/api";
import { getProtectedRequestConfig } from "../../utils/csrfToken";
export class AuthService {
  apiUrl: string;

  constructor() {
    this.apiUrl = `${BACKEND_URL}/auth`;
  }

  /**
   * Login or signup a user
   * @param mode signup/login
   * @param signupCode Signup code
   */
  async authenticateUser(mode: string, signupCode?: string) {
    try {
      if (mode === "signup" && signupCode) {
        const response = (await axios.post(`${this.apiUrl}/authenticate-code`, { code: signupCode })).data as IResponse;
        if (!response.success) {
          throw new Error(response.data);
        }
        const id = response.data;
        window.location.assign(`${this.apiUrl}/google/callback?mode=${mode}&id=${encodeURIComponent(id)}`);
      } else if (mode === "login") {
        window.location.assign(`${this.apiUrl}/google/callback?mode=${mode}`);
      } else {
        throw new Error("Invalid signup mode")
      }
    } catch (error: any) {
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  }

  async getAuthenticatedUser(userId: string) {
    try {
      const response = (await axios.get(`${this.apiUrl}/${userId}`)).data as IResponse;
      if (!response.success) {
        throw new Error(response.data);
      }
      return response?.data as IUserSlice;
    } catch (error: any) {
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  }

  async logoutUser() {
    try {
      const response = (await axios.get(`${this.apiUrl}/`)).data as IResponse;
      if (!response.success) {
        throw new Error(response.data);
      }
      return response?.data as IUserSlice;
    } catch (error: any) {
      throw new Error(error?.response?.data?.data ?? error?.message ?? error)
    }
  }

  /**
   * Confirm authorized user - checks if user's tokens are valid
   * Used by CMS sections to verify authorization on navigation
   */
  async confirmAuthorizedUser() {
    try {
      const response = (await axios.get(`${this.apiUrl}/confirm`, getProtectedRequestConfig())).data as IResponse;

      if (!response.success) {
        throw new Error(response.data);
      }
      return response?.data;
    } catch (error: any) {
      // If unauthorized, redirect to login
      if (error?.response?.status === 401) {
        window.location.href = "/auth";
        throw new Error("Unauthorized. Please login again.");
      }
      throw new Error(error?.response?.data?.data ?? error?.message ?? error);
    }
  }
}