export interface JwtAccountPayload {
  id:        number;
  email:     string;
  role:      'CUSTOMER' | 'ADMIN' | 'SYSTEM_ADMIN' | 'SELLER' | 'OTHER';
  verified:  boolean;
  active:    boolean;
}