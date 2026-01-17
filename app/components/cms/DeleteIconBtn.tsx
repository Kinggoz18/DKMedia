import deleteIcon from '/deleteIcon.svg';
import DeleteIconBtnProps from '@/lib/interfaces/DeleteIconBtnProps';

export default function DeleteIconBtn(props: DeleteIconBtnProps) {
  const { onDeleteClick, className } = props;
  return (
    <img onClick={onDeleteClick} src={deleteIcon} className={`h-[24px] absolute right-6 cursor-pointer ${className}`}></img>
  )
}
