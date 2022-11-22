import { Router } from "express";
import { authenticate } from "../utils/tokenHandler.js";

const router = Router();

export const roles = ['user', 'admin'];

// TODO: use DB
export const users = [
    { name: 'testUser1', password: 'letmein', role: roles[0], email: 'testUser1@localhost' },
    { name: 'adminUser', password: 'testing', role: roles[1], email: 'admin@localhost' }
];

const req_base = "/api/users";

// protected endpoint (admins only)
router.get(req_base, authenticate, (req, res) => {
    if (req.user.role === roles[1]) return res.send(users);
    res.sendStatus(403);
});
// let authenticated user retrieve their data
router.get(`${req_base}/me`, authenticate, (req, res) => {
    const user = { ...users.filter(user => user.name === req.user.name)[0] };
    delete user.password;   // don't send password hashes
    res.send(user);  
});

router.post(req_base, (req, res) => {
    // TODO: check if user already exists
    users.push({ ...req.body, role: roles[0] });
    setTimeout(()=>res.send({message:"Registration successful"}), 200);
});

export default router;
