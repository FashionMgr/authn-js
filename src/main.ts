import SessionManager from './SessionManager';
import {
  signup as signupAPI,
  login as loginAPI,
  logout as logoutAPI,
  changePassword as changePasswordAPI
} from "./api";

let manager = new SessionManager();
export function setStore(store: SessionStore): void {
  manager.setStore(store);
  manager.maintain();
}

export function session(): string | undefined {
  return manager.session ? manager.session.token : undefined;
}

export function signup(credentials: Credentials): Promise<void> {
  return signupAPI(credentials)
    .then(updateStore);
}

export function login(credentials: Credentials): Promise<void> {
  return loginAPI(credentials)
    .then(updateStore);
}

export function logout(): Promise<void> {
  return logoutAPI()
    .then(() => manager.endSession());
}

export function changePassword(args: {password: string, token?: string}): Promise<void> {
  return changePasswordAPI(args)
    .then(updateStore);
}

// export remaining API methods unmodified
export * from "./api";

function updateStore(token: string) {
  manager.updateAndMaintain(token);
}
