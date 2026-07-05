export type AvailableGroupMemberUser = {
  id: string;
  email?: string;
};

export type GroupMember = {
  id: string;
  groupId: string;
  groupName?: string;
  userId: string;
  userEmail?: string;
  isActive: boolean;
  joinedAt: string;
  createdAt: string;
  updatedAt?: string;
};

export type CreateGroupMemberRequest = {
  groupId: string;
  userId: string;
};

export type UpdateGroupMemberRequest = {
  groupId: string;
  userId: string;
  isActive: boolean;
};