import { readable, writable } from "svelte/store";

export const BASE_URL = readable("http://localhost:8080");

// parse user from localStorage if possible
export const user = writable(localStorage.user ? JSON.parse(localStorage.user) : null);

// persist in localStorage if user else clear
user.subscribe((user) => user && (localStorage.user = JSON.stringify(user)) || localStorage.clear());

export const pp = json=>JSON.stringify(json, undefined, 2);
