import { apiRequest, withAuth } from './api';

// Member interface
export interface Member {
  id: number;
  uniqueId: string;
  nickname: string;
}

// Club rule interface
export interface ClubRule {
  dateCount: number;
  ruleStatus: 'DAY' | 'WEEK' | 'MONTH';
  bookCount: number;
  rule: string;
}

// Create club request interface
export interface CreateClubRequest {
  name: string;
  members: Member[];
  rules: ClubRule[];
  description: string;
}

// Club service functions
export const clubService = {
  // Create a new book club
  async createClub(clubData: CreateClubRequest): Promise<void> {
    const response = await apiRequest<void>(
      '/club',
      {
        method: 'POST',
        headers: withAuth(),
        body: clubData as unknown as Record<string, unknown>,
      }
    );
    
    if (response.error) {
      throw response.error;
    }
  },
  
  // Remove a member from a club
  async removeMember(clubId: number, memberId: number): Promise<void> {
    const response = await apiRequest<void>(
      `/club/delete/${clubId}/${memberId}`,
      {
        method: 'PUT',
        headers: withAuth(),
      }
    );
    
    if (response.error) {
      throw response.error;
    }
  },
  
  // Transfer admin rights to another member
  async transferAdmin(clubId: number, memberId: number): Promise<void> {
    const response = await apiRequest<void>(
      `/club/transfer/${clubId}/${memberId}`,
      {
        method: 'PUT',
        headers: withAuth(),
      }
    );
    
    if (response.error) {
      throw response.error;
    }
  },
}; 