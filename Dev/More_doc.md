Key Components:
IndexedDB (dbPromise): Used to store and retrieve notes and preferences, enabling persistence across sessions.
NotesManager Class: Handles the core logic for managing notes and user preferences, interacting with both IndexedDB and the DOM.
DOM Manipulation: Functions like appendNoteToDOM and showNoteModal update the UI to reflect the current state of the notes and their details.
Preferences Handling: Functions like toggleDarkMode and toggleShowDate ensure user preferences are saved and applied across sessions.
