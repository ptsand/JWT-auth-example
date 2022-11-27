import { Router } from "express";
import { authenticate } from "../utils/tokenHandler.js";
import { confirmationCode, confirmEmail, saveUser, userByUsername, users } from "../database/dbWrapper.js";
import { sendConfirmationMail } from "../utils/mailer.js";
const { randomBytes } = await import('node:crypto');

const router = Router();

export const roles = ['user', 'admin']; // set as enum in db

const req_base = "/api/users";

// let authenticated user retrieve user data not in token
router.get(`${req_base}/me`, authenticate, async (req, res) => {
    // important: req.user.name is NOT comming from the client,
    // but extracted from a VERIFIED token in authenticate middleware function
    const user = { ...await userByUsername(req.user.username) };
    delete user.password;   // don't send password hash to client
    res.send(user);
});

router.get(`${req_base}/confirm-email/:code`, authenticate, async (req, res) => {
    const trueCode = await confirmationCode(req.user.id);
    if (req.params.code === trueCode) {
        await confirmEmail(req.user.id);
        return res.send({ message: "Your email was successfully confirmed, thank you." });
    }
    res.status(400).send({ message: "Your email was already confirmed!" });
});
// register endpoint
router.post(req_base, async (req, res) => {
    // TODO: validation
    const confirmationCode = randomBytes(10).toString("hex");
    const user = { ...req.body, role: roles[0], confirmationCode};  // set role, code
    try {
        await saveUser(user);
        sendConfirmationMail(user.email, confirmationCode);
        res.send({ message:"Registration successful" });
    } catch (err) {
        res.status(409).send({ message: err.message });
    }
});

// protected endpoint (admins only) TODO: fix
router.get(req_base, authenticate, (req, res) => {
    if (req.user.role === roles[1]) return res.send(users);
    res.sendStatus(403);
});

export default router;
