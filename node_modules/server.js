const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // Using the uuid library to generate unique IDs

const app = express();
const PORT = process.env.PORT || 3000;

const notesFilePath = path.join(__dirname, 'develop', 'db', 'db.json');

// Middleware to parse JSON data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static assets
app.use(express.static('develop/public'));

// HTML Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'develop', 'public', 'index.html'));
});

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'develop', 'public', 'notes.html'));
});

// API Routes
app.get('/api/notes', (req, res) => {
  const notes = JSON.parse(fs.readFileSync(notesFilePath, 'utf8'));
  res.json(notes);
});

app.post('/api/notes', (req, res) => {
  const newNote = req.body;
  const notes = JSON.parse(fs.readFileSync(notesFilePath, 'utf8'));

  newNote.id = uuidv4(); // Generate a unique ID for the new note

  notes.push(newNote);

  fs.writeFileSync(notesFilePath, JSON.stringify(notes));

  res.json(newNote);
});

// PUT route to update an existing note
app.put('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;
    console.log('Received PUT request for note ID:', noteId);
    const updatedNote = req.body;
    const notes = JSON.parse(fs.readFileSync(notesFilePath, 'utf8'));
  
    // Find the index of the note to be updated
    const index = notes.findIndex((note) => note.id === noteId);
  
    if (index !== -1) {
      // Update the note in the array
      notes[index] = updatedNote;
  
      // Write the updated notes array back to the file
      fs.writeFileSync(notesFilePath, JSON.stringify(notes));
  
      res.json(updatedNote);
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  });
    

app.delete('/api/notes/:id', (req, res) => {
  const noteIdToDelete = req.params.id;
  let notes = JSON.parse(fs.readFileSync(notesFilePath, 'utf8'));

  notes = notes.filter(note => note.id !== noteIdToDelete);

  fs.writeFileSync(notesFilePath, JSON.stringify(notes));

  res.json({ message: 'Note deleted' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`App listening on PORT ${PORT}`);
});
