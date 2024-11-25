const express = require("express");
const app = express();
const path = require("path");
const ObjectID = require('mongodb').ObjectID;

app.use(express.json());
app.set('port',3000);
app.use ((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    next();
});

const MongoClient = require('mongodb').MongoClient;

let db;

MongoClient.connect('mongodb+srv://ibukundurodola:concreatures@cst3144cw.sx6hi.mongodb.net', (err,client) =>{
    db = client.db('Webstore');
});

app.get("/", (req,res,next) => {
    res.send('Select a collection, e.g., /collection/messages');
});


app.param('collectionName', (req, res, next, collectionName) =>{
    req.collection = db.collection(collectionName);
    return next();
});

app.get('/collection/:collectionName/:id', (req,res,next) =>{
    req.collection.findOne({_id: new ObjectID(req.params.id)}, (e,results) => {
        if(e) return next(e)
            res.send(results);
    })
});

app.get('/collection/:collectionName', (req,res,next) =>{
    req.collection.find({}).toArray((e,results) => {
        if(e) return next(e)
            res.send(results);
    })
});

const imagePath=path.resolve(__dirname, "Images");

app.use("/image",express.static(imagePath));

app.post('/collection/:collectionName', (req,res,next) =>{
    req.collection.insert(req.body, (e,results) =>{
        if (e) return next(e);
        res.send(results.ops);
    })
});

app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.update(
        {_id: new ObjectID(req.params.id)},
        {$set: req.body},
        {safe: true, multi: false},
        (e, result) => {
            if (e) return next(e)
            res.send((result.result.n === 1) ? {msg: 'success'} : {msg: 'error'});
        }
    )
})

app.delete('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.deleteOne(
        {_id: new ObjectID(req.params.id)}, (e,result) => {
            if (e) return next(e)
            res.send((result.result.n === 1) ?
            {msg:'success'} : {msg:'error'}
        )
        }
    )
})

app.get('/search/:collectionName/:searchText', (req,res,next) =>{
    checkNumb = isNaN(parseInt(req.params.searchText));
    if(checkNumb){
        let searchText = RegExp(req.params.searchText);
        req.collection.find({$or: [{subject: {$regex: searchText , $options: "i"}}, {location:{$regex: searchText, $options: "i"}}]}).toArray((e,results) => {
            if(e) return next(e)
                res.send(results);
    });}

    else{
        let searchText = parseInt(req.params.searchText);
        req.collection.find({$or: [{price: searchText}, {availableSlots: searchText}]}).toArray((e,results) => {
            if(e) return next(e)
                res.send(results);
        });}
});

const port = process.env.PORT || 3000;
app.listen(port);