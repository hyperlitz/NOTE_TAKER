let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let noteList;

if (window.location.pathname === '/notes') {
  noteTitle = document.querySelector('.note-title');
  noteText = document.querySelector('.note-textarea');
  saveNoteBtn = document.querySelector('.save-note');
  newNoteBtn = document.querySelector('.new-note');
  noteList = document.querySelectorAll('.list-container .list-group');
}

// Show an element
const show = (elem) => {
  elem.style.display = 'inline';
};

// Hide an element
const hide = (elem) => {
  elem.style.display = 'none';
};

// activeNote is used to keep track of the note in the textarea
let activeNote = {};

const getNotes = () =>
  fetch('/api/notes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

const saveNote = (note) =>
  fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });

const updateNote = (note) => {
  const url = `/api/notes/${note.id}`;

  return fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });
};
  

const deleteNote = (id) =>
  fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

const renderActiveNote = () => {
  show(saveNoteBtn); // Always show the Save Note button when editing

  if (activeNote.id) {
    noteTitle.removeAttribute('readonly');
    noteText.removeAttribute('readonly');
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
  } else {
    noteTitle.removeAttribute('readonly');
    noteText.removeAttribute('readonly');
    noteTitle.value = '';
    noteText.value = '';
  }
};

const handleNoteSave = () => {
  const newNote = {
    title: noteTitle.value,
    text: noteText.value,
  };

  if (activeNote.id) {
    newNote.id = activeNote.id;
    updateNote(newNote)
      .then(() => {
        Swal.fire({
          title: 'Note Updated',
          text: 'Your note has been updated successfully.',
          icon: 'success',
        }).then(() => {
          window.location.href = '/notes'; // Redirect to /notes after successful update
        });
      })
      .catch(() => {
        Swal.fire({
          title: 'Error',
          text: 'An error occurred while updating the note.',
          icon: 'error',
        });
      });
  } else {
    saveNote(newNote)
      .then(() => {
        Swal.fire({
          title: 'Note Saved',
          text: 'Your note has been saved successfully.',
          icon: 'success',
        }).then(() => {
          window.location.href = '/notes'; // Redirect to /notes after successful save
        });
      })
      .catch(() => {
        Swal.fire({
          title: 'Error',
          text: 'An error occurred while saving the note.',
          icon: 'error',
        });
      });
  }
};


const handleNoteDelete = (noteId) => {
  Swal.fire({
    title: 'Are you sure?',
    text: 'This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
  }).then((result) => {
    if (result.isConfirmed) {
      deleteNote(noteId)
        .then(() => {
          Swal.fire({
            title: 'Deleted!',
            text: 'Your note has been deleted.',
            icon: 'success',
          }).then(() => {
            window.location.href = '/notes'; // Redirect back to /notes after successful deletion
          });
        })
        .catch(() => {
          Swal.fire({
            title: 'Error',
            text: 'An error occurred while deleting the note.',
            icon: 'error',
          });
        });
    }
  });
};

const handleNoteView = (note) => {
  activeNote = note; // Set the activeNote to the clicked note object
  renderActiveNote();
};


const handleNewNoteView = (e) => {
  activeNote = {};
  renderActiveNote();
};

const handleRenderSaveBtn = () => {
  if (noteTitle.value.trim() || noteText.value.trim()) {
    show(saveNoteBtn); // Show the Save Note button if there's content in either field
  } else {
    hide(saveNoteBtn);
  }
};

const renderNoteList = async (notes) => {
  let jsonNotes = await notes.json();
  if (window.location.pathname === '/notes') {
    noteList.forEach((el) => (el.innerHTML = ''));
  }

  let noteListItems = [];

  const createLi = (note) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item');
  
    const spanEl = document.createElement('span');
    spanEl.classList.add('list-item-title');
    spanEl.innerText = note.title;
    spanEl.addEventListener('click', () => handleNoteView(note)); // Pass the note object
  
    liEl.append(spanEl);
  
    const delBtnEl = document.createElement('i');
    delBtnEl.classList.add(
      'fas',
      'fa-trash-alt',
      'float-right',
      'text-danger',
      'delete-note'
    );
    delBtnEl.addEventListener('click', () => handleNoteDelete(note.id)); // Pass the note ID
  
    liEl.append(delBtnEl);
  
    return liEl;
  };

  if (jsonNotes.length === 0) {
    noteListItems.push(createLi({ title: 'No saved Notes' }));
  }

  jsonNotes.forEach((note) => {
    const li = createLi(note);
    noteListItems.push(li);
  });

  if (window.location.pathname === '/notes') {
    noteListItems.forEach((note) => noteList[0].append(note));
  }
};


const getAndRenderNotes = () => getNotes().then(renderNoteList);

if (window.location.pathname === '/notes') {
  saveNoteBtn.addEventListener('click', handleNoteSave);
  newNoteBtn.addEventListener('click', handleNewNoteView);
  noteTitle.addEventListener('input', handleRenderSaveBtn);
  noteText.addEventListener('input', handleRenderSaveBtn);
}

getAndRenderNotes();
