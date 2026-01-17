import { JSX } from "react";
import ButtonProps from "@/lib/interfaces/ButtonProps";
import googleLogo from "/googleLogo.png";

export function GoogleLoginBtn(props: ButtonProps): JSX.Element {
  const {
    onBtnClick,
    title
  } = props;

  return (
    <button
      onClick={() => onBtnClick()}
      className="w-full flex flex-row items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-500 text-white rounded-xl font-semibold text-base lg:text-lg transition-all duration-300 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5"
    >
      <img src={googleLogo} className="h-5 w-5 lg:h-6 lg:w-6" alt="Google" />
      <span>{title}</span>
    </button>
  )
}