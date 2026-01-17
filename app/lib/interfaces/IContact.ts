export default interface IContact {
  _id?: string;
  email: string;
  instagramLink: string;
  tiktokLink: string;
}

export interface IContactUpdate {
  _id?: string;
  email?: string;
  instagramLink?: string;
  tiktokLink?: string;
}