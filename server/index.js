const express = require('express');
const cors = require('cors');
const monk = require('monk');
const Filter = require('bad-words');
// const rateLimit = require('express-rate-limit');


const app = express();

app.use(cors());
app.use(express.json());


const db = monk(process.env.MONGO_URI || 'localhost/meower');
const mews = db.get('mews');
const filter = new Filter();

app.get('/', (req,res) => {
    res.json({
        message: 'Meower! 😹'
    });
});

app.get('/mews', (req,res) => {

    mews
        .find()
            .then(mews => {
                res.json(mews);
            });

});

function isValidMew(mew){
    return mew.name && mew.name.toString().trim() !== '' &&
        mew.content && mew.content.toString().trim() !== '';
}


// app.use(rateLimit ({
//     windowMs: 30 * 1000, //30 secs
//     max: 1 //limit each ip to 100 req per instruction
// }));

app.post('/mews', (req,res) => {
    if (isValidMew(req.body)) {
        //insert into db
        const mew = {
            name: filter.clean(req.body.name.toString()),
            content: filter.clean(req.body.content.toString()),
            created: new Date()
        };

        mews
         .insert(mew)
         .then(createdMew => {
            res.json(createdMew);
         }); 
        
    } else {
        res.status(422);
        res.json({
            message: 'Hey name and content are required!'
        });
    }
});

app.listen(5000, () => {

    console.log('Listening on http://localhost:5000');

});