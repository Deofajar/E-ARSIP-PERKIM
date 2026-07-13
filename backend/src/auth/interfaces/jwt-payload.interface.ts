export interface JwtPayload {
  sub: string;
  nip: string;
  namaLengkap: string;
  role: string;
  lastLogin: string | null;
}
