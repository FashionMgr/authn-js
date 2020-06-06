/*
 * Bare API methods have no local side effects (unless you count debouncing).
 */

import { Credentials, AuthError, RegisterForm } from './types';
import { get, post, del } from "./verbs";

// TODO: extract debouncing
let inflight: boolean = false;

let ISSUER: string = '';
export function setHost(URL: string): void {
  ISSUER = URL.replace(/\/$/, '');
}

interface TokenResponse {
  id_token: string;
}

export function signup(form: RegisterForm): Promise<string> {
  return new Promise((
    fulfill: (data?: string) => any,
    reject: (errors: AuthError[]) => any
  ) => {
    if (inflight) {
      reject([{message: "duplicate"}]);
      return;
    } else {
      inflight = true;
    }

    post<TokenResponse>(url('/accounts'), form)
      .then(
        (result: TokenResponse) => fulfill(result.id_token),
        (errors: Error[]) => reject(errors)
      )
      .then(() => inflight = false);
  });
}

function isTaken(e: AuthError) {
  return e.field === 'email' && e.message === 'TAKEN';
}

export function isAvailable(email: string): Promise<boolean> {
  return get<boolean>(url('/accounts/available'), {email})
    .then((bool) => bool)
    .catch((e: Error | AuthError[]) => {
      if (!(e instanceof Error) && e.some(isTaken)) {
        return false;
      }
      throw e;
    });
}

export function refresh(): Promise<string> {
  return get<TokenResponse>(url('/session/refresh'), {})
    .then((result) => result.id_token);
}

export function login(credentials: Credentials): Promise<string> {
  return post<TokenResponse>(url('/session'), credentials)
    .then((result: TokenResponse) => result.id_token);
}

export function logout(): Promise<void> {
  return del<void>(url('/session'));
}

export function requestPasswordReset(email: string): Promise<{}> {
  return get(url('/password/reset'), {email});
}

export function changePassword(args: {password: string, currentPassword: string}): Promise<string> {
  return post<TokenResponse>(url('/password'), args)
    .then((result) => result.id_token);
}

export function resetPassword(args: {password: string, token: string}): Promise<string> {
  return post<TokenResponse>(url('/password'), args)
    .then((result) => result.id_token);
}

export function requestSessionToken(email: string): Promise<{}> {
  return get(url('/session/token'), {email});
}

export function sessionTokenLogin(credentials: {token: string}): Promise<string> {
  return post<TokenResponse>(url('/session/token'), credentials)
    .then((result) => result.id_token);
}

function url(path: string): string {
  if (!ISSUER.length) {
    throw "ISSUER not set";
  }
  return `${ISSUER}${path}`;
}
