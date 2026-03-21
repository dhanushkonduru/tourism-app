import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  AuthMode,
  AuthUser,
  FirebaseConfig,
  LocalStoredUser,
  LoginPayload,
  SignUpPayload
} from '../models/auth-user.model';

const SESSION_KEY = 'auth_session';
const USERS_KEY = 'localUsers';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly currentUserSubject = new BehaviorSubject<AuthUser | null>(this.restoreSession());
  private mode: AuthMode = environment.authMode;

  private firebaseInitPromise: Promise<void> | null = null;
  private firebaseAuth: any = null;
  private firebaseDb: any = null;

  signUpWithEmail(payload: SignUpPayload): Promise<AuthUser> {
    if (this.mode === 'firebase') {
      return this.signUpFirebase(payload);
    }

    return this.signUpLocal(payload);
  }

  loginWithEmail(payload: LoginPayload): Promise<AuthUser> {
    if (this.mode === 'firebase') {
      return this.loginFirebase(payload);
    }

    return this.loginLocal(payload);
  }

  async logout(): Promise<void> {
    if (this.mode === 'firebase') {
      await this.initializeFirebase();
      if (this.firebaseAuth) {
        const { signOut } = await import('firebase/auth');
        await signOut(this.firebaseAuth);
      }
    }

    localStorage.removeItem(SESSION_KEY);
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): Observable<AuthUser | null> {
    return this.currentUserSubject.asObservable();
  }

  getCurrentUserSnapshot(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  setMode(mode: AuthMode): void {
    this.mode = mode;
  }

  getMode(): AuthMode {
    return this.mode;
  }

  async getFirebaseFirestore(): Promise<any | null> {
    if (this.mode !== 'firebase') {
      return null;
    }

    await this.initializeFirebase();
    return this.firebaseDb;
  }

  private async signUpLocal(payload: SignUpPayload): Promise<AuthUser> {
    const users = this.readLocalUsers();
    const normalizedEmail = payload.email.trim().toLowerCase();

    if (users.some((user) => user.email === normalizedEmail)) {
      throw new Error('Email already in use. Please login instead.');
    }

    const passwordHash = await this.hashPassword(payload.password);
    const localUser: LocalStoredUser = {
      uid: this.generateId(),
      displayName: payload.fullName.trim(),
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    users.push(localUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const authUser = this.toAuthUser(localUser);
    this.setSession(authUser);
    return authUser;
  }

  private async loginLocal(payload: LoginPayload): Promise<AuthUser> {
    const users = this.readLocalUsers();
    const normalizedEmail = payload.email.trim().toLowerCase();
    const foundUser = users.find((user) => user.email === normalizedEmail);

    if (!foundUser) {
      throw new Error('No account found with this email.');
    }

    const passwordHash = await this.hashPassword(payload.password);
    if (foundUser.passwordHash !== passwordHash) {
      throw new Error('Wrong password. Please try again.');
    }

    const authUser = this.toAuthUser(foundUser);
    this.setSession(authUser);
    return authUser;
  }

  private async signUpFirebase(payload: SignUpPayload): Promise<AuthUser> {
    await this.initializeFirebase();
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');

    const credential = await createUserWithEmailAndPassword(this.firebaseAuth, payload.email, payload.password);
    await updateProfile(credential.user, {
      displayName: payload.fullName.trim()
    });

    await setDoc(doc(this.firebaseDb, 'users', credential.user.uid), {
      displayName: payload.fullName.trim(),
      email: payload.email.trim().toLowerCase(),
      createdAt: serverTimestamp()
    });

    const authUser: AuthUser = {
      uid: credential.user.uid,
      displayName: payload.fullName.trim(),
      email: credential.user.email ?? payload.email.trim().toLowerCase()
    };

    this.setSession(authUser);
    return authUser;
  }

  private async loginFirebase(payload: LoginPayload): Promise<AuthUser> {
    await this.initializeFirebase();
    const { signInWithEmailAndPassword } = await import('firebase/auth');

    const credential = await signInWithEmailAndPassword(this.firebaseAuth, payload.email, payload.password);
    const authUser: AuthUser = {
      uid: credential.user.uid,
      displayName: credential.user.displayName?.trim() || payload.email.split('@')[0],
      email: credential.user.email ?? payload.email.trim().toLowerCase()
    };

    this.setSession(authUser);
    return authUser;
  }

  private async initializeFirebase(): Promise<void> {
    if (this.firebaseInitPromise) {
      return this.firebaseInitPromise;
    }

    this.firebaseInitPromise = (async () => {
      if (!this.hasFirebaseConfig(environment.firebase)) {
        throw new Error('Firebase mode is enabled but config is missing in environment files.');
      }

      const { initializeApp, getApps } = await import('firebase/app');
      const { getAuth } = await import('firebase/auth');
      const { getFirestore } = await import('firebase/firestore');

      const app = getApps().length > 0 ? getApps()[0] : initializeApp(environment.firebase as FirebaseConfig);
      this.firebaseAuth = getAuth(app);
      this.firebaseDb = getFirestore(app);
    })();

    return this.firebaseInitPromise;
  }

  private hasFirebaseConfig(config: FirebaseConfig | null): config is FirebaseConfig {
    if (!config) {
      return false;
    }

    return Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
  }

  private setSession(user: AuthUser): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private restoreSession(): AuthUser | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as AuthUser;
      if (!parsed?.uid || !parsed?.email) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }

  private readLocalUsers(): LocalStoredUser[] {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as LocalStoredUser[]) : [];
    } catch {
      return [];
    }
  }

  private toAuthUser(user: LocalStoredUser): AuthUser {
    return {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email
    };
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    return `uid-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  }

  private async hashPassword(input: string): Promise<string> {
    const normalized = input.trim();

    if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined') {
      const encoder = new TextEncoder();
      const data = encoder.encode(normalized);
      const digest = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
    }

    return btoa(normalized);
  }
}
