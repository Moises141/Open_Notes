// Helper function to create and style image elements
function createImageElement(src) {
    const img = document.createElement('img');
    img.src = src;
    img.classList.add('note-image'); // Apply CSS class for styling

    img.onload = function() {
        if (img.width > 800) {
            img.style.width = '80%';
            img.style.height = 'auto';
        }
    };

    return img;
}

// Handle image paste in editable-content
document.querySelector('.editable-content').addEventListener('paste', async function(event) {
    const clipboardData = event.clipboardData || window.clipboardData;
    const items = clipboardData.items;
    const target = event.target;
    const noteId = document.querySelector('.modal-content').dataset.id;
    const note = notesManager.notes.find(n => n.id == noteId);

    console.log('Pasted content detected:', event);
    console.log('Note ID:', noteId);
    console.log('Found Note:', note);

    if (items && note) {
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                const reader = new FileReader();

                reader.onload = function(e) {
                    const dataURL = e.target.result;
                    note.images = note.images || [];
                    note.images.push(dataURL);

                    const img = createImageElement(dataURL);
                    target.appendChild(img);

                    console.log('Image pasted and added to note:', dataURL);
                    console.log('Updated Note object:', note);

                    // Save the updated note with images in IndexedDB
                    notesManager.updateNote(note);
                };

                reader.onerror = function() {
                    console.error('Error reading the image file');
                };

                reader.readAsDataURL(file);
            }
        }
    } else {
        console.error('No note found or items not available for pasting.');
    }
});

// Common function to save note changes
function saveNoteChanges(note, titleElem, contentElem) {
    note.title = titleElem.textContent;
    note.content = contentElem.innerHTML;

    console.log('Saving note changes:', note);

    // Update note in IndexedDB
    notesManager.updateNote(note);
}

// Modify showNoteModal to render images when displaying the note and enable edit mode
NotesManager.prototype.showNoteModal = function(note) {
    const modal = document.getElementById('note-modal');
    const titleElem = document.getElementById('modal-title');
    const contentElem = document.getElementById('modal-content');

    titleElem.textContent = note.title;
    contentElem.innerHTML = note.content;

    console.log('Displaying note in modal:', note);

    if (note.images && note.images.length > 0) {
        note.images.forEach(src => {
            const img = createImageElement(src);
            contentElem.appendChild(img);
        });
    }

    let isEditMode = false;
    const toggleEditButton = modal.querySelector('.edit-toggle-btn');
    toggleEditButton.onclick = function () {
        isEditMode = !isEditMode;
        contentElem.contentEditable = isEditMode ? 'true' : 'false';
        titleElem.contentEditable = isEditMode ? 'true' : 'false';
        toggleEditButton.textContent = isEditMode ? 'Save' : 'Edit';

        // Save changes when exiting edit mode
        if (!isEditMode) {
            saveNoteChanges(note, titleElem, contentElem);
        }
    };

    const closeModal = () => {
        modal.style.display = 'none';
        if (isEditMode) {
            saveNoteChanges(note, titleElem, contentElem);
        }
    };

    modal.style.display = 'block';

    // Close button event handler
    document.querySelector('.close-button').onclick = closeModal;

    // Close modal if clicked outside of it
    window.onclick = (event) => {
        if (event.target == modal) {
            closeModal();
        }
    };
};

// NotesManager function to update note (including images) in IndexedDB version 2
NotesManager.prototype.updateNote = async function(note) {
    console.log('Updating note in IndexedDB:', note);

    const db = await dbPromise;
    const tx = db.transaction('notes', 'readwrite');
    const store = tx.objectStore('notes');

    // Perform the update operation
    await store.put(note);

    console.log('Note successfully updated in IndexedDB');
};









