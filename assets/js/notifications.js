// Show and hide notification

// Get a notification's hidden status
function ebGetNoticationHiddenStatus(notification) {
    'use strict';
    var status = sessionStorage.getItem(notification.id);
    return status;
}

// Save a notification's hidden status
function ebStoreNotificationHiddenStatus(notification) {
    'use strict';
    sessionStorage.setItem(notification.id, 'hidden');
}

// Add a hide button and listen for hiding clicks
function ebEnableHidingNotification(notification) {
    'use strict';

    // Hide if already hidden in this session
    if (ebGetNoticationHiddenStatus(notification) === 'hidden') {
        notification.classList.add('notification-hidden');
        notification.classList.remove('notification-visible');
    }

    // Create a close button
    var closeButton = document.createElement('input');
    closeButton.type = 'checkbox';
    closeButton.name = notification.id + '--close';
    closeButton.id = notification.id + '--close';
    closeButton.classList.add('notification-close');
    closeButton.innerHTML = '×';
    notification.appendChild(closeButton);

    // Create a label for the checkbox
    var label = document.createElement('label');
    label.setAttribute('for', notification.id + '--close');
    label.innerHTML = "OK";
    closeButton.insertAdjacentElement('afterend', label);

    // Listen for clicks on checkbox
    closeButton.addEventListener('change', function () {
        var checkbox = event.target;
        if (checkbox.checked) {
            notification.style.display = 'none';
            ebStoreNotificationHiddenStatus(notification);
        }
    })
}

// Make all notifications hideable
function ebHideNotifications() {
    'use strict';
    var notifications = document.querySelectorAll('[id*="notification-"]');
    notifications.forEach(function (notification) {
        if (ebGetNoticationHiddenStatus(notification) !== 'hidden') {
            notification.classList.remove('notification-hidden');
            notification.classList.add('notification-visible');
            ebEnableHidingNotification(notification);
        }
    })
}

// Go
ebHideNotifications();
