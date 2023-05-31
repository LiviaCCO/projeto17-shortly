import {nanoid} from "nanoid";
import { db } from "../database/database.connection.js";

//verificar
export async function createShorten(req, res) {
    const { url } = req.body;
    const { userId } = res.locals;
    
    const shortUrl = nanoid();

    try {
        await db.query(`INSERT INTO urls ("shortUrl", url, views, "userId") VALUES ($1, $2, $3, $4);`, [shortUrl, url, '0', userId]);
        const short = await db.query(`SELECT * FROM urls WHERE "shortUrl"=$1;`, [shortUrl]);
        const resp = {id: short.rows[0].id, shortUrl: short.rows[0].shortUrl};
        
        res.status(201).send(resp);
    } catch (err) {
        res.status(500).send(err.message);
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
        const isUrl = await db.query(`SELECT * FROM urls WHERE "shortUrl"=$1;`, [url]);
        if (!isUrl.rows) return res.sendStatus(404);
        // somar mais um view
        const views = isUrl.rows.views;
        await db.query(`UPDATE urls SET views=$1 WHERE "shortUrl"=$2`, [(views+1), url]);
        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err.message)
    }
}
//verificar
export async function deleteId(req, res) {
    const { userId } = res.locals;
   // const auth = req.header('Authorization');
    const { id } = req.params;
    if (!id) return res.sendStatus(404);
    try {
        if (!auth) return res.sendStatus(401);
        const user = await db.query(`SELECT * FROM users WHERE token=$1;`, [userId]);
        const url = await db.query(`SELECT * FROM urls WHERE id=$1;`, [id]);
        if(user.rows.id !== url.rows.idUser) return res.sendStatus(401);
        await db.query(`DELETE FROM urls WHERE id=$1;`, [id]);
        res.sendStatus(204)
    } catch (err) {
        res.status(500).send(err.message)
    }
}

export async function getUser(req, res) {
    const { userId } = res.locals;
    //const auth = req.header('Authorization');
    try {
        const user = await db.query(`SELECT * FROM users WHERE token=$1;`, [userId]);
        const urls = await db.query(`SELECT * FROM urls WHERE userId=$1;`, [userId]);
        const sumVisit = await db.query(`SELECT SUM (views) AS "visitCount" FROM urls WHERE "userId"=$1;`, [userId])
        const urlTable = urls.rows.map(d => (
            {
                id: d.id,
                shortUrl: d.shortUrl,
                url: d.url,
                visitCount: d.visitCount
            }
        ))
        const resp = {
            id: user.rows.id,
            name: user.rows.name,
            visitCount: sumVisit.rows[0],
            shortenedUrls: urlTable
        }
        res.status(200).send(resp);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function getRanking(req, res) {
    
    try {
        const allUser = await db.query(`
            SELECT SUM (urls.views) AS "visitCount", COUNT("userId") AS "linksCount", users.id, users.name
                FROM urls
                JOIN users ON urls."userId" = users.id
                GROUP BY users.id
                ORDER BY "linksCount"
                LIMIT 10;
        `);
        const summary = allUser.rows.map(d => {
            return{
                id: d.id,
                name: d.name,
                linksCount: d.linksCount,
                visitCount: d.visitCount
            }
        })
        res.status(200).send(summary);
    } catch (err) {
        res.status(500).send(err.message)
    }
}