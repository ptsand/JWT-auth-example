import mysql from "mysql2";
import * as argon2 from "argon2";

let db; // to be set when environment is loaded

const setupConnectionPooling = () => {
    try {
        db = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            //debug: true
        }).promise();
    } catch (err) {
        console.log("Error creating db connection pool:", err.message);
    }
    return db;
}

const userByUsername = async (username) => {
    if (!username) return false;
    const [[user]] = await db.query('SELECT * FROM users WHERE username = ?;', [username]);
    return user;
}

const users = async () => {
    const [users] = await db.query('SELECT * FROM users;');
    return users;
}

const saveUser = async (user) => {
    user.password = await argon2.hash(user.password);   // hash password
    const { username, password, email, role } = user;
    return db.query(
        'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
        [username, password, email, role]);
}

export {setupConnectionPooling, userByUsername, users, saveUser};
