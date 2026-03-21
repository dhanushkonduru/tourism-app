export type AuthMode = 'local' | 'firebase';

export interface AuthUser {
  uid: string;
  displayName: string;
  email: string;
}

export interface SignUpPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LocalStoredUser {
  uid: string;
  displayName: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
}
