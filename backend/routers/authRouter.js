import { Router } from "express";
import { 
    sha256,
    refreshTokens, 
    signAccessToken, 
    signRefreshToken, 
    updateAccessToken,
    revokeRefreshToken
} from '../utils/tokenHandler.js';
import * as argon2 from "argon2";
const { randomBytes } = await import('node:crypto');
import { userByUsername } from '../database/dbWrapper.js';

const router = Router();
const req_base = "/api/auth";

router.get(req_base, (req, res) => {
    res.send("auth");
});

router.post(`${req_base}/refresh`, (req, res) => {
    updateAccessToken(req, res);
});

router.delete(`${req_base}/logout`, (req, res) => {
    revokeRefreshToken(req.cookies.token);
    res.sendStatus(204);
});

router.post(`${req_base}/login`, async (req, res) => {
    // verify username and password
    const { username, password } = req.body;
    const user = await userByUsername(username);
    if ( !(user && await argon2.verify(user.password, password)) )
        return res.status(401).send({ message: "Invalid username or password" });
    // create tokens and user context to prevent side jacking, ref:
    // https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html
    const fingerprint = randomBytes(50).toString("hex");
    const claims = { username: user.username, role: user.role, email: user.email, hash: sha256(fingerprint) };
    const accessToken = signAccessToken(claims);
    const refreshToken = signRefreshToken(claims);
    // TODO: use blacklist?
    refreshTokens.push(refreshToken);
    res.cookie('__Secure_Fgp', fingerprint, { 
        httpOnly: true,     // prevent clientside js to read cookie
        sameSite: 'strict', // works with chrome on localhost, safari needs a real domain
        secure: true,       // (localhost is allowed in plaintext though)
        maxAge: 3600*24*7   // 7 days
    });
    res.json({ accessToken, refreshToken});
});

export default router;