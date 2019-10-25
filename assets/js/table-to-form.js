/*jslint browser, for */
/*globals */

// Convert a table to a form
// -------------------------
// This converts a simple table to a form.
// Each column sets an aspect of the form:
// - Column 1: labels (main text)
// - Column 2: input hint (small text below the label)
// - Column 3: placeholder text in the textarea
// - Column 4: sets the number of rows in the textarea
// Text in each column is optional.


// https://medium.com/@mhagemann/the-ultimate-way-to-slugify-a-url-string-in-javascript-b8e4a0d849e1
function ebTablesToFormsSlugify(string) {
    'use strict';

    var a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;';
    var b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnooooooooprrsssssttuuuuuuuuuwxyyzzz------';
    var p = new RegExp(a.split('').join('|'), 'g');

    return string.toString().toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
        .replace(/&/g, '-and-') // Replace & with 'and'
        .replace(/[^\w\-]+/g, '') // Remove all non-word characters
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, '') // Trim - from end of text
}

// Return a slug of the page URL, without the hash,
// for use in localStorage key prefixes.
function ebListToChecklistLocationSlug() {
    'use strict';
    var locationSlug = ebListToChecklistSlugify(window.location.href.split('#')[0]);
    return locationSlug;
}

// Connert a table
function ebTableToForm(table, number) {
    'use strict';

    // Create a new form
    var form = document.createElement('form');

    // Copy the table's classes, too,
    // and add our own
    form.classList.add(table.classList);
    form.classList.add('table-to-form');

    // Each row will be a label–input pair
    var rows = table.querySelectorAll('tr');
    var i, inputWrapper, label, input, textAreaSize,
        inputHint, labelContent, inputContent, placeholderContent;
    for (let i = 0; i < rows.length; i += 1) {

        // Create a wrapper for our form elements
        inputWrapper = document.createElement('div');
        inputWrapper.classList.add('form-input-wrapper');

        // Create an input, input-hint, and a label
        input = document.createElement('textarea');
        input.id = ebListToChecklistLocationSlug()
            + '-' + ebTablesToFormsSlugify(rows[i].innerText)
            + '-' + number;
        input.name = input.id;

        inputHint = document.createElement('p');
        inputHint.classList.add('input-hint');

        label = document.createElement('label');
        label.id = ebTablesToFormsSlugify(rows[i].innerText) + '-' + number;
        label.name = label.id;
        label.htmlFor = input.id;

        // Get the content for each
        if (rows[i].querySelector('td:nth-child(1)')) {
            labelContent = rows[i].querySelector('td:nth-child(1)').innerHTML;
        }
        if (rows[i].querySelector('td:nth-child(2)')) {
            inputContent = rows[i].querySelector('td:nth-child(2)').innerHTML;
        }
        if (rows[i].querySelector('td:nth-child(3)')) {
            placeholderContent = rows[i].querySelector('td:nth-child(3)').innerHTML;
        }

        // Get the number of rows in the textarea
        if (rows[i].querySelector('td:nth-child(4)')) {
            textAreaSize = parseInt(rows[i].querySelector('td:nth-child(4)').textContent, 10);
            if (!isNaN(textAreaSize)) {
                input.rows = textAreaSize;
            }
        }

        // Copy the content to each
        inputHint.innerHTML = inputContent;
        label.innerHTML = labelContent;
        input.placeholder = placeholderContent;

        // Insert them into the input wrapper, label first
        inputWrapper.appendChild(label);
        inputWrapper.appendChild(inputHint);
        inputWrapper.appendChild(input);

        // Insert the wrapper into the form
        form.appendChild(inputWrapper);
    }

    // Insert the form
    table.insertAdjacentElement('afterend', form);

    // Remove the table
    table.remove();
}

// Get the tables and process each one
function ebTablesToForms() {
    'use strict';

    // Get all the tables to make into forms
    var tables = document.querySelectorAll('table.form');

    // If there are tables to convert, process each one
    if (tables.length > 0) {
        var i;
        for (i = 0; i < tables.length; i += 1) {
            ebTableToForm(tables[i], i);
        }
    }
}

// Go
ebTablesToForms();
