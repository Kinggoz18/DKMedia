export interface INewsletterHistory {
  _id: string;
  subject: string;
  message: string;
  recipientsCount: number;
  sentAt: string;
  status: 'sent' | 'failed';
  errorMessage?: string;
}

export interface INewsletterHistoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface INewsletterHistoryResponse {
  history: INewsletterHistory[];
  pagination: INewsletterHistoryPagination;
}

