import express from 'express';
import cors from 'cors';
import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
import joi from 'joi';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

const participanteSchema = joi.object({
    name: joi.string().required()
})

const headerSchema = joi.object({
    user: joi.string().required()
})

const mensagemSchema = joi.object({
    to: joi.string().required(),
    text: joi.string().required(),
    type: "private_message"
})

try{
    await mongoClient.connect();
    db = mongoClient.db("batePapoUOL");
}catch (err){
    console.log(err);
}


app.post("/participants", async (req, res) => {

    const user = req.body.name;

    const validation = participanteSchema.validate(user, { abortEarly: false });

    if (validation.error) {
        const erros = validation.error.details.map((detail) => detail.message);
        res.status(422).send(erros);
        return;
    }

    const participantes = await db.collection("participants").find().toArray();
    const usuarioExistente = participantes.find(usuario => usuario.name === user);

    if(usuarioExistente){
        res.sendStatus(409).send("Usuário já existente");
    }

    try{
        db.collection("participants").insert({
            name: user, 
            lastStatus: Date.now()
        })
    }catch (err){
        res.sendStatus(500).send(err);
    }

    try{
        db.collection("messages").insert({
            from: user, 
            to: 'Todos', 
            text: 'entra na sala...', 
            type: 'status', 
            time: dayjs().format('HH:mm:ss')
        })
    }catch (err){
        res.status(500).send(err);
    }

    res.sendStatus(201);
})

app.get("/participants", async (req, res) => {

    try{
        const participantes = await db.collection("participants").find().toArray();
        res.send(participantes);
    }catch(err){
        res.sendStatus(500);
    }
    
})

app.post("/messages", async (req, res) => {

    const { user } = req.header;
    const { to, text, type } = req.body;

    const validationMensage = mensagemSchema.validate(req.body, { abortEarly: false });
    const validationHeader = headerSchema.validate(req.header);
    const participantes = await db.collection("participants").find().toArray();
    const usuarioExistente = participantes.find(usuario => usuario.name === user);

    if (validationMensage.error) {
        const erros = validation.error.details.map((detail) => detail.message);
        res.status(422).send(erros);
        return;
    }

    if (validationHeader.error) {
        const erro = validation.error.details.message;
        res.status(422).send(erro);
        return;
    }


    if (user.toLowerCase() !== "todos" && !usuarioExistente){
        res.send("Participante não encontrado");
    }

    try{
        db.collection("messages").insert({
            from: user, 
            to, 
            text, 
            type, 
            time: dayjs().format('HH:mm:ss')
        })
    }catch (err){
        res.status(500).send(err);
    }

    res.sendStatus(201);
})

app.get("/messages", async (req, res) => {

    const { limit } = parseInt(req.query.limit);

    try{
        const mensagens = await db.collection("messages").find().toArray();
        res.send(mensagens);
    }catch(err){
        res.sendStatus(500).send("")
    }

})

app.post("/status", async (req, res) => {})

app.listen(5000, () => console.log("Server running in port: 5000"))