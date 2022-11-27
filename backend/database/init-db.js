console.log("running standalone script to clear, setup and seed the db...");

import { setupConnectionPooling, saveUser } from "./dbWrapper.js";
import * as dotenv from 'dotenv';
dotenv.config({ path: ".env.dev" });    // load .env file
const { randomBytes } = await import('node:crypto');


const db = setupConnectionPooling();

await db.query('DROP TABLE IF EXISTS users;');
await db.query(
    `CREATE TABLE IF NOT EXISTS users (
        id              INTEGER PRIMARY KEY AUTO_INCREMENT,
        username        VARCHAR(255) NOT NULL UNIQUE,
        password        VARCHAR(255) NOT NULL,
        email           VARCHAR(255) NOT NULL UNIQUE,
        role            ENUM('user', 'admin') DEFAULT 'user',
        enabled         BOOLEAN DEFAULT 1, -- default to enabled
        email_confirmed BOOLEAN DEFAULT 0, 
        CONSTRAINT user_constraints CHECK (CHAR_LENGTH(password) >= 10 AND CHAR_LENGTH(email) > 3)
    );`
);
await db.query('DROP TABLE IF EXISTS confirmation_codes;');
await db.query(
    `CREATE TABLE IF NOT EXISTS confirmation_codes (
        user_id     INTEGER PRIMARY KEY REFERENCES users(id),
        code        VARCHAR(255) NOT NULL UNIQUE
    );`
);
// seed the database
await Promise.all([
    saveUser({username: "testAdmin", password: "testPasswordAdmin", email: "admin@localhost",
                role: "admin", confirmationCode: randomBytes(10).toString("hex")}),
    saveUser({username: "testUser", password: "testPasswordUser", email: "user@localhost", 
                role: "user", confirmationCode: randomBytes(10).toString("hex")})
]);

console.log("done");
process.exit();
