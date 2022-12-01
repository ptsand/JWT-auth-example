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
    user.password = await argon2.hash(user.password); // argon2 recommended by owasp
    // ref: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#argon2id
    const { username, password, email, role, confirmationCode } = user;
    return db.query(
        'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?);',
        [username, password, email, role]
    ).then((res)=>db.query('INSERT INTO confirmation_codes (user_id, code) VALUES (?, ?);', 
        [res[0].insertId, confirmationCode]));
}

const confirmEmail = async (userID) => {
    return await Promise.all([
        db.query('UPDATE users SET email_confirmed = 1 WHERE id = ?;', [userID]),
        db.query('DELETE FROM confirmation_codes WHERE user_id = ?;', [userID])
    ]);
}

const confirmationCode = async (userID) => {
    const [[row]] = await db.query('SELECT code FROM confirmation_codes WHERE user_id = ?;', [userID]);
    return row?.code;
}

export default { setupConnectionPooling, userByUsername, users, saveUser, confirmEmail, confirmationCode}