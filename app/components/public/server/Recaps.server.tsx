import IMedia from '@/lib/interfaces/IMedia';
import Recaps from '../Recaps';

interface RecapsPageProps {
  allMedia: IMedia[];
}

export default function RecapsPage({ allMedia }: RecapsPageProps) {
  return (
    <Recaps
      allRecaps={allMedia}
    />
  );
}
