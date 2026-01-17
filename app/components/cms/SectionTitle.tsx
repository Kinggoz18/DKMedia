import SectionTitleProps from '@/lib/interfaces/SectionTitleProps';

export default function SectionTitle(props: SectionTitleProps) {
  const { title } = props;
  return (
    <div className='text-2xl lg:text-3xl font-bold text-white mb-2'>{title}</div>
  )
}
