

// we need fetch commands to populate the divs on page load.

// load in these things into js. So we can accurately parse what changes
// need to be made back to the server.
carousel_fetch();

function carousel_fetch() {

    let carousel_photo_names = [];
    // same as the acutal page.
    fetch('/carousel_photos', { method: 'POST' })
    .then(response => response.json())
    .then(json_of_file_names => display_carousel_contents(json_of_file_names))
    .catch( error => console.log('ERROR', error));


}

function display_carousel_contents(name_list) {

    let carousel_objects_div = document.getElementById('carousel_objects');
    removeAllChildNodes(carousel_objects_div);

    name_list.forEach( (name) => {

        let carousel_object = document.createElement('div');
        carousel_object.className = 'carousel_object';
        carousel_object.id = name;
        
        let filename = document.createElement('div');
        filename.className = 'filename';
        if(name.length > 15 ) {
            let sliced_name = name.slice(0,15);
            sliced_name = sliced_name + '...';
            filename.innerText = sliced_name;
        } else {
            filename.innerText = name;
        }

        // possibly add in a preview image here
        let img_div = document.createElement('div');
        img_div.className = 'img_div';

        let product_img = document.createElement('img');
        product_img.className = 'product_img';
        let file_string = '/static/carousel_photos/';
        // append database id # as a .jpg?id=4
        product_img.src = file_string + name + '?id=tbd';
        img_div.append(product_img);

        carousel_object.append(filename, img_div);

        // add listener, etc.

        carousel_objects_div.append(carousel_object);

    });

    // way to add a new photo to the folder
    let add_new_carousel_object = document.createElement('div');
    add_new_carousel_object.className = 'carousel_object';
    add_new_carousel_object.id = 'new_carousel_photo';
    
    let filename = document.createElement('div');
    filename.className = 'filename';
    filename.innerText = 'New Photo';

    let img_div = document.createElement('div');
    img_div.className = 'img_div new';
    
    let plus_icon = document.createElement('label');
    plus_icon.className = 'plus_icon';
    plus_icon.setAttribute('for', 'carousel_file_input');
    img_div.append(plus_icon);

    // used after file has been chosen
    let confirm_icon = document.createElement('div');
    confirm_icon.className = 'confirm_icon';
    img_div.append(confirm_icon);

    let deny_icon = document.createElement('div');
    deny_icon.className = 'deny_icon';
    img_div.append(deny_icon);

    let hidden_form = document.createElement('form');
    hidden_form.enctype = 'multipart/form-data';
    hidden_form.className = 'hidden_form';
    // hidden_form.action = '/new_carousel_photo';
    // hidden_form.method = 'post';

    let carousel_file_input = document.createElement('input');
    carousel_file_input.type = 'file';
    carousel_file_input.id = 'carousel_file_input';
    carousel_file_input.name = 'carousel_file_input';
    hidden_form.append(carousel_file_input);
    plus_icon.append(hidden_form);


    add_new_carousel_object.append(filename, img_div);
    // add listener for file selected, etc.
    carousel_file_input.addEventListener('input', () => {
        let file_object = {
            object: carousel_file_input.files[0],
            name: carousel_file_input.files[0].name,
            size: carousel_file_input.files[0].size,
            type: carousel_file_input.files[0].type
        }
        // display confirm or deny and add listeners..
        confirm_icon.classList.add('confirm_show');
        deny_icon.classList.add('confirm_show');
        plus_icon.classList.add('hide_plus');

        // shorten filename for display?
        if( file_object.name.length > 15) {
            let sliced_name = file_object.name.slice(0,15);
            sliced_name = sliced_name + '...';
            filename.innerText = sliced_name;
        } else {
            filename.innerText = file_object.name;
        }
        // grab the form data and post. then refresh the div
        confirm_icon.addEventListener('click', () => {

            let form_data = new FormData();
            form_data.append('carousel_file_input', carousel_file_input.files[0]);

            fetch('/new_carousel_photo', {
                method: 'POST',
                body: form_data
                })
            .then((success) => {
                carousel_fetch();
            })
            .catch((fail) => console.log(fail));
        
        });

        // reverse the confirm / deny. empty the file input. and reset filename
        deny_icon.addEventListener('click', () =>{
            
            confirm_icon.classList.remove('confirm_show');
            deny_icon.classList.remove('confirm_show');
            plus_icon.classList.remove('hide_plus');

            filename.innerText = 'New Photo';

            carousel_file_input.value = '';
        });

    });


    carousel_objects_div.append(add_new_carousel_object);

}

// display a confirm or deny , and the file name. run the ajax to upload
function upload_carousel_file() {

    let input_element = document.getElementById('carousel_file_input');

    let file = input_element.files[0];

    upload(file);

    function upload(file) {

        fetch('/new_carousel_photo', { // Your POST endpoint
        method: 'POST',
        headers: {
            "Content-Type": file.type
            },
        body: file
        })
        .then(function(response) {
                    // checks for and parses json. 
                    response.json().then( function(result){ 
                    
                    console.log(result);
                });
            }
        );
    };

}


function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}
