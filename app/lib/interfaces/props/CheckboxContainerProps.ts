export interface CheckboxCheckOtions {
  option: string,
  optionId: number
  isCheck: boolean
}

export default interface CheckboxContainerProps {
  option: string;
  handleCheck: (option: CheckboxCheckOtions) => void;
  className?: string;
  optionId: number;
  isChecked: boolean;
  contentClassName?: string;
}