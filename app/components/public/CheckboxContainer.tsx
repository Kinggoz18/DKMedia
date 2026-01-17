import CheckboxContainerProps from "@/lib/interfaces/props/CheckboxContainerProps";
import { useState } from "react";

/**
 *  Checkbox component
 * @returns A JSX element
 */
const CheckboxContainer = (props: CheckboxContainerProps) => {
  const {
    option,
    handleCheck,
    className = "",
    optionId,
    isChecked,
    contentClassName = "",
  } = props;

  /**
   * Toggle selected icon for CheckboxContainer1
   */
  const onSelect = () => {
    const status = !isChecked;

    if (status) {
      handleCheck({ option: option, optionId, isCheck: true });
    } else {
      handleCheck({ option: option, optionId, isCheck: false });
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`w-full rounded-xl flex flex-col items-start bg-white-8 justify-start gap-[8px] text-left text-neutral-100 ${className}`}
    >
      <div className={`w-full flex flex-row items-start justify-start box-border gap-[8px] ${contentClassName}`}>
        {isChecked ? (
          <svg
            width="19"
            height="19"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M18 2H6C3.79086 2 2 3.79086 2 6V18C2 20.2091 3.79086 22 6 22H18C20.2091 22 22 20.2091 22 18V6C22 3.79086 20.2091 2 18 2ZM16.592 9.46049C16.8463 9.13353 16.7874 8.66232 16.4605 8.40802C16.1335 8.15372 15.6623 8.21262 15.408 8.53958L11.401 13.6914C11.3119 13.806 11.1443 13.8209 11.0364 13.7238L8.50173 11.4426C8.19385 11.1655 7.71963 11.1904 7.44254 11.4983C7.16544 11.8062 7.1904 12.2804 7.49828 12.5575L10.033 14.8387C10.7881 15.5183 11.9613 15.4143 12.585 14.6123L16.592 9.46049Z"
              fill="#B90808"
            />
          </svg>
        ) : (
          <svg
            width="19"
            height="19"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 1H17C19.2091 1 21 2.79086 21 5V17C21 19.2091 19.2091 21 17 21H5C2.79086 21 1 19.2091 1 17V5C1 2.79086 2.79086 1 5 1Z"
              stroke="#6C6C6C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}

        <div className="flex-1 relative leading-[20px] text-[14px] md:text-[16px] lg:text-[18px]">
          {option}
        </div>
      </div>
    </div>
  );
};

export default CheckboxContainer;
