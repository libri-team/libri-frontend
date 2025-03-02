import { apiRequest } from './api';

// Book interfaces
export interface Book {
  title: string;
  authors: string[];
  thumbnail: string;
  isbn: string;
  pubDate: string;
  publisher: string;
}

export interface BookDetail {
  title: string;
  link: string;
  author: string;
  pubDate: string;
  description: string;
  isbn: string;
  isbn13: string;
  priceSales: number;
  priceStandard: number;
  cover: string;
  publisher: string;
}

interface BooksResponse {
  totalCount: number;
  books: Book[];
}

// Book service functions
export const bookService = {
  // Search books
  async searchBooks(keyword: string, page: number, size: number): Promise<BooksResponse> {
    const params = new URLSearchParams({
      keyword,
      page: page.toString(),
      size: size.toString(),
    });
    
    const response = await apiRequest<BooksResponse>(`/books?${params}`);
    
    if (response.error) {
      throw response.error;
    }
    
    return response.data || { totalCount: 0, books: [] };
  },
  
  // Get book details
  async getBookDetail(isbn: string): Promise<BookDetail> {
    const response = await apiRequest<BookDetail>(`/api/aladin/books/${isbn}`);
    
    if (response.error) {
      throw response.error;
    }
    
    return response.data as BookDetail;
  },
  
  // Get bestsellers
  async getBestsellers(page: number, size: number): Promise<BooksResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    const response = await apiRequest<BooksResponse>(`/api/aladin/bestsellers?${params}`);
    
    if (response.error) {
      throw response.error;
    }
    
    return response.data || { totalCount: 0, books: [] };
  },
  
  // Get new books
  async getNewBooks(page: number, size: number): Promise<BooksResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    const response = await apiRequest<BooksResponse>(`/api/aladin/new-books?${params}`);
    
    if (response.error) {
      throw response.error;
    }
    
    return response.data || { totalCount: 0, books: [] };
  },
  
  // Search books in Aladin
  async searchAladinBooks(keyword: string, page: number, size: number): Promise<BooksResponse> {
    const params = new URLSearchParams({
      keyword,
      page: page.toString(),
      size: size.toString(),
    });
    
    const response = await apiRequest<BooksResponse>(`/api/aladin/search?${params}`);
    
    if (response.error) {
      throw response.error;
    }
    
    return response.data || { totalCount: 0, books: [] };
  },
}; 