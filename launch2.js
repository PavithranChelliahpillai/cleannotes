const mongoose = require ("mongoose");
const fs = require ("fs");
const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const bodyParser = require ('body-parser');
const engines = require('consolidate');
const mustache = require("mustache");
const multer = require ("multer");
const {TesseractWorker} = require ("tesseract.js");
const worker = new TesseractWorker();
const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb (null, "./uploads")
    },
    filename: (req, file, cb) => {
        cb (null, file.originalname);
    }
})
const upload = multer({storage: storage}).single("paper");
const uri = "mongodb+srv://pavithranc:chelvy1401@cleannotescluster.70ppp.mongodb.net/cleannotesdb";
const ejs = require ("ejs");
const { not } = require("cheerio/lib/api/traversing");
mongoose.connect(uri);

app.use(express.urlencoded({extended:true}));

app.set('view engine','ejs');
const noteSchema = {
    title: String,
    body: String
}
const Note = mongoose.model('Note', noteSchema)


app.listen(3000, function(){
    console.log('Running at Port 3000');
})

app.get('/', (req,res) => {
    Note.find({}, function(err, notes) {
        res.render('index', {
            noteslist: notes
        });
    })
})

app.get('/noteAt/:id', (req,res) => {
    const id=req.params.id;
    Note.find({_id:id}, function(err, notes) {
        res.render('displaynote', {
            note: notes
        });
    })
})

app.post('/api/note', (req,res) => {
    console.log(req.body.title);
    console.log(req.body.note);
    let newNote = new Note( {
        title: req.body.title,
        body: req.body.note
    })
    console.log(newNote);
    newNote.save();
    res.redirect('/note')
})

app.get('/note', (req,res) => {
    Note.find({}, function(err, notes) {
        res.render('blanknote', {
            noteslist: notes
        });
    })
}) 

app.post('/written', (req,res) => {
    upload(req, res, err => {
        fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
            if (err) console.log(err);

            worker  
                .recognize(data, "eng", {})
                .progress(progress => {
                    console.log(progress);
                })
                .then(result => {
                    res.render ("written", {
                        title: req.file.originalname,
                        resultingdata: result,
                    })
                    let newNote  = new Note ({
                        title: req.file.originalname,
                        body: result.text
                    })
                    newNote.save();
                })
                .finally(() => worker.terminate())
        })
    })
})


/*
app.get(`/:file`, (req,res) => {
    Note.findByObjectId(req.params.file, function (err,notes) {
        res.render('404', {
            noteslist: notes,
        })
    })        
})
*/


/*
router.get('/blanknote',function(req,res){
    res.sendFile(path.join(__dirname+'/blanknote.html'));
  });
*/