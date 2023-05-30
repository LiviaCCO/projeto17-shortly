import { db } from "../database/database.connection.js";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

export async function signUp(req, res) {
    const { name, email, password,  confirmPassword } = req.body;
    try {
        const user = await db.query(`SELECT * FROM users WHERE email=$1;`, [email]);
        if (user.rows) return res.status(409).send("E-mail já cadastrado!");
        if (password!==confirmPassword) return res.status(422).send("As senhas não são iguais!");
        //cripto senha
        const hash = bcrypt.hashSync(password, 10);
        await db.query(`INSERT INTO users (name, email, password) VALUES $1, $2, $3;`, [name, email, password]);
        res.sendStatus(201);
    } catch (err) {
        res.status(500).send(err.message)
    }
}

export async function login(req, res) {
    const { email, password } = req.body;
    try {
        const user = await db.query(`SELECT * FROM users WHERE email=$1;`, [email]);
        if (!user) return res.status(401).send("E-mail ainda não cadastrado!");
        // verif senha
        const passwordCorrect = bcrypt.compareSync(password, user.password);
        if (!passwordCorrect) return res.status(401).send("A senha está incorreta!");
        //token
        const token = uuid();
        await db.query(`UPDATE users SET token=$1 WHERE email=$2;`, [token, email]);
        res.status(200).send({ token });
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function logout(req, res) {
    const { token } = res.locals.session;
    try {
        await db.query(`UPDATE users SET token=$1 WHERE token=$2;`, [null, token]);
        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err.message);
    }
}