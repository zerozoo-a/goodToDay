export interface KakaoUser {
  id: number;
  connected_at: string;
  kakao_account: {
    email: string;
    email_needs_agreement: boolean;
    has_email: boolean;
    is_email_valid: boolean;
    is_email_verified: boolean;
    profile: Profile;
    profile_image_needs_agreement: boolean;
    profile_nickname_needs_agreement: boolean;
  };
}

interface Profile {
  is_default_image: boolean;
  nickname: string;
  profile_image_url: string;
  thumbnail_image_url: string;
}
