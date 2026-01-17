import { useRef, useState } from "react";
import dkMediaLogo from "/dkMediaLogo.png";
import { GoogleLoginBtn } from "@/components/cms/GoogleLoginBtn";
import useHandleOAuthRedirect from "@/lib/hooks/handleOAuthRedirect";
import { AuthService } from "@/lib/redux/Auth/AuthService";
import ThrowAsyncError, { toggleError } from "@/components/cms/ThrowAsyncError";

function Login() {
  const authService = new AuthService();
  const [isLogin, setIsLogin] = useState(true);
  const [signupKey, setSignupKey] = useState("");

  const errorRef = useRef<HTMLDivElement>(null);
  const [responseError, setResponseError] = useState("");

  const onLoginClick = async (mode: string) => {
    if (!isLogin && signupKey === "") {
      return handleThrowError("Sign up key is required");
    }

    try {
      if (!isLogin) {
        await authService.authenticateUser(mode, signupKey);
      } else {
        await authService.authenticateUser(mode);
      }
    } catch (error: any) {
      console.log({ error })
      handleThrowError(error?.message ?? error)
    }
  }

  const handleThrowError = (errorMsg: string) => {
    setResponseError(errorMsg);
    setTimeout(() => {
      toggleError(errorRef);
    }, 400);
  };

  useHandleOAuthRedirect(handleThrowError);

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-[500px] glass-card rounded-2xl p-6 lg:p-8 animate-fade-up animate-duration-300">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={dkMediaLogo} alt="DKMedia Logo" className="w-[200px] h-auto lg:w-[253px] lg:h-[56px]" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent mb-2">
            Admin Panel
          </h1>
          <p className="text-neutral-500 text-sm lg:text-base">
            {isLogin ? "Sign in to access the CMS" : "Create a new admin account"}
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent mb-8"></div>

        {/* Form Content */}
        {isLogin ? (
          <div className="flex flex-col gap-6">
            <GoogleLoginBtn onBtnClick={() => onLoginClick("login")} title="Continue with Google" />

            <div className="flex flex-col items-center gap-3 pt-4 border-t border-neutral-800/50">
              <span className="text-neutral-400 text-sm">Don't have an account?</span>
              <button
                onClick={() => setIsLogin(false)}
                className="w-full py-3 px-4 bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-200 rounded-xl font-medium transition-all duration-300 border border-neutral-700/50 hover:border-neutral-600/50"
              >
                Sign Up
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-y-2">
              <label className="text-sm font-medium text-neutral-300">Signup Key</label>
              <input
                type="text"
                placeholder="Enter your signup key"
                value={signupKey}
                onChange={(e) => setSignupKey(e.target.value)}
                className="input-modern w-full py-3 px-4 rounded-xl font-medium"
              />
            </div>

            <GoogleLoginBtn onBtnClick={() => onLoginClick("signup")} title="Continue with Google" />

            <div className="flex flex-col items-center gap-3 pt-4 border-t border-neutral-800/50">
              <span className="text-neutral-400 text-sm">Already have an account?</span>
              <button
                onClick={() => setIsLogin(true)}
                className="w-full py-3 px-4 bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-200 rounded-xl font-medium transition-all duration-300 border border-neutral-700/50 hover:border-neutral-600/50"
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        <ThrowAsyncError
          responseError={responseError}
          errorRef={errorRef}
          className={"!bottom-[10%] !left-[50%] !-translate-x-1/2"}
        />
      </div>
    </div>
  );
}

export default Login;

