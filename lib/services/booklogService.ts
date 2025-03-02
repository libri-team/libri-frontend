import { apiRequest, withAuth } from './api';

// BookLog interfaces
export interface BookLogSummary {
  id: string;
  title: string;
  authors: string;
  thumbnail: string;
  createId: number;
}

export interface BookLogDetail {
  id: string;
  readingLogId: string;
  title: string;
  isbn: string;
  description: string;
  authors: string;
  publisher: string;
  thumbnail: string;
  link: string;
  rating: number;
  status: BookReadingStatus;
  startDateTime: string;
  endDateTime: string;
}

export interface BookLogsResponse {
  totalCount: number;
  logs: BookLogSummary[];
}

export type BookReadingStatus = 
  | 'WANT_TO_READ' // 읽고 싶은 책
  | 'READING'      // 읽고 있는 중
  | 'COMPLETED'    // 읽기 완료
  | 'ABANDONED'    // 일시 중단 (나중에 다시 읽을 수도 있음)
  | 'GAVE_UP';     // 읽기 포기 (더 이상 안 읽을 책)

export interface CreateBookLogRequest {
  isbn: string;
  title: string;
  description: string;
  authors: string;
  publisher: string;
  thumbnail: string;
  link: string;
  rating: number;
  status: BookReadingStatus;
  startDateTime: string;
  endDateTime: string;
  clubId?: number | null;
}

export interface UpdateBookLogRequest {
  rating: number;
  status: BookReadingStatus;
  startDateTime: string;
  endDateTime: string;
}

export interface BookLogResponse {
  id: string;
}

// BookLog service functions
export const booklogService = {
  // Get all book logs with optional filters
  async getBookLogs(
    page: number, 
    size: number, 
    status?: BookReadingStatus, 
    isPrivate?: boolean,
    clubId?: number
  ): Promise<BookLogsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (status) {
      params.append('status', status);
    }
    
    if (isPrivate !== undefined) {
      params.append('isPrivate', isPrivate.toString());
    }
    
    if (clubId !== undefined) {
      params.append('clubId', clubId.toString());
    }
    
    const response = await apiRequest<BookLogsResponse>(
      `/booklogs?${params}`, 
      { headers: withAuth() }
    );
    
    if (response.error) {
      throw response.error;
    }
    
    return response.data || { totalCount: 0, logs: [] };
  },
  
  // Get book log details
  async getBookLogById(id: string): Promise<BookLogDetail> {
    const response = await apiRequest<BookLogDetail>(
      `/booklogs/${id}`,
      { headers: withAuth() }
    );
    
    if (response.error) {
      throw response.error;
    }
    
    return response.data as BookLogDetail;
  },
  
  // Create new book log
  async createBookLog(bookLog: CreateBookLogRequest): Promise<BookLogResponse> {
    const response = await apiRequest<BookLogResponse>(
      '/booklogs',
      {
        method: 'POST',
        headers: withAuth(),
        body: bookLog as unknown as Record<string, unknown>,
      }
    );
    
    if (response.error) {
      throw response.error;
    }
    
    return response.data as BookLogResponse;
  },
  
  // Update existing book log
  async updateBookLog(id: string, bookLog: UpdateBookLogRequest): Promise<BookLogResponse> {
    const response = await apiRequest<BookLogResponse>(
      `/booklogs/${id}`,
      {
        method: 'PUT',
        headers: withAuth(),
        body: bookLog as unknown as Record<string, unknown>,
      }
    );
    
    if (response.error) {
      throw response.error;
    }
    
    return response.data as BookLogResponse;
  },
}; 