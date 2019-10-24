/*jslint browser, for */
/*globals window */

// Stores textareas on clicking any 'Save' button.

// Save the text in a textarea
function ebSaveTextarea(textarea) {
    'use strict';
    localStorage.setItem(textarea.id, textarea.value);
}

// Set the text in a textarea
function ebSetTextarea(textarea) {
    'use strict';
    var text = localStorage.getItem(textarea.id);
    if (text && text !== '') {
        textarea.innerText = text;
    }
}

// Set all the textarea values
function ebSetAllTextareas() {
    'use strict';
    var textareas = document.querySelectorAll('textarea[id]');
    textareas.forEach(function (textarea) {
        ebSetTextarea(textarea);
    });
}

// Save all the textareas (where they have IDs)
function ebSaveAllTextareas() {
    'use strict';
    var textareas = document.querySelectorAll('textarea[id]');
    textareas.forEach(function (textarea) {
        ebSaveTextarea(textarea);
    });
}

// Show save feedback
function ebTextareaSaveFeedback(button) {
    'use strict';
    button.classList.add('saved');
    button.value = 'Saved'
    setTimeout(function () {
        button.classList.remove('saved');
        button.value = 'Save'
    }, 1000);
}

// Listen for save
function ebTextareaSaveListener(button) {
    'use strict';
    button.addEventListener('click', function () {
        ebSaveAllTextareas();
        ebTextareaSaveFeedback(button)
    });
}

// Add a save button to a textarea
function ebTextareaAddSaveButton(textarea) {
    'use strict';

    // Create new elements
    var buttonWrapper = document.createElement('div');
    var button = document.createElement('input');

    // Set classes and attributes on them
    buttonWrapper.classList.add('textarea-save-button-wrapper');
    button.setAttribute('type', 'button');
    button.setAttribute('value', 'Save');
    button.classList.add('button');
    button.classList.add('textarea-save-button');

    // Insert elements
    buttonWrapper.appendChild(button);
    textarea.insertAdjacentElement('afterend', buttonWrapper);

    // Add click listener
    ebTextareaSaveListener(button);
}

// Add save buttons to textareas
function ebTextareaSaveButtons() {
    'use strict';
    var textareas = document.querySelectorAll('textarea[id]');
    textareas.forEach(function (textarea) {
        ebTextareaAddSaveButton(textarea);
    });
}

// Main process
function ebTextareaStorage() {
    'use strict';
    ebSetAllTextareas();
    ebTextareaSaveButtons();
}

// Go
ebTextareaStorage();
