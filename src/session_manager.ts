import { SessionStore } from "./types";
import { Session } from "./session";
import { refresh as refreshAPI } from "./api";

export class SessionManager {
  private readonly store: SessionStore;
  private timeoutID: number;

  constructor(store: SessionStore) {
    this.store = store;
  }

  get session(): Session | undefined {
    return this.store.session;
  }

  maintain(): void {
    if (!this.session) {
      return;
    }

    const refreshAt = (this.session.iat() + this.session.halflife()) * 1000; // in ms
    const now = (new Date).getTime();

    // NOTE: if the client's clock is quite wrong, we'll end up being pretty aggressive about
    // maintaining their session on pretty much every page load.
    if (now < this.session.iat() || now >= refreshAt) {
      this.refresh();
    } else {
      this.scheduleRefresh(refreshAt - now);
    }
  }

  updateAndMaintain(id_token: string): void {
    this.store.update(id_token);
    if (this.session) {
      this.scheduleRefresh(this.session.halflife() * 1000);
    }
  }

  private scheduleRefresh(delay: number): void {
    clearTimeout(this.timeoutID);
    this.timeoutID = setTimeout(() => this.refresh(), delay);
  }

  private refresh(): void {
    refreshAPI().then(
      (id_token) => this.updateAndMaintain(id_token),
      (error) => {
        if (error === 'Unauthorized') {
          this.store.delete();
        }
      }
    );
  }
}
