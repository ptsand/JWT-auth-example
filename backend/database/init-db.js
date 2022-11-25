console.log("running standalone script to clear, setup and seed the db...");

import { setupConnectionPooling, saveUser } from "./dbWrapper.js";
import * as dotenv from 'dotenv';
dotenv.config({ path: ".env.dev" });    // load .env file

const db = setupConnectionPooling();

await db.query('DROP TABLE IF EXISTS users;');

await db.query(
    `CREATE TABLE IF NOT EXISTS users (
        id          INTEGER PRIMARY KEY AUTO_INCREMENT,
        username    VARCHAR(255) NOT NULL UNIQUE,
        password    VARCHAR(255) NOT NULL,
        email       VARCHAR(255) NOT NULL UNIQUE,
        role        ENUM('user', 'admin') DEFAULT 'user',
        is_enabled  BOOLEAN DEFAULT 1, -- default to enabled
        CONSTRAINT user_constraints CHECK (CHAR_LENGTH(password) >= 10 AND CHAR_LENGTH(email) > 3)
    );`
);
// seed the database
await saveUser({username: "testAdmin", password: "testPasswordAdmin", email: "admin@localhost", role: "admin"});
await saveUser({username: "testUser", password: "testPasswordUser", email: "user@localhost", role: "user"});

console.log("done");
process.exit();
