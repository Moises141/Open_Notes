Key Components:
IndexedDB (dbPromise): Used to store and retrieve notes and preferences, enabling persistence across sessions.
NotesManager Class: Handles the core logic for managing notes and user preferences, interacting with both IndexedDB and the DOM.
DOM Manipulation: Functions like appendNoteToDOM and showNoteModal update the UI to reflect the current state of the notes and their details.
Preferences Handling: Functions like toggleDarkMode and toggleShowDate ensure user preferences are saved and applied across sessions.

1. savePreference(key, value)
Purpose: Saves a user preference (like dark mode or date display) into the preferences object store in IndexedDB.
How it works:
It opens a transaction to the preferences store in readwrite mode.
The preference (with its key and value) is added or updated in the store using put.
The transaction is completed with tx.done.
2. loadPreference(key)
Purpose: Loads a user preference from the preferences store in IndexedDB.
How it works:
It opens a transaction to the preferences store in readonly mode.
The function retrieves the preference using the provided key with store.get().
If the preference exists, the value is returned; otherwise, null is returned.
3. addNote()
Purpose: Adds a new note to the IndexedDB and updates the DOM.
How it works:
It retrieves the note's title and content from the form inputs.
If both are non-empty, it creates a new note object with the title, content, and the current date.
The note is added to IndexedDB using addNote(note).
Upon successful addition, the form fields are reset.
4. NotesManager.addNote(note)
Purpose: Adds a note to IndexedDB, updates the internal notes array, and displays the note in the DOM.
How it works:
A transaction is created to the notes store in readwrite mode.
The note is added to the store using store.add(), and the note ID is automatically generated and assigned to the note object.
The new note is added to the internal notes array, and appendNoteToDOM() is called to display it in the UI.
5. NotesManager.loadNotes()
Purpose: Loads all notes from the notes store in IndexedDB.
How it works:
It opens a transaction to the notes store and retrieves all stored notes using store.getAll().
These notes are returned to be displayed in the app.
6. NotesManager.displayNotes(notes)
Purpose: Displays a list of notes in the DOM.
How it works:
The notes-container is cleared, and each note in the notes array is displayed by calling appendNoteToDOM(note).
7. NotesManager.appendNoteToDOM(note)
Purpose: Adds a single note to the DOM for display.
How it works:
A div representing the note is created, including a checkbox for selecting the note.
The note’s title (and optionally the date, if enabled) is displayed.
An event listener is attached to the note content for displaying the note in a modal when clicked.
8. NotesManager.showNoteModal(note)
Purpose: Displays the details of a note in a modal window.
How it works:
The modal is populated with the note's title and content.
The modal is shown by setting its style.display to block.
Event listeners are added to close the modal when the user clicks the close button or outside the modal.
9. NotesManager.deleteNote(noteId)
Purpose: Deletes a single note from IndexedDB and removes it from the DOM.
How it works:
The note is visually removed with a "removing" animation.
A transaction is opened to the notes store in readwrite mode, and the note is deleted using store.delete().
After deletion, the internal notes array is updated, and the notes in the DOM are refreshed using displayNotes().
10. NotesManager.deleteSelectedNotes()
Purpose: Deletes all selected notes from IndexedDB.
How it works:
It iterates over the set of selected note IDs and calls deleteNote() for each one.
After all selected notes are deleted, the selection set (selectedNotes) is cleared.
11. NotesManager.toggleShowDate()
Purpose: Toggles the visibility of the note creation date in the UI and saves the preference.
How it works:
The boolean showDate is toggled.
The updated preference is saved in IndexedDB using savePreference('showDate', this.showDate).
The notes are re-rendered in the DOM by calling displayNotes().
12. NotesManager.toggleDarkMode()
Purpose: Toggles dark mode and saves the preference.
How it works:
It toggles the dark-mode class on the body element.
The updated preference is saved in IndexedDB using savePreference('darkMode', darkModeEnabled).
13. NotesManager.updateDateToggle()
Purpose: Updates the state of the date toggle checkbox based on the stored preference.
How it works:
It sets the checkbox state (checked property) based on the value of showDate.
