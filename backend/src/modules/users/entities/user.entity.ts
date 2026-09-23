export class User {
  id: string;
  tenantCode: string;
  username: string;
  passwordHash: string;
  role: string;
  isActive?: boolean;
}
