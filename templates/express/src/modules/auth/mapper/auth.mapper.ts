export const toAuthUserOutput = (user: {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  emailVerified: boolean;
  status: { code: string } | null;
  roles: { role: { name: string } }[];
}) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  status: user.status?.code ?? null,
  emailVerified: user.emailVerified,
  roles: user.roles.map((x) => x.role.name)
});
