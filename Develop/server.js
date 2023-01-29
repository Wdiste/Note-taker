const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 3001;
const uuid = require('./helpers/uuid');
const fs = require('fs');

const app = express();

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, './public/index.html')));
app.all('*', (req, res) => res.sendFile(path.join(__dirname, './public/index.html')));

// route to use getNotes()
app.get('/api/notes', (req, res) => res.sendFile(path.join(__dirname, './db/notes.json')));

// route to use saveNote()
app.post('/api/notes', (req, res) => {
    const { title, text } = req.body;

    const newNote = {
      title,
      text,
      id: uuid(),
    };

      // read the existing notes.json file
      fs.readFile(path.join(__dirname, './db/notes.json'), 'utf8', (err, data) => {
        if (err) {
            res.status(500).json('Error: cannot connect to notes.json');
        }
        else {
            // create new array containing old json data nd the object to be added, then write thenew array to notes.json
          const notes = JSON.parse(data);
          notes.push(newNote);

            // write the new array over the old array in notes db
          fs.writeFile(path.join(__dirname, './db/notes.json'), JSON.stringify(notes), (err) => {
            if (err) {
                res.status(500).json('Error: cannot write to notes.json file');
            }
            else {
              const response = {
                status: 'success',
                body: newNote,
              };
              console.log(response);
              res.status(201).json(response);
            }
          });
        }
      });
});

app.delete('/api/notes/:id', (req, res) => {
      // read the existing notes.json file
      fs.readFile(path.join(__dirname, './db/notes.json'), 'utf8', (err, data) => {
        if (err) {
            res.status(500).json('Error: cannot read notes.json file');
        }
        else {
          // parse the json data
          const notes = JSON.parse(data);
          // find the object which contains the element matching 'id'
          // use a map then indexOf
          const badNote = notes.map(note => note.id).indexOf(req.params.id);
          notes.splice(badNote, 1);
          // stringify the data and write it back to the file
          fs.writeFile(path.join(__dirname, '/db/notes.json'), JSON.stringify(notes), (err) => {
            if (err) {
                res.status(500).json('Error: cannot delete from notes.json file');
            }
            else {
              const response = 'success';
              console.log(response);
              res.status(201).json(response);
            }
          });
        }
      });
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
