let db = null;

document.addEventListener('deviceready', function() {
    db = window.sqlitePlugin.openDatabase({name: 'mycondtacts.db', location: 'default'});
    db.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT)');
        loadContacts();
    }, function(error) {
        console.log('Transaction ERROR: ' + error.message);
    });
}, false);

function generateAvatarUrl(name) {
    const encodedName = encodeURIComponent(name.trim());
    return `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff`;
}

function loadContacts() {
    db.transaction(function(tx) {
        tx.executeSql('SELECT * FROM contacts', [], function(tx, rs) {
            let contacts = [];
            for(let i = 0; i < rs.rows.length; i++) {
                contacts.push(rs.rows.item(i));
            }
            displayContacts(contacts);
        }, function(tx, error) {
            console.log('SELECT error: ' + error.message);
        });
    });
}

function displayContacts(contacts) {
    let contactHTML = '';
    for (const contact of contacts) {
        const avatarUrl = generateAvatarUrl(contact.name);
        contactHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <img src="${avatarUrl}" class="rounded-circle mr-3" style="width: 50px; height: 50px;">
                <span class="flex-grow-1">
                    <h5 class="mb-1">${contact.name}</h5>
                    <p class="mb-0">${contact.phone}</p>
                </span>
                <div class="contact-actions">
                    <i onclick="updateContactPrompt(${contact.id}, '${contact.name}', '${contact.phone}')" class="fas fa-edit mr-2"></i>
                    <i onclick="deleteContact(${contact.id})" class="fas fa-trash"></i>
                </div>
            </li>
        `;
    }
    $('#contactList').html(contactHTML);
}

function addContact() {
    const name = $('#newName').val();
    const phone = $('#newNumber').val();
    db.transaction(function(tx) {
        tx.executeSql('INSERT INTO contacts (name, phone) VALUES (?, ?)', [name, phone], function(tx, res) {
            loadContacts();
        }, function(tx, error) {
            console.log('INSERT error: ' + error.message);
        });
    });
}

function deleteContact(contactId) {
    db.transaction(function(tx) {
        tx.executeSql('DELETE FROM contacts WHERE id = ?', [contactId], function(tx, res) {
            loadContacts();
        }, function(tx, error) {
            console.log('DELETE error: ' + error.message);
        });
    });
}

function updateContactPrompt(contactId, name, phone) {
    $('#updateName').val(name);
    $('#updateNumber').val(phone);
    $('#updatingContactId').val(contactId);
    $('#updateContactPopup').popup('open');
}

function submitContactUpdate() {
    const contactId = $('#updatingContactId').val();
    const name = $('#updateName').val();
    const phone = $('#updateNumber').val();
    db.transaction(function(tx) {
        tx.executeSql('UPDATE contacts SET name = ?, phone = ? WHERE id = ?', [name, phone, contactId], function(tx, res) {
            loadContacts();
        }, function(tx, error) {
            console.log('UPDATE error: ' + error.message);
        });
    });
}

function filterContacts() {
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById('searchContact');
    filter = input.value.toUpperCase();
    ul = document.getElementById("contactList");
    li = ul.getElementsByTagName('li');

    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("h2")[0];
        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}
