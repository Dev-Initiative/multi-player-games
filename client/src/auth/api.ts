import { request } from '../lib/api'

// The server's routes are still to be decided (PROJECT.md §8). These are the
// assumed shapes; if the backend lands differently, only this file changes.

export type Player = {
  id: string
  username: string
}

export type Session = {
  token: string
  player: Player
}

type Credentials = {
  username: string
  password: string
}

/** 201 with a session. 409 if the username is taken, 400 if it fails validation. */
export function register(credentials: Credentials) {
  return request<Session>('/auth/register', { method: 'POST', body: credentials })
}

/** 200 with a session. 401 on a wrong username or password. */
export function login(credentials: Credentials) {
  return request<Session>('/auth/login', { method: 'POST', body: credentials })
}
