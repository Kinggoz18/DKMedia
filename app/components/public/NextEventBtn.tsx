import BtnProps from '@/lib/interfaces/props/BtnProps';
import React from 'react'

export default function NextEventBtn(props: BtnProps) {
  const { onClick, className } = props;

  return (
    <div onClick={onClick} className={`w-[49px] h-[58px] bg-neutral-950/80 cursor-pointer absolute right-0 z-10 flex items-center justify-center ${className}`}>
      <img src="/NextArrow.svg" alt="Next icon" />
    </div>
  )
}
