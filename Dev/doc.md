In the v2.js 
Key Features:
createImageElement Function: 
This helper function creates an image element and resizes it if its width exceeds 800px.
Image Pasting:
When an image is pasted into the editable-content area, it gets added both to the DOM and the corresponding note object in IndexedDB.
Modal Editing Mode:
The modal allows toggling between view and edit modes. When exiting edit mode, any changes to the note (including pasted images) are saved to IndexedDB.
