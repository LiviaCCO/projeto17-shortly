import {nanoid} from "nanoid";
import dayjs from "dayjs"
import { db } from "../database/database.connection.js"
import { ObjectId } from "mongodb"
model.id = nanoid()
//alterar
export async function createShorten(req, res) {
    const { url } = req.body;
    const { userId } = res.locals.session;

    try {
        const transaction = { value: Number(value), description, type, userId, date: dayjs().valueOf() }
        await db.collection("transactions").insertOne(transaction)
        res.sendStatus(201)
    } catch (err) {
        res.status(500).send(err.message)
    }
}

export async function getId(req, res) {
    const { id } = req.params;
    try {
        const isId = await db.query(`SELECT * FROM urls WHERE id=$1;`, [id]);
        if (!isId.rows) return res.status(404).send('Url encurtada não encontrada!');
        const idData = isId.rows.map(d => ({
                id: d.id, shortUrl: d.shortUrl, url: d.url
        }));
        res.status(200).send(idData);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function getUrl(req, res) {
    const { url } = req.params;
    try {
        const isUrl = await db.query(`SELECT * FROM urls WHERE shortUrl=$1;`, [url]);
        if (!isUrl.rows) return res.sendStatus(404);
        // somar mais um view
        const views = isUrl.rows.views;
        await db.query(`UPDATE urls SET views=$1 WHERE shortUrl=$2`, [(views+1), url]);
        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err.message)
    }
}
//rever
export async function deleteId(req, res) {
    const { userId } = res.locals.session;
    const auth = req.header('Authorization');
    const { id } = req.params;
    if (!id) return res.sendStatus(404);
    try {
        if (!auth) return res.sendStatus(401);
        const user = await db.query(`SELECT * FROM users WHERE token=$1;`, [auth]);
        const url = await db.query(`SELECT * FROM urls WHERE id=$1;`, [id]);
        if(user.rows.id !== url.rows.idUser) return res.sendStatus(401);
        await db.query(`DELETE FROM urls WHERE id=$1;`, [id]);
        res.sendStatus(204)
    } catch (err) {
        res.status(500).send(err.message)
    }
}

export async function getUser(req, res) {
    const { userId } = res.locals.session;
    const auth = req.header('Authorization');
    try {
        const user = await db.query(`SELECT * FROM users WHERE token=$1;`, [auth]);
        const numViews = await db.query(`
        SELECT SUM(views), "idUser" 
        FROM urls GROUP BY........ `)
        const userSummary = user.rows.map(d => ({
            id: d.id,
            name: d.name,
            visitCount: .....,
            shortenedUrls: [{id, shortUrl, url, visitCount}]

        }))

        res.status(200).send(userSummary);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function getRanking(req, res) {
    
    try {
        const summary = await.......
        res.status(200).send(summary);
    } catch (err) {
        res.status(500).send(err.message)
    }
}