export default interface IOrganizer {
  _id?: string;
  name: string;
  logo: string;
}

export interface IOrganizerUpdate {
  id: string;
  name?: string;
  logo?: string;
}