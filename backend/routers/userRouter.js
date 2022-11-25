import { Router } from "express";
import { authenticate } from "../utils/tokenHandler.js";
import { saveUser, userByUsername, users } from "../database/dbWrapper.js";

const router = Router();

export const roles = ['user', 'admin']; // set as enum in db

const req_base = "/api/users";

// protected endpoint (admins only) TODO: fix
router.get(req_base, authenticate, (req, res) => {
    if (req.user.role === roles[1]) return res.send(users);
    res.sendStatus(403);
});
// let authenticated user retrieve user data not in token
router.get(`${req_base}/me`, authenticate, async (req, res) => {
    // important: req.user.name is NOT comming from the client,
    // but extracted from a VERIFIED token in authenticate middleware function
    const user = { ...await userByUsername(req.user.username) };
    delete user.password;   // don't send password hash to client
    res.send(user);
});
// register endpoint
router.post(req_base, async (req, res) => {
    // TODO: validation
    const user = { ...req.body, role: roles[0] };       // set role
    try {
        await saveUser(user);
        res.send({ message:"Registration successful" });
    } catch (err) {
        res.status(409).send({ message: err.message });
    }
});

export default router;
