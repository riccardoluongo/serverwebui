function deleteAll() {
    if (confirm('Do you want to delete ALL bookmarks?')) {
        fetch("/del_all", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then((response) => {
                if (!response.ok) {
                    alert("Couldn't delete links. Check the logs for further information.");
                }
            })
        updateLinkTable();
    }
}

function setAttributes(el, attrs) {
    for (const key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
}

function showEdit(id, name, url) {
    const linkUrl = document.getElementById(`url${id}`);
    const linkName = document.getElementById(`name${id}`);
    const linkButtons = document.getElementById(`button${id}`);

    while (linkUrl.firstChild) {
        linkUrl.removeChild(linkUrl.firstChild);
    }
    while (linkName.firstChild) {
        linkName.removeChild(linkName.firstChild);
    }
    while (linkButtons.firstChild) {
        linkButtons.removeChild(linkButtons.firstChild);
    }

    const nameInput = linkName.appendChild(document.createElement('input'));
    setAttributes(nameInput, {
        'id': 'name-input',
        'type': 'text',
        'class': 'form-control form-control-sm'
    });
    nameInput.value = name;

    const urlInput = linkUrl.appendChild(document.createElement('input'));
    setAttributes(urlInput, {
        'id': 'url-input',
        'type': 'text',
        'class': 'form-control form-control-sm'
    });
    urlInput.value = url;

    const applyBtn = linkButtons.appendChild(document.createElement('button'));
    const applyIcon = applyBtn.appendChild(document.createElement('i'));

    applyBtn.setAttribute('class', 'apply-button');
    applyIcon.setAttribute('class', 'fa fa-check apply-icon');
    applyBtn.addEventListener('click', fetchEdit);

    function fetchEdit() {
        fetch("/edit_link", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([nameInput.value, urlInput.value, id])
            })
            .then((response) => {
                if (!response.ok) {
                    alert("Couldn't delete links. Check the logs for further information.");
                }
                updateLinkTable();
            })
    }
}

function deleteLink(id) {
    fetch("/del_link", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(id)
        })
        .then((response) => {
            if (response.ok) {
                updateLinkTable();
            } else {
                alert("Couldn't delete link. Check the logs for further information")
            }
        })
}

function updateLinkTable() {
    fetch('/get_links')
        .then(response => response.json())
        .then(data => {
            const form = document.getElementById("link-table");

            while (form.firstChild) {
                form.removeChild(form.firstChild);
            }

            const titleRow = form.appendChild(document.createElement('tr'));

            const nameTh = titleRow.appendChild(document.createElement('th'));
            nameTh.appendChild(document.createTextNode('Name'));

            const urlTh = titleRow.appendChild(document.createElement('th'));
            urlTh.appendChild(document.createTextNode('URL'));

            const actionsTh = titleRow.appendChild(document.createElement('th'));
            actionsTh.appendChild(document.createTextNode('Actions'));

            for (const link in data) {
                const row = form.appendChild(document.createElement('tr'));
                row.setAttribute("id", `${data[link][0]}`);

                const nameColumn = row.appendChild(document.createElement('td'));
                setAttributes(nameColumn, {
                    'id': `name${data[link][0]}`,
                    'class': 'name-column'
                });
                nameColumn.innerText = data[link][1];

                const urlColumn = row.appendChild(document.createElement('td'));
                setAttributes(urlColumn, {
                    'id': `url${data[link][0]}`,
                    'class': 'url-column'
                });
                const urlLink = urlColumn.appendChild(document.createElement('a'));
                setAttributes(urlLink, {
                    'id': `clickable${data[link][0]}`,
                    'href': `${data[link][2]}`
                });
                urlLink.innerText = data[link][2];

                const buttonColumn = row.appendChild(document.createElement('td'));
                setAttributes(buttonColumn, {'id': `button${data[link][0]}`, 'class' : 'button-column'});

                const delHref = buttonColumn.appendChild(document.createElement('a'));
                delHref.setAttribute("onclick", `deleteLink(${data[link][0]})`);
                const delButton = delHref.appendChild(document.createElement('button'));
                setAttributes(delButton, {
                    'class': 'del-btn',
                    'title': 'Delete'
                });
                delButton.appendChild(document.createElement("i")).setAttribute("class", "fa fa-trash del-btn2");

                const editButton = buttonColumn.appendChild(document.createElement('button'));
                setAttributes(editButton, {
                    'class': 'edit-btn',
                    'title': 'Edit'
                });
                editButton.appendChild(document.createElement('i')).setAttribute('class', 'fa fa-pencil-square-o edit-btn-icon');
                editButton.setAttribute('onclick', `showEdit(${data[link][0]}, '${data[link][1]}', '${data[link][2]}')`);
            }
        })
}

window.onload = function() {
    let deleteAllButton = document.getElementById('del-all-btn');
    deleteAllButton.addEventListener('click', deleteAll);

    updateLinkTable();
}
//By Riccardo Luongo, 19/01/2025