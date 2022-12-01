// @ts-nocheck
import jwtDecode from 'jwt-decode';
import makeReq from './fetchWrapper.js';
import { get } from 'svelte/store';
import { user } from '../store/globals.js';

export const refreshAccessTokenAndTryAgain = async (fetchArgs) => {
    setAccessToken(null);
    const refreshToken = get(user).tokens.refresh;
    
    const originalFetchArgs = [ ...fetchArgs ];
    
    return makeReq( // fetch new accessToken
        "/auth/refresh", "post", { token: refreshToken }
    ).then(res => {
        setAccessToken(res.token);
        console.log("refreshed access token:", res.token);
        return makeReq(...originalFetchArgs); // make the original request again (with refreshed accessToken)
    });
}

export const tokenExpired = token => {
    // console.log(token);
    if (!token || token === null) return true;
    try {
        const { exp } = jwtDecode(token); // expires exp seconds after epoch
        const expireTime = exp * 1000; // convert to ms since epoch to match Date.now()
        if (Date.now() > expireTime) return true;
    } catch (err) {
        return true;
    }
}

const setAccessToken = token => {
    user.update(user => { 
        user.tokens.access = token;
        return user;
    });
}