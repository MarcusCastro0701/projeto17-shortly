import bcrypt from "bcrypt"
import { connectionDB } from "../database/db.js"
import joi from "joi"
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

dayjs.extend(customParseFormat);

export async function signUp(req, res){

    const user = req.body;
    
    const hashPassword = bcrypt.hashSync(user.password, 10);
    

    let today = dayjs().locale('pt-br').format('YYYY-MM-DD');

    if(user.password !== user.confirmPassword){
        console.log("senhas nao correspondem");
        res.sendStatus(400);
        return
    }

    
    const verificaEmail = await connectionDB.query("SELECT * FROM users WHERE email=$1;", [user.email]);
    
    if(verificaEmail.rows.length !== 0){
        console.log("Ja existe um usuário cadastrado com este email;")
        res.sendStatus(409);
        return
    }
    

    try {
        
        await connectionDB.query('INSERT INTO users (name, email, password, "createdAt") VALUES ($1, $2, $3, $4);', [user.name, user.email, hashPassword, today]);
        console.log("usuario criado")
        res.send(200);
    } catch (error) {
        console.log(error, "erro no try/catch de signUp");
        res.sendStatus(500);
        return
    }

}