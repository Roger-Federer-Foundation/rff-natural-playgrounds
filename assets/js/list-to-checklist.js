/*jslint browser */
/*globals */

// https://medium.com/@mhagemann/the-ultimate-way-to-slugify-a-url-string-in-javascript-b8e4a0d849e1
function ebListToChecklistSlugify(string) {
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

// Create the form from a list
function ebListToChecklistCreateForm(list, number) {
    'use strict';

    // Insert a new form
    var form = document.createElement('form');
    form.classList.add('list-to-checklist');
    form.classList.add('js-form-storage');
    list.insertAdjacentElement('afterend', form);

    // Add each list item as a checklist item
    var listItems = list.querySelectorAll('li');
    var i, listItemContent, checklistItem;
    for (i = 0; i < listItems.length; i += 1) {
        listItemContent = listItems[i].innerHTML;
        checklistItem = document.createElement('input');
        checklistItem.type = 'checkbox';
        checklistItem.id = ebListToChecklistLocationSlug()
            + '-' + ebListToChecklistSlugify(listItems[i].innerText)
            + '-' + number;
        checklistItem.name = checklistItem.id;

        // Create the label
        var label = document.createElement('label');
        label.htmlFor = checklistItem.id;
        label.innerHTML = listItemContent;

        // Create a div to wrap them in
        var itemWrapper = document.createElement('div');
        itemWrapper.classList.add('checklist-item');

        // Add them to the div
        itemWrapper.appendChild(checklistItem);
        itemWrapper.appendChild(label);

        // Add the div to the form
        form.appendChild(itemWrapper);
    }

    // Remove the list
    list.remove();
}

// Main process
function ebListToChecklist() {
    'use strict';

    // Get the lists
    var lists = document.querySelectorAll('.checklist');

    // For each one, create a form
    if (lists.length > 0) {
        console.log('Found lists to turn into checklists. Converting...');
        var i;
        for (i = 0; i < lists.length; i += 1) {
            ebListToChecklistCreateForm(lists[i], [i]);
        }
    }
}

ebListToChecklist();
