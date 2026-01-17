import BtnProps from '@/lib/interfaces/props/BtnProps';
import React from 'react'

export default function PrevEventBtn(props: BtnProps) {
  const { onClick, className } = props;

  return (
    <div onClick={onClick} className={`w-[49px] h-[58px] bg-neutral-950/80 cursor-pointer absolute left-0 z-10 flex items-center justify-center ${className}`}>
      <img src="/prevArrow.svg" alt="Next icon" />
    </div>
  )
}
