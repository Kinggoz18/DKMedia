export interface ISubscription {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ISubscriptionUpdate {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}