/* jslint browser */
/*global window */

function ebDefinitionsInit() {
    'use strict';

    // check for browser support of the features we use
    return navigator.userAgent.indexOf('Opera Mini') === -1 &&
            document.querySelector !== undefined &&
            window.addEventListener !== undefined &&
            !!Array.prototype.forEach;
}

function ebDefinitionsSlugify(snail) {
    'use strict';

    return snail.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/-+/g, '-')            // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text;
}

function ebDefinitionsMoveDefinitions() {
    'use strict';

    // get all the definition-terms and loop over them
    var definitionTerms = document.querySelectorAll('.definition-term');

    // loop over them
    definitionTerms.forEach(function (definitionTerm) {

        // visually hide the old dl, the parent of the definitionTerm
        definitionTerm.parentNode.classList.add('hidden-definition-list');

        // get the definition term
        var definitionTermText = definitionTerm.innerHTML;

        // Detect presence of em spans
        var definitionTermTextIsItalic;
        if (definitionTermText.indexOf('<em>') !== -1) {
            definitionTermTextIsItalic = true;
        }

        // Create a plain-text version of definitionTermText for matching with dataTermInText
        var termTextForMatching = definitionTermText;
        // 1. Remove em spans created from asterisks in markdown
        if (definitionTermTextIsItalic) {
            termTextForMatching = termTextForMatching.replace(/(<([^>]+)>)/ig, "*");
        }
        // 2. Straighten quotes in the HTML to match data-terms
        termTextForMatching = termTextForMatching.replace("’", "'");
        termTextForMatching = termTextForMatching.replace("‘", "'");

        // to check that we even have any terms to define:
        // find a data-term attribute
        var dataTermInText = document.querySelector('[data-term="' + termTextForMatching + '"]');
        // check that we have the term in the text
        if (!dataTermInText) {
            return;
        }


        // now we can add popups to each of them

        // find all the places where we want a popup
        var dataTermsInText = document.querySelectorAll('[data-term="' + termTextForMatching + '"]');

        // for each one, get the description and add the popup
        dataTermsInText.forEach(function (dataTermInText) {

            // if the term contained italics, put the em tags back
            if (definitionTermTextIsItalic) {
                definitionTermText = termTextForMatching.replace(/\*(.+?)\*/ig, '<em>$1</em>');
            }

            // get the description text
            var definitionDescriptionText = definitionTerm.nextElementSibling.innerHTML;

            // add it after the data-term
            var definitionPopup = document.createElement('span');
            definitionPopup.innerHTML = '<span class="definition-hover-term">' + definitionTermText + '</span>' + ' ' + definitionDescriptionText;
            definitionPopup.classList.add('visuallyhidden');
            definitionPopup.classList.add('definition-description-hover');
            definitionPopup.id = 'dd-' + ebDefinitionsSlugify(definitionTermText);
            dataTermInText.insertAdjacentElement('afterEnd', definitionPopup);

            // add the closing X as a link
            var closeButton = document.createElement('button');
            closeButton.classList.add('close');
            closeButton.innerHTML = '<span class="visuallyhidden">close</span>';
            definitionPopup.appendChild(closeButton);
        });

    });

}

function ebDefinitionsShowDescriptions() {
    'use strict';

    // get the terms
    var dataTerms = document.querySelectorAll('[data-term]');

    // loop and listen for hover on child description
    dataTerms.forEach(function (dataTerm) {

        // get the child that we want to pop up
        var childPopup = dataTerm.nextElementSibling;

        // show on click
        dataTerm.addEventListener('click', function () {
            childPopup.classList.remove('visuallyhidden');
        });

    });

}

function ebDefinitionsHideDescriptions() {
    'use strict';

    var descriptions = document.querySelectorAll('.definition-description-hover');

    descriptions.forEach(function (description) {
        // if we mouseleave description, hide it
        // (mouseout also fires on mouseout of children, so we use mouseleave)
        description.addEventListener('mouseleave', function () {
            setTimeout(function () {
                description.classList.add('visuallyhidden');
            }, 1000);
        });
    });

}

function ebDefinitionsHideDescriptionWithButton() {
    'use strict';

    var closeButtons = document.querySelectorAll('.definition-description-hover button.close');

    // listen for clicks on all close buttons
    closeButtons.forEach(function (closeButton) {
        closeButton.addEventListener('click', function () {
            // ev.preventDefault();
            closeButton.parentNode.classList.add('visuallyhidden');
        });
    });
}

var ebDefinitions = function () {
    'use strict';

    // early exit for lack of browser support
    if (!ebDefinitionsInit()) {
        return;
    }

    // move all the definitions next to their terms
    ebDefinitionsMoveDefinitions();

    // listen for hover and things
    ebDefinitionsShowDescriptions();
    ebDefinitionsHideDescriptions();
    ebDefinitionsHideDescriptionWithButton();


};

ebDefinitions();
