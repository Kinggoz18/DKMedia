import { createSlice, Dispatch, UnknownAction } from "@reduxjs/toolkit";
import IUserSlice from "../../interfaces/Redux/IUserSlice";
import { AuthService } from "./AuthService";

const authService = new AuthService();

/**
 * Get initial state - safe for SSR
 */
function getInitialState(): IUserSlice {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
  return {
    _id: "",
    authId: "",
    displayName: "",
    email: "",
  };
}

const initialState: IUserSlice = getInitialState();

const authSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginUser(_state, action) {
      return action.payload;
    },
    logoutUser(state, _action) {
      return state;
    }
  }
})

/**
 * Get the user's information save it to redux store and save it to localstorage
 * @param userId The id of the user
 * @returns 
 */
export function LoginUser(userId: string): any {
  return async function LoginUserThunk(dispatch: Dispatch<UnknownAction>, _getState: any) {
    try {
      const user = await authService.getAuthenticatedUser(userId);
      dispatch(authSlice.actions.loginUser(user));
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem("user", JSON.stringify(user));
        // Also store userId separately for axios interceptor
        if (user.authId) {
          localStorage.setItem("userId", user.authId);
        } else if (userId) {
          localStorage.setItem("userId", userId);
        }
      }
    } catch (error: any) {
      console.log({ error });
      throw new Error(error.message);
    }
  };
}

/**
 * Reset the state and logout the user
 * @returns 
 */
export function LogoutUser(): any {
  return async function LogoutUserThunk(dispatch: Dispatch<UnknownAction>,  _getState: any) {
    await authService.logoutUser();
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem("user");
      localStorage.removeItem("userId"); // Also remove userId
    }
    dispatch(authSlice.actions.logoutUser(null))
  }
}

// export const { loginUser, logoutUser } = authSlice.actions;

export default authSlice.reducer;