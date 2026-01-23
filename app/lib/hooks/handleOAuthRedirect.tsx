import { useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import { LoginUser } from "@/lib/redux/Auth/AuthSlice";
import { useDispatch } from "react-redux";

/**
 * Intersection observer hook
 * @param handleAuthErrorFunc Handler function to throw error
 * @param LoginUser Login user function from redux store
 * @returns void
 */
const useHandleOAuthRedirect = (handleAuthErrorFunc: (errorMsg: string) => void) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleAuthRedirect = async () => {
    try {
      const queryParams = new URLSearchParams(window.location.search);
      const authId = queryParams.get("authId");
      const erroMsg = queryParams.get("erroMsg");

      if (erroMsg) {
        throw new Error(erroMsg)
      }

      if (authId) {
        // Store userId in localStorage for axios interceptor
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('userId', authId);
          
          // Get CSRF token from URL query params (set by backend after login)
          const csrfToken = queryParams.get("token");
          if (csrfToken) {
            // Store CSRF token in localStorage for double CSRF token verification
            localStorage.setItem('csrf_token', csrfToken);
          }
        }
        
        dispatch(LoginUser(authId));
        setTimeout(() => {
          navigate('/cms');
        }, 400)
      }

    } catch (error: any) {
      handleAuthErrorFunc(error?.message);
    }
  };

  useEffect(() => {
    handleAuthRedirect();
  }, []);
};

export default useHandleOAuthRedirect;
