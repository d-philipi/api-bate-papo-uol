import express from 'express';
import cors from 'cors';
import { MongoClient } from "mongodb";
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

mongoClient.connect().then(() => {
	db = mongoClient.db("batePapoUOL");
}).catch(err => console.log(err));

app.post("/participants", (req, res) => {
    db.collection("participants").insert({
        name: req.body.name, 
        lastStatus: Date.now()
    }).then((response) => {
        res.status(201);
    }).catch((err) => {
        res.status(500).send(err);
    });
    
    db.collection("messages").insert({
        from: req.body.name, 
        to: 'Todos', 
        text: 'entra na sala...', 
        type: 'status', 
        time: 'HH:MM:SS'
    }).then((response) => {
        res.status(201);
    }).catch((err) => {
        res.status(500).send(err);
    });
})

app.get("/participants", (req, res) => {
    db.collection("participants")
    .find()
    .toArray()
    .then(participants => {
		console.log(participants);
        res.send("Ok");
	})
    .catch(err => {
        console.log(err);
        res.sendStatus(500);
    });
})

app.post("/messages", (req, res) => {

    const { user } = req.header;

    db.collection("messages").insert({
        from: user, 
        to: req.body.to, 
        text: req.body.text, 
        type: req.body.type, 
        time: 'HH:MM:SS'
    }).then((response) => {
        res.status(201);
    }).catch((err) => {
        res.status(500).send(err);
    });
})

app.get("/messages", (req, res) => {
    db.collection("messages")
    .find()
    .toArray()
    .then(messages => {
		console.log(messages);
        res.send("Ok");
	})
    .catch(err => {
        console.log(err);
        res.sendStatus(500);
    });
})

app.post("/status", (req, res) => {})

app.listen(5000, () => console.log("Server running in port: 5000"))