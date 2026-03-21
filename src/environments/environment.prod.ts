import { AuthMode, FirebaseConfig } from '../app/models/auth-user.model';

interface AppEnvironment {
  production: boolean;
  authMode: AuthMode;
  firebase: FirebaseConfig | null;
}

export const environment: AppEnvironment = {
  production: true,
  authMode: 'local',
  firebase: null
};
