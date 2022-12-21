import bcrypt from "bcrypt"
import { connectionDB } from "../database/db.js"
import joi from "joi"
import { v4 as uuidV4 } from 'uuid';
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

dayjs.extend(customParseFormat);

export async function signIn(req, res){

    const { email, password } = req.body;
    const token = uuidV4();
    let today = dayjs().locale('pt-br').format('YYYY-MM-DD');

    const user = await connectionDB.query('SELECT * FROM users WHERE email=$1;', [email]);
    if(user.rows.length === 0){
        console.log("usuário não encontrado");
        res.sendStatus(401);
        return
    }

    const userId = user.rows[0].id;

    const verificaLogin = await connectionDB.query('SELECT * FROM sessions WHERE "userId"=$1;', [userId])
    if(verificaLogin.rows.length !== 0){
        console.log("usuário ja está logado");
        res.sendStatus(409);
        return
    }

    const passwordOk = bcrypt.compareSync(password, user.rows[0].password);
    if(!passwordOk){
        console.log("senha ou usuário incorretos");
        res.sendStatus(401);
        return
    }

    try {
        await connectionDB.query('INSERT INTO sessions ("userId", token, "createdAt") VALUES ($1, $2, $3);', [userId, token, today]);
        console.log("login feito");
        res.sendStatus(200);
    } catch (error) {
        console.log(error, "erro no try/catch de signIn");
        res.sendStatus(500);
        return
    }

}