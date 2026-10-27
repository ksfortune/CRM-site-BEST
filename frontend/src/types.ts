export type UserRole = 'admin' | 'user';

export type SocialTypeId = 'tg' | 'vk' | 'fb' | 'phone' | 'email' | 'web' | 'other';

export interface UserSocial {
  type: string;
  url?: string;
  value?: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  bestEmail: string;
  phone: string;
  role: UserRole;
  isApproved: boolean;
  isBlocked: boolean;
  socials: UserSocial[];
  createdAt: string;
}

export interface SocialChannel {
  type: string;
  value: string;
}

export interface Contact {
  id: string;
  name: string;
  nickname: string;
  phone: string;
  channels: SocialChannel[];
}

export type CompanyStatus = 'warm' | 'hot';

export interface Company {
  id: string;
  name: string;
  industries: string[];
  status: CompanyStatus;
  contacts: Contact[];
  occupiedBy: string | null;
  occupiedByName: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  demoOccupancyApplied?: boolean;
}

/** Shape accepted by migration, including fields from older stored companies. */
export interface CompanyDraft {
  id?: string;
  name?: string;
  industries?: string[];
  industry?: string;
  status?: string;
  contacts?: Contact[];
  occupiedBy?: string | null;
  occupiedByName?: string | null;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  demoOccupancyApplied?: boolean;
  repName?: string;
  phone?: string;
  messenger?: string;
  email?: string;
  website?: string;
}

export interface Comment {
  id: string;
  companyId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export type ChangeRequestType = 'create' | 'update' | 'delete';

export type ChangeRequestStatus = 'pending' | 'approved' | 'rejected';

export interface ChangeRequest {
  id: string;
  type: ChangeRequestType;
  companyId: string | null;
  targetCompany: Company | null;
  requestedBy: string;
  requestedByName: string;
  status: ChangeRequestStatus;
  createdAt: string;
}

export interface CreateUserInput {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  bestEmail?: string;
  phone?: string;
  role?: UserRole;
  socials?: UserSocial[];
}
