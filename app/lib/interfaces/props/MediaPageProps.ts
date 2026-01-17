import IMedia from "../IMedia";

export default interface MediaPageProps {
  allMedia: IMedia[];
  initialTag?: string | null;
}