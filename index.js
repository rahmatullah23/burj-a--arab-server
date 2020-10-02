const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config()
console.log(process.env.DB_PASS)
const port = 4050


const app = express();
app.use(cors());
app.use(bodyParser.json());


var admin = require("firebase-admin");

var serviceAccount = require("./configs/burj-al-arab-e3ae5-firebase-adminsdk-4cx7v-21db419b76.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIRE_DB
});




const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tnjvj.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const bookings = client.db("burjAlArab").collection("bookings");
    console.log('connected successfully')
    //   client.close();
    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        bookings.insertOne(newBooking)
            .then(result => {
                // console.log(result)
                res.send(result.insertedCount > 0);
            })
        console.log(newBooking);
    })
    app.get('/bookings', (req, res) => {
        console.log(req.headers.authorization)
        //video 49.7 - 8.00 min
        // idToken comes from the client app
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            console.log({ idToken })
            admin.auth().verifyIdToken(idToken)
                .then(function (decodedToken) {
                    const tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;
                    console.log(queryEmail, tokenEmail)
                    if (tokenEmail == req.query.email) {
                        bookings.find({ email: req.query.email })
                            .toArray((err, documents) => {
                                res.send(documents);
                            })
                    }
                    let uid = decodedToken.uid;
                    console.log({ uid })
                    // ...
                }).catch(function (error) {
                    // Handle error
                });
        }
        else{
            res.status(401).send('un-authorized access')
        }


    })
});


app.get('/', (req, res) => {
    res.send('Hello World! Hello World!')
})


app.listen(port)

// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`)
// })