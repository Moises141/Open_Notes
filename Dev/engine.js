// IndexedDB setup using idb library
const dbPromise = idb.openDB('notesDB', 2, {  // Incremented version to 2
    upgrade(db) {
        if (!db.objectStoreNames.contains('notes')) {
            db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('preferences')) {
            db.createObjectStore('preferences', { keyPath: 'key' });
        }
    }
});

// Save a preference to IndexedDB
async function savePreference(key, value) {
    const db = await dbPromise;
    const tx = db.transaction('preferences', 'readwrite');
    const store = tx.objectStore('preferences');
    await store.put({ key, value });
    await tx.done;
}

// Load a preference from IndexedDB
async function loadPreference(key) {
    const db = await dbPromise;
    const store = db.transaction('preferences').objectStore('preferences');
    const result = await store.get(key);
    return result ? result.value : null;
}

// NotesManager Class
class NotesManager {
    constructor() {
        this.notes = [];
        this.showDate = true;  // Default to showing the date
        this.selectedNotes = new Set();  // Track selected notes
    }

    // Initialize notes and preferences
    async init() {
        this.notes = await this.loadNotes();
        this.showDate = (await loadPreference('showDate')) !== false;
        const darkMode = await loadPreference('darkMode');
        if (darkMode) {
            document.body.classList.add('dark-mode');
            document.getElementById('dark-mode-toggle').checked = true;
        }
        this.displayNotes(this.notes);
        this.updateDateToggle();
    }

    // Add a note to IndexedDB and update the internal state and DOM
    async addNote(note) {
        const db = await dbPromise;
        const tx = db.transaction('notes', 'readwrite');
        const store = tx.objectStore('notes');
        const id = await store.add(note);
        note.id = id;
        await tx.done;
        this.notes.push(note);
        this.appendNoteToDOM(note);
    }

    // Load notes from IndexedDB
    async loadNotes() {
        const db = await dbPromise;
        const store = db.transaction('notes').objectStore('notes');
        return await store.getAll();
    }

    // Display all notes in the DOM
    displayNotes(notes) {
        const notesContainer = document.getElementById('notes-container');
        notesContainer.innerHTML = '';
        notes.forEach(note => this.appendNoteToDOM(note));
    }

    // Append a single note to the DOM
    appendNoteToDOM(note) {
        const notesContainer = document.getElementById('notes-container');
        const noteDiv = document.createElement('div');
        noteDiv.classList.add('note');
        noteDiv.dataset.id = note.id; // Store the note ID for later use

        // Create and append the checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.addEventListener('change', (event) => {
            if (event.target.checked) {
                this.selectedNotes.add(note.id);
            } else {
                this.selectedNotes.delete(note.id);
            }
        });
        noteDiv.appendChild(checkbox);

        // Create a container for note content
        const noteContentDiv = document.createElement('div');
        noteContentDiv.classList.add('note-content');

        // Display only the note title without the "Title:" label
        const titleElem = document.createElement('h3');
        titleElem.textContent = note.title;
        noteContentDiv.appendChild(titleElem);

        if (this.showDate) {
            const dateElem = document.createElement('p');
            dateElem.textContent = `Date: ${note.date}`;
            noteContentDiv.appendChild(dateElem);
        }

        noteDiv.appendChild(noteContentDiv);
        notesContainer.appendChild(noteDiv);

        // Add click event to show the note in a modal
        noteContentDiv.addEventListener('click', () => this.showNoteModal(note));
    }

    // Show the note details in a modal
    showNoteModal(note) {
        const modal = document.getElementById('note-modal');
        document.getElementById('modal-title').textContent = note.title;
        document.getElementById('modal-content').textContent = note.content;

        // Show the modal
        modal.style.display = 'block';

        // Add event listener to close the modal
        document.querySelector('.close-button').onclick = () => {
            modal.style.display = 'none';
        };

        // Close the modal if the user clicks outside of it
        window.onclick = (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };
    }

    // Delete a single note by ID
    async deleteNote(noteId) {
        try {
            const noteDiv = document.querySelector(`.note[data-id="${noteId}"]`);
            noteDiv.classList.add('removing');
            await new Promise(resolve => setTimeout(resolve, 300)); // Wait for animation
            const db = await dbPromise;
            const tx = db.transaction('notes', 'readwrite');
            const store = tx.objectStore('notes');
            await store.delete(noteId);
            await tx.done;
            this.notes = this.notes.filter(note => note.id !== noteId);
            this.displayNotes(this.notes); // Refresh the displayed notes
        } catch (error) {
            console.error("Failed to delete note:", error);
        }
    }

    // Delete selected notes
    async deleteSelectedNotes() {
        for (const noteId of this.selectedNotes) {
            await this.deleteNote(noteId);
        }
        this.selectedNotes.clear(); // Clear the selection
    }

    // Toggle the date display and refresh the notes in the DOM
    async toggleShowDate() {
        this.showDate = !this.showDate;
        await savePreference('showDate', this.showDate);
        this.displayNotes(this.notes);
    }

    // Toggle dark mode and save preference
    async toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const darkModeEnabled = document.body.classList.contains('dark-mode');
        await savePreference('darkMode', darkModeEnabled);
        document.getElementById('dark-mode-toggle').checked = darkModeEnabled;
    }

    // Update date toggle checkbox based on preference
    updateDateToggle() {
        document.getElementById('date-toggle').checked = this.showDate;
    }
}

// Function to handle adding a note
async function addNote() {
    const titleElement = document.getElementById('title');
    const contentElement = document.getElementById('content');
    const title = titleElement.value.trim();
    const content = contentElement.innerHTML.trim(); // Use innerHTML for contenteditable div

    if (title && content) {
        const note = { title, content, date: new Date().toLocaleString() };
        await notesManager.addNote(note);
        titleElement.value = '';  // Clear the title input
        contentElement.innerHTML = 'Enter content'; // Reset placeholder text
    } else {
        alert("Both title and content are required!");
    }
}

// Instantiate NotesManager and set up event listeners
const notesManager = new NotesManager();
document.getElementById('dark-mode-toggle').addEventListener('change', () => {
    notesManager.toggleDarkMode();
});
document.getElementById('date-toggle').addEventListener('change', () => notesManager.toggleShowDate());
document.getElementById('delete-selected').addEventListener('click', () => notesManager.deleteSelectedNotes());

// Initialize the app on page load
notesManager.init();

document.addEventListener('DOMContentLoaded', function() {
    const contentDiv = document.getElementById('content');
    contentDiv.addEventListener('focus', function() {
        if (contentDiv.innerHTML === 'Enter content') {
            contentDiv.innerHTML = '';
        }
    });
    contentDiv.addEventListener('blur', function() {
        if (contentDiv.innerHTML.trim() === '') {
            contentDiv.innerHTML = 'Enter content';
        }
    });
});
