import { UserOutput } from '../interfaces/user.interface';

type InputUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  status: { code: string } | null;
  roles: { role: { name: string } }[];
};

export const toUserOutput = (user: InputUser, profileImage?: unknown): UserOutput => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  status: user.status?.code ?? null,
  emailVerified: user.emailVerified,
  roles: user.roles.map((r) => r.role.name),
  profileImage,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});
