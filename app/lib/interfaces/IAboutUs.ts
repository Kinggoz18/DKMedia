export default interface IAboutUs {
  _id?: string;
  title: string;
  paragraphs: string[];
}

export interface IAboutUsUpdate {
  id?: string;
  title?: string;
  paragraphs?: string[];
}