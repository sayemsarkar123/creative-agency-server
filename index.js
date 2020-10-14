const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
const { response } = require('express');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const app = express();
require('dotenv').config();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ny61p.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const adminCollection = client.db("creativeAgency").collection("admin");
  const orderCollection = client.db("creativeAgency").collection("orders");
  const serviceCollection = client.db("creativeAgency").collection("service");
  const feedbackCollection = client.db("creativeAgency").collection("feedback");

  app.post('/addOrder', (req, res) => {
    const file = req.files.projectFile;
    const payload = req.body;
    const encObj = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(file.data.toString('base64'), 'base64')
    }
    orderCollection.insertOne({...payload, img: encObj}).then(result => res.send(result.insertedCount > 0));
  })

  app.get('/getOrdersByEmail', (req, res) => {
    const { email } = req.query;
    orderCollection.find({ email }).toArray((error, documents) => res.send(documents));
  })

  app.post('/addFeedback', (req, res) => {
    feedbackCollection.insertOne({ ...req.body }).then(result => res.send(result.insertedCount > 0));
  })

  app.post('/addAdmin', (req, res) => {
    adminCollection.insertOne({ ...req.body }).then(result => res.send(result.insertedCount > 0));
  })

  app.get('/getAllOrders', (req, res) => {
    orderCollection.find({}).toArray((error, documents) => res.send(documents))
  })
  app.get('/getAllServices', (req, res) => {
    serviceCollection.find({}).toArray((error, documents) => res.send(documents))
  })
  app.get('/getAllFeedback', (req, res) => {
    feedbackCollection.find({}).toArray((error, documents) => res.send(documents))
  })

  app.get('/getOrder/:id', (req, res) => {
    const { id } = req.params;
    orderCollection.find({ _id: ObjectId(id) }).toArray((error, documents) => res.send(documents[0]));
  })
  app.get('/getService/:id', (req, res) => {
    const { id } = req.params;
    serviceCollection.find({ _id: ObjectId(id) }).toArray((error, documents) => res.send(documents[0]));
  })

  app.get('/checkUserRole', (req, res) => {
    const { email } = req.query;
    adminCollection.find({ email }).toArray((error, documents) => res.send(documents.length > 0));
  })

  app.patch('/updateOrderStatus', (req, res) => {
    const { _id, ...rest } = req.body;
    orderCollection.updateOne({ _id: ObjectId(_id) }, { $set: { ...rest } }).then(result => res.send(result.modifiedCount > 0));
  })

  app.post('/addService', (req, res) => {
    const file = req.files.icon;
    const payload = req.body;
    const encObj = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(file.data.toString('base64'), 'base64')
    }
    serviceCollection.insertOne({...payload, img: encObj}).then(result => res.send(result.insertedCount > 0));
  })
});


app.listen(process.env.PORT || 4000);