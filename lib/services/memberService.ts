import { apiRequest, withAuth } from './api';
import { Member } from './clubService';

// Create/update nickname request
export interface NicknameRequest {
  nickname: string;
}

// Create unique ID request
export interface UniqueIdRequest {
  uniqueId: string;
}

// Member service functions
export const memberService = {
  // Get all members
  async getMembers(searchReq?: string): Promise<Member[]> {
    const params = new URLSearchParams();
    
    if (searchReq) {
      params.append('search_req', searchReq);
    }
    
    const response = await apiRequest<Member[]>(
      `/member/members${params.toString() ? `?${params}` : ''}`,
      { headers: withAuth() }
    );
    
    if (response.error) {
      throw response.error;
    }
    
    return response.data || [];
  },
  
  // Get current user info
  async getMyInfo(): Promise<Member> {
    const response = await apiRequest<Member>(
      '/member/my-info',
      { headers: withAuth() }
    );
    
    if (response.error) {
      throw response.error;
    }
    
    return response.data as Member;
  },
  
  // Create or update nickname
  async createNickname(nickname: string): Promise<void> {
    const response = await apiRequest<void>(
      '/member/create/nickname',
      {
        method: 'POST',
        headers: withAuth(),
        body: { nickname } as unknown as Record<string, unknown>,
      }
    );
    
    if (response.error) {
      throw response.error;
    }
  },
  
  // Create unique ID
  async createUniqueId(uniqueId: string): Promise<void> {
    const response = await apiRequest<void>(
      '/member/create/unique-id',
      {
        method: 'POST',
        headers: withAuth(),
        body: { uniqueId } as unknown as Record<string, unknown>,
      }
    );
    
    if (response.error) {
      throw response.error;
    }
  },
}; 