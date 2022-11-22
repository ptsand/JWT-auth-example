import { Router } from "express";
import { 
    sha256,
    refreshTokens, 
    signAccessToken, 
    signRefreshToken, 
    updateAccessToken,
    revokeRefreshToken
} from '../utils/tokenHandler.js';

const { randomBytes } = await import('node:crypto');

import { users } from "./userRouter.js";

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

router.post(`${req_base}/login`, (req, res) => {
    try {
        // TODO: use DB, hashing etc...
        const { username, password } = req.body;
        const user = { ...users.filter(user=>user.name === username && user.password === password)[0] };
        delete user.password; // important
        // set user context to prevent side jacking reference to owasp
        const fingerprint = randomBytes(50).toString("hex");
        const claims = { ...user, hash: sha256(fingerprint)};
        const accessToken = signAccessToken(claims);
        const refreshToken = signRefreshToken(claims);
        // TODO: use blacklist?
        refreshTokens.push(refreshToken);
        // set secure httpOnly cookie with refresh jwt
        res.cookie('__Secure_Fgp', fingerprint, { 
            httpOnly: true, 
            sameSite: 'strict',
            secure: true, // (localhost is allowed in plaintext though)
            maxAge: 3600 * 24 * 365 // 365 days
        });
        res.json({ accessToken, refreshToken});
    } catch(err) {
        res.status(401).send({message: "Invalid username or password"});
    }
});

export default router;