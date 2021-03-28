const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
require('dotenv').config()

var serviceAccount = require('./firebaseAdmin/log-in-form-practice-firebase-adminsdk-orus0-1bcdaf077c.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const MongoClient = require("mongodb").MongoClient;
const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bfpqs.mongodb.net/burj-al-arab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();
app.use(cors());
app.use(express.json());

client.connect((err) => {
  const bookingCollection = client.db("burj-al-arab").collection("bookings");

  app.post("/addBooking", (req, res) => {
    const bookings = req.body;
    bookingCollection.insertOne(bookings).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/booking", (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith("Bearer ")) {
      const idToken = bearer.split(" ")[1];
      // idToken comes from the client app
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
            if(tokenEmail === req.query.email){
                bookingCollection.find({email : req.query.email})
                .toArray((err, document) => {
                    res.send(document)
                })
            }else{
                res.status(401).send("Un_authorize action")
            }
        })
        .catch((error) => {
            res.status(401).send("Un_authorize action")
        });
    }else{
        res.status(401).send("Un_authorize action")
    }

  });
});

app.get("/", (req, res) => {
  res.send("Welcome to our website");
});

app.listen(5000);
