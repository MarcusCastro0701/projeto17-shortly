import bcrypt from "bcrypt"
import { connectionDB } from "../database/db.js"
import joi from "joi"
import { v4 as uuidV4 } from 'uuid';
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import { nanoid } from 'nanoid'

dayjs.extend(customParseFormat);

export async function postShort(req, res) {

    const { url } = req.body;
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");

    let today = dayjs().locale('pt-br').format('YYYY-MM-DD');

    if (!token || !url) {
        console.log("token não enviado");
        res.sensStatus(401);
        return
    }

    const session = await connectionDB.query("SELECT * FROM sessions WHERE token=$1;", [token]);
    if (session.rows.length === 0) {
        console.log("nao foi encontrado o token em sessions");
        res.sendStatus(401);
        return
    }

    const short = nanoid(8);
    const userId = session.rows[0].userId;
    const zero = 0;

    try {
        await connectionDB.query('INSERT INTO urls ("userId", "shortUrl", url, "visitCount", "createdAt") VALUES ($1, $2, $3, $4, $5);', 
        [userId, short, url, zero, today]);

        const resposta = await connectionDB.query('SELECT "shortUrl" FROM urls WHERE "shortUrl"=$1;', [short]);
        console.log(resposta);
        res.send(resposta.rows[0]);
        return
    } catch (error) {
        console.log(error, "erro no try/catch de postShort");
        res.sendStatus(500);
        return
    }


}

export async function getUrlbyId(req, res){
    
    const { id } = req.params;

    if(!id){
        res.sendStatus(401);
        return
    }

    const verificaUrl = await connectionDB.query('SELECT * FROM urls WHERE id=$1;', [id]);
    if(verificaUrl.rows.length === 0){
        console.log("id da url nao encontrada");
        res.sendStatus(404);
        return
    }

    try {
        const url = await connectionDB.query('SELECT id, "shortUrl", url FROM urls WHERE id=$1;', [id]);
        console.log("get by id feito em getUrlbyId")
        res.send(url.rows[0]).status(200);
        return

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
        return
    }

}

export async function getShort(req, res){

    const { shortUrl } = req.params;

    if(!shortUrl){
        res.sendStatus(401);
        return
    }

    const verificaShort = await connectionDB.query('SELECT * FROM urls WHERE "shortUrl"=$1;', [shortUrl]);
    if(verificaShort.rows.length === 0){
        console.log("shortUrl não encontrada");
        res.sendStatus(404);
        return
    }

    const visita = verificaShort.rows[0].visitCount + 1;
    const url = verificaShort.rows[0].url;

    try {
        
        await connectionDB.query('UPDATE urls SET "visitCount"=$1 WHERE "shortUrl"=$2;', [visita, shortUrl]);
        res.redirect(url);
        return

    } catch (error) {
        
        console.log(error, "deu erro no try/catch de getShort");
        res.sendStatus(500);
        return

    }

}

export async function deleteShort(req, res){

    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");
    const { id } = req.params;

    if (!token || !id) {
        
        res.sensStatus(401);
        return
    }

    const verificaSession = await connectionDB.query('SELECT * FROM sessions WHERE token=$1;', [token]);
    const userIdSession = verificaSession.rows[0].userId;

    const verificaUrl = await connectionDB.query('SELECT * FROM urls WHERE id=$1;', [id]);
    if(verificaUrl.rows[0].length === 0){
        console.log("essa url não existe");
        res.sendStatus(404);
        return
    }
    const userIdUrl = verificaUrl.rows[0].userId;

    console.log(userIdSession, userIdUrl)

    if(userIdSession !== userIdUrl){
        console.log("a url nao pertence ao usuário logado");
        res.sendStatus(401);
        return
    }
    

    try {
        await connectionDB.query('DELETE FROM urls WHERE id=$1;', [id]);
        console.log("url deletada");
        res.sendStatus(204);
        return
    } catch (error) {
        console.log(error, "erro no try/catch de deleteShort");
        res.sendStatus(500)
    }
    

}

export async function getUsersMe(req, res){

    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");

    if (!token || !authorization) {
        
        res.sensStatus(401);
        return
    }

    const verificaUser = await connectionDB.query('SELECT * FROM sessions WHERE token=$1;', [token]);
    if(verificaUser.rows.length === 0){
        console.log("usuário não encontrado");
        res.send(404);
        return
    }

    const userId = verificaUser.rows[0].userId

    try {
        const query = await connectionDB.query('SELECT u.id, u.name, SUM(urls."visitCount") AS "visitCount",json_agg(urls.*)as "shortnedUrls" FROM users u JOIN urls ON urls."userId"=u.id WHERE urls."userId"=$1 GROUP BY u.id;', [userId]);
        console.log("query feita")
        res.send(query.rows[0]).status(200);
        return

    } catch (error) {
        console.log(error, "erro no try/catch de getUsersMe");
        res.sendStatus(500)
    }


}

export async function getRanking(req, res){

    try {
        const query = await connectionDB.query('SELECT u.id, u.name, COUNT(urls.url) AS "linksCount", COALESCE(SUM(urls."visitCount"), 0) AS "visitCount" FROM users u LEFT JOIN urls ON u.id = urls."userId" GROUP BY u.id ORDER BY "visitCount" DESC LIMIT 10;');
        console.log("query enviada", query.rows[0])
        res.send(query.rows[0]).status(200);
        return
    } catch (error) {
        console.log(error, "erro no try/catch de getRanking");
        res.sendStatus(500);
        return
    }

}