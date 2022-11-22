// @ts-nocheck
import jwtDecode from 'jwt-decode';
import makeReq from './fetchWrapper.js';

export const refreshAccessTokenAndTryAgain = async (fetchArgs) => {
    // handle if tokens are expired or invalid
    sessionStorage.removeItem("accessToken"); // remove expired token to avoid stack overflow
    const refreshToken = sessionStorage.getItem('refreshToken');
    if (!refreshToken || tokenExpired(refreshToken)) throw new Error("Session lost or expired");
    
    const originalFetchArgs = [ ...fetchArgs ];
    
    return makeReq( // fetch new accessToken
        "/auth/refresh", "post", { refreshToken: sessionStorage.getItem('refreshToken') }
    ).then(res => {
        sessionStorage.setItem('accessToken', res.accessToken);
        console.log("got a new access token:", res.accessToken);
        return makeReq(...originalFetchArgs); // make the original request again (with refreshed accessToken)
    });
}

export const tokenExpired = token => {
    const { exp } = jwtDecode(token); // expires exp seconds after epoch
    const expireTime = exp * 1000; // convert to ms since epoch to match Date.now()
    if (Date.now() > expireTime) return true;
}