import { User, ClubData } from './types';

/**
 * 회원 데이터를 API에서 가져오는 함수
 */
export const fetchMembersFromAPI = async (): Promise<User[]> => {
  try {
    console.log('회원 목록 가져오기 API 호출 시작');
    const token = localStorage.getItem('accessToken');

    const response = await fetch('https://dev-api.libri.kr/member/members', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json;charset=UTF-8',
      },
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();

    // 데이터 형식 확인 및 매핑
    if (Array.isArray(data)) {
      return data.map((member: any) => ({
        id: member.id,
        uniqueId: member.uniqueId,
        nickname: member.nickname,
      }));
    } else {
      console.error('예상과 다른 API 응답 형식:', data);
      return [];
    }
  } catch (error) {
    console.error('회원 데이터 가져오기 실패:', error);
    return [];
  }
};

/**
 * 새 클럽을 생성하는 함수
 */
export const createClub = async (clubData: ClubData): Promise<number> => {
  try {
    console.log('=== 클럽 생성 API 호출 ===');
    console.log('요청 데이터:', JSON.stringify(clubData, null, 2));

    const token = localStorage.getItem('accessToken');
    const response = await fetch('https://dev-api.libri.kr/club', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify(clubData),
    });

    console.log(`응답 상태 코드: ${response.status}`);
    console.log('응답 헤더:', Object.fromEntries([...response.headers.entries()]));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API 오류 응답 (${response.status}): ${errorText}`);
      throw new Error(`서버 오류: ${response.status}`);
    }

    // 응답 본문을 텍스트로 먼저 읽어서 콘솔에 출력
    const responseText = await response.text();
    console.log('원본 응답 텍스트:', responseText);

    // 응답 본문이 비어있지 않은 경우에만 JSON으로 파싱
    if (responseText && responseText.trim()) {
      try {
        const data = JSON.parse(responseText);
        console.log('파싱된 응답 데이터:', data);

        // 응답에 ID가 있는지 확인
        if (data.id !== undefined) {
          console.log(`★★★ 생성된 클럽 ID: ${data.id} ★★★`);
          return data.id;
        } else {
          console.warn('응답에 ID 필드가 없음. 응답 데이터:', data);
          // ID가 없는 경우 임시로 현재 타임스탬프를 반환
          return Date.now();
        }
      } catch (error) {
        console.error('JSON 파싱 오류:', error);
        throw new Error('서버 응답을 JSON으로 파싱할 수 없습니다.');
      }
    } else {
      console.warn('서버가 빈 응답을 반환했습니다.');

      // 빈 응답인 경우, 클럽 목록을 조회하여 최신 클럽의 ID를 찾음
      try {
        console.log('클럽 목록 조회 시도 중...');
        const clubs = await getClubList();

        if (clubs.length > 0) {
          // 가장 최근에 생성된 클럽의 ID 반환
          const latestClubId = clubs[0].id;
          console.log(`★★★ 최근 생성된 것으로 추정되는 클럽 ID: ${latestClubId} ★★★`);
          return latestClubId;
        }
      } catch (listError) {
        console.error('클럽 목록 조회 실패:', listError);
      }

      // 모든 시도가 실패한 경우 임시 ID 반환
      const tempId = Date.now();
      console.warn(`ID를 찾을 수 없어 임시 ID 생성: ${tempId}`);
      return tempId;
    }
  } catch (error) {
    console.error('클럽 생성 실패:', error);
    throw error;
  }
};

/**
 * 클럽에 이미지 업로드하는 함수
 */
export const uploadClubImage = async (clubId: number, fileUrl: File): Promise<string> => {
  try {
    console.log('=== 이미지 업로드 API 호출 ===');
    console.log(`대상 클럽 ID: ${clubId}`);

    const token = localStorage.getItem('accessToken');
    const formData = new FormData();
    formData.append('fileUrl', fileUrl);

    const uploadUrl = `https://dev-api.libri.kr/club/file?id=${clubId}`;
    console.log(`업로드 URL: ${uploadUrl}`);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    console.log(`이미지 업로드 응답 상태 코드: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`이미지 업로드 오류 (${response.status}): ${errorText}`);
      throw new Error(`이미지 업로드 실패: ${response.status}`);
    }

    // 클럽 목록 조회하여 최신 fileUrl 확인
    const clubs = await getClubList();
    const updatedClub = clubs.find((club) => club.id === clubId);

    if (updatedClub && updatedClub.fileUrl) {
      console.log(`업로드된 파일 URL: ${updatedClub.fileUrl}`);
      return updatedClub.fileUrl;
    } else {
      console.warn('업로드 후 fileUrl을 찾을 수 없음');
      return '';
    }
  } catch (error) {
    console.error('이미지 업로드 오류:', error);
    throw error;
  }
};
/**
 * 클럽 목록을 가져오는 함수
 */
export const getClubList = async (): Promise<any[]> => {
  try {
    console.log('=== 클럽 목록 조회 API 호출 ===');

    const token = localStorage.getItem('accessToken');
    const response = await fetch('https://dev-api.libri.kr/club?page=1&size=10', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`클럽 목록 조회 응답 상태 코드: ${response.status}`);

    if (!response.ok) {
      throw new Error(`클럽 목록 가져오기 실패: ${response.status}`);
    }

    const data = await response.json();
    console.log('클럽 목록 응답 데이터:', data);

    // 각 클럽의 ID 및 세부 정보 명시적 로깅
    if (Array.isArray(data)) {
      data.forEach((club, index) => {
        console.log(`클럽 ${index + 1} [ID: ${club.id}]`);
        console.log(`  이름: "${club.name}"`);
        console.log(`  설명: "${club.description}"`);
        console.log(`  이미지: ${club.fileUrl || '없음'}`);
      });
    }

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('클럽 목록 가져오기 실패:', error);
    return [];
  }
};
