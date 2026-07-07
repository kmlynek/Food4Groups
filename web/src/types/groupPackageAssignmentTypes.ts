export type GroupPackageAssignment = {
  id: string;
  groupId: string;
  groupName?: string;
  packageId: string;
  packageName?: string;
  packagePricePerPerson: number;
  activeFrom: string;
  activeTo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type CreateGroupPackageAssignmentRequest = {
  groupId: string;
  packageId: string;
  activeFrom: string;
  activeTo?: string | null;
};

export type UpdateGroupPackageAssignmentRequest = {
  groupId: string;
  packageId: string;
  activeFrom: string;
  activeTo?: string | null;
  isActive: boolean;
};