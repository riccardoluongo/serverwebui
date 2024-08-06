function new_link() {
    let links_form = document.getElementById('newlink-form');
    links_form.addEventListener("submit", (e) => {
        e.preventDefault();

        let name = document.getElementById("link-name");
        let url = document.getElementById("link-url");

        if (name.value != "" && url.value != "") {
            fetch(`/create_link_url?name=${name.value}&url=${url.value}`)
        } else {
            alert("Do not leave fields empty!");
        }
        
        updateLinkTable()
    });
}

function del_all() {
    if (confirm('Do you want to delete ALL bookmarks?')) {
        fetch(`/del_all`)
    }
}

function setAttributes(el, attrs) {
    for (let key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
}

function showEdit(id,name,url){
    let link_url = document.getElementById(`url${id}`)
    let link_name = document.getElementById(`name${id}`)
    let link_buttons = document.getElementById(`button${id}`)

    while (link_url.firstChild) {
        link_url.removeChild(link_url.firstChild);
    }
    while (link_name.firstChild) {
        link_name.removeChild(link_name.firstChild);
    }
    while (link_buttons.firstChild) {
        link_buttons.removeChild(link_buttons.firstChild);
    }

    let name_input = link_name.appendChild(document.createElement('input'))
    setAttributes(name_input, {'id' : 'name-input', 'type' : 'text', 'class' : 'form-control form-control-sm'})
    name_input.value = name

    let url_input = link_url.appendChild(document.createElement('input'))
    setAttributes(url_input, {'id' : 'url-input', 'type' : 'text', 'class' : 'form-control form-control-sm'})
    url_input.value = url

    let apply_btn = link_buttons.appendChild(document.createElement('button'))
    apply_btn.setAttribute('class', 'apply-button')
    let apply_icon = apply_btn.appendChild(document.createElement('i'))
    apply_icon.setAttribute('class', 'fa fa-check apply-icon')
    apply_btn.addEventListener('click', fetchEdit)

    function fetchEdit(){
        fetch(`/edit_link?name=${name_input.value}&url=${url_input.value}&id=${id}`)
        .then(function(response) {
                if (!response.ok) {
                    return response.text()
                }
                else{
                    updateLinkTable()
                }
            })
            .then(data => {
                if(data) {
                    alert(data)
                }
            })
    }
}

function updateLinkTable() {
    fetch('/get_links')
        .then(response => response.json())
        .then(data => {
            let form = document.getElementById("link-table");

            while (form.firstChild) {
                form.removeChild(form.firstChild);
            }

            let create_title_row = document.createElement('tr')
            let title_row_append = form.appendChild(create_title_row)
            let create_name_th = document.createElement('th')
            let create_url_th = document.createElement('th')
            let create_actions_th = document.createElement('th')

            let name_th = title_row_append.appendChild(create_name_th)
            name_th.appendChild(document.createTextNode('Name'))

            let url_th = title_row_append.appendChild(create_url_th)
            url_th.appendChild(document.createTextNode('URL'))

            let actions_th = title_row_append.appendChild(create_actions_th)
            actions_th.appendChild(document.createTextNode('Actions'))

            for (const link in data) {
                let row = form.appendChild(document.createElement('tr'))
                row.setAttribute("id", `${data[link][0]}`)

                let name_column = row.appendChild(document.createElement('td'))
                setAttributes(name_column, {'id' : `name${data[link][0]}`, 'class' : 'name-column'})
                name_column.innerText = data[link][1]

                let url_column = row.appendChild(document.createElement('td'))
                setAttributes(url_column, {'id' : `url${data[link][0]}`, 'class' : 'url-column'})
                let url_link = url_column.appendChild(document.createElement('a'))
                setAttributes(url_link, {'id' : `clickable${data[link][0]}`, 'href' : `${data[link][2]}`})
                url_link.innerText = data[link][2]

                let button_column = row.appendChild(document.createElement('td'))
                button_column.setAttribute('id', `button${data[link][0]}`)

                let del_href = button_column.appendChild(document.createElement('a'))
                del_href.setAttribute("href", `/del_link?id=${data[link][0]}`)
                let del_btn = del_href.appendChild(document.createElement('button'))
                setAttributes(del_btn, {'class' : 'del-btn', 'title' : 'Delete'})
                del_btn.appendChild(document.createElement("i")).setAttribute("class", "fa fa-trash del-btn2")

                let edit_btn = button_column.appendChild(document.createElement('button'))
                setAttributes(edit_btn, {'class': 'edit-btn', 'title' : 'Edit'})
                edit_btn.appendChild(document.createElement('i')).setAttribute('class', 'fa fa-pencil-square-o edit-btn-icon')
                edit_btn.setAttribute('onclick', `showEdit(${data[link][0]}, '${data[link][1]}', '${data[link][2]}')`)
            }
        })
}

window.onload = function() {
    let del_all_btn = document.getElementById('del-all-btn');
    del_all_btn.addEventListener('click', del_all);

    new_link();
    updateLinkTable();
}
//By Riccardo Luongo, 05/06/2024