// @ts-nocheck
import { get } from 'svelte/store';
import { BASE_URL } from '../store/globals.js';
import { refreshAccessTokenAndTryAgain, tokenExpired } from './tokenUtil.js';

let fetchArgs; // save to resend original req with new access token

const makeReq = async (path, method, body) => {
  // need to save fetch args to replay request after refreshing
  fetchArgs = [path, method, body];
  const options = {
    method: method || "get",  // use get as default
    credentials: 'include',
    headers: {
      "Content-type": "application/json",
      "Accept": "application/json"
    }
  };
  if (body) options.body = JSON.stringify(body); // optional body
  // authenticate with access token, if present
  const accessToken = sessionStorage.getItem('accessToken');
  if (accessToken) {
    if (tokenExpired(accessToken)) return refreshAccessTokenAndTryAgain(fetchArgs);
    options.headers.Authorization = `Bearer ${accessToken}`;
  }
  return fetch(`${get(BASE_URL)}/api${path}`, options).then(res => handleErrors(res));
}

const handleErrors = async (res) => {
  if (!res.ok) {
    if (res.status === 403) {
      // access token expired, try refreshing
      return refreshAccessTokenAndTryAgain(fetchArgs);
    }
    const errorResponse = await res.json();
    const error = new Error(errorResponse.message);
    throw error;
  }
  if (res.status === 204) return; // do not try to parse json on 204 empty responses
  return res.json();
}

export default makeReq;