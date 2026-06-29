export interface FamilyMember {
  id: string;
  name: string;
  gender: 'male' | 'female';
  generation: number;
  role: string;
  birthYear?: string;
  deathYear?: string;
  isDeceased: boolean;
  parentId?: string; // Links to parent (usually father)
  motherId?: string; // Links to mother
  spouseId?: string; // Main spouse ID
  spouseIds?: string[]; // Supports multiple spouses
  isMarried?: boolean; // Tích chọn vào liên kết hôn phối
  branch: string; // "Nhánh chính", "Chi Cụ Bà Cả", "Chi Cụ Bà Hai", etc.
  story?: string;
  occupation?: string;
  address?: string;
  phone?: string;
  deathDateSolar?: string;
  deathTime?: string;
  deathDateLunar?: string;
}

export interface AltarPrayer {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  offeringType: 'incense' | 'candle' | 'flower' | 'none';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'urgent' | 'update' | 'event';
  date: string;
}

export interface SystemLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
}

export interface SystemUser {
  username: string;
  fullName: string;
  role: 'admin' | 'user';
  password?: string;
}

export interface SystemSetting {
  key: string;
  value: string;
}
