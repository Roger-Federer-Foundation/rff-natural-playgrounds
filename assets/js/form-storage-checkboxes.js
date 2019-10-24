/*jslint browser, for */
/*globals window */

// Stores checkboxes in localStorage

// Save the value of a checkbox as 'true' or 'false'
function ebSaveCheckbox(checkbox) {
    'use strict';
    localStorage.setItem(checkbox.id, checkbox.checked);
}

// Set the value of a checkbox
function ebSetCheckbox(checkbox) {
    'use strict';
    var checkStatus = localStorage.getItem(checkbox.id);
    if (checkStatus === 'true') {
        checkbox.checked = true;
    }
}

// Listen for changes on an element
function ebCheckboxListener(checkbox) {
    'use strict';
    checkbox.addEventListener('change', function () {
        ebSaveCheckbox(checkbox);
    });
}

// Main process
function ebSaveCheckboxes() {
    'use strict';
    // Get all the checkboxes
    var checkboxes = document.querySelectorAll('[type="checkbox"]');

    // Loop through them and:
    // 1. apply their stored values
    // 2. listen for changes
    var i;
    for (i = 0; i < checkboxes.length; i += 1) {

        // Apply stored value
        ebSetCheckbox(checkboxes[i]);

        // Store on change
        ebCheckboxListener(checkboxes[i]);
    }
}

// Start
ebSaveCheckboxes();
