// Shared type definitions for BookClub components

export interface User {
  id: number;
  uniqueId: string;
  nickname: string;
}

export interface Rule {
  dateCount: number;
  ruleStatus: string;
  bookCount: number;
  rule: string;
}

export interface ClubData {
  name: string;
  members: User[];
  rules: Rule[];
  description: string;
  fileUrl?: string | null;
}

export interface ClubResponse {
  id: number;
  name: string;
  description: string;
  fileUrl: string | null;
  rules: Rule[];
}
