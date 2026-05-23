export interface BaseUserProfile {
  provider: string; // e.g. 'google'
  providerId: string; // ID เฉพาะสำหรับ provider นั้นๆ
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  picture: string | null;
  accessToken: string;
}
