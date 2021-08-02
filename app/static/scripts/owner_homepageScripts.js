



carousel_fetch();

// removes and refreshes carousel photos
function carousel_fetch() {

    // same as the acutal page.
    fetch('/carousel_photos', { method: 'POST' })
    .then(response => response.json())
    .then(json_object => display_carousel_contents(json_object))
    .catch( error => console.log('ERROR', error));


}

// uses list from fetch to create new elements
// all listeners for elements written inline
function display_carousel_contents(file_list_object) {

    let carousel_objects_div = document.getElementById('carousel_objects');
    removeAllChildNodes(carousel_objects_div);

    for (const [id, name] of Object.entries(file_list_object)) {
        
        let carousel_object = document.createElement('div');
        carousel_object.className = 'carousel_object';
        // using the name as id for removal icon
        // carousel_object.id = name;
        
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
        product_img.src = file_string + name + '?id=' + id;
        img_div.append(product_img);

        // removal buttons 
        let remove_icon = document.createElement('div');
        remove_icon.className = 'remove_icon';
        remove_icon.id = name;
        remove_icon.addEventListener('click', remove_carousel_file);

        let trash_can = document.createElement('img');
        trash_can.className = 'trash_can';
        trash_can.src = '/static/trash_can.svg';

        remove_icon.append(trash_can);
        carousel_object.append(remove_icon);

        // on click of carousel_object, show remove icon, blur / listen for click out
        carousel_object.addEventListener('click', () => {
            img_div.classList.toggle('blur');
            remove_icon.classList.toggle('show');
            
            //add global click listener with outside click callback
            document.body.addEventListener('click', outside_click);

        });

        carousel_object.append(filename, img_div);

        // add listener, etc.

        carousel_objects_div.append(carousel_object);

        // listener function for state change on outside click
        function outside_click(event) {

            var clicked_in = true;
            var clicked_element = event.target;

            do {
                
                // target element must be watched_element, or a child
                if(clicked_element == carousel_object) {
                    // console.log('clicked element');
                    return // exit checking loop
                }

                // anything other than the profile div needs to check it's parent
                let next_parent = clicked_element.parentElement;
                
                // next two ifs will loop until it either finds the profile
                // or it finds the body.
                if(next_parent == carousel_object) {
                    // console.log('clicked child');
                    return // exit checking loop
                }
                
                if(next_parent == document.body ) {
                    clicked_in = false;
                    // console.log('clicked outside');

                    img_div.classList.toggle('blur');
                    remove_icon.classList.toggle('show');    
                    
                    document.body.removeEventListener('click', outside_click);
                

                }

                // assignment for next iteration..
                clicked_element = next_parent;

            } while (clicked_in);

        }

    }

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

// confirm or deny upload. run the ajax to upload
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

// ajax call to remove certain file from storage and db
function remove_carousel_file(event) {
    let file_object = {filename : event.target.id }
    if( file_object.filename == '') { file_object.filename = event.target.parentElement.id; }    

    let json_data = JSON.stringify(file_object);
    // fetch post with filename to remove from folder?

    fetch('/remove_carousel_photo', { // POST endpoint
    method: 'POST',
    headers: {
        "Content-Type": 'application/json'
        },
    body: json_data
    })
    .then(function(response) {
            // passing response, just call refresh.
            carousel_fetch();
        }
    ).catch(error => console.log(error));

    
}

// pass in the parent to remove everything inside
function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}


// inventory item creation here
// 
inventory_fetch();

function inventory_fetch() {

    // same as the acutal page.
    fetch('/load_inventory', { method: 'POST' })
    .then(response => response.json())
    .then(json_object => display_inventory_contents(json_object))
    .catch( error => console.log('ERROR', error));    

}

// called by invetory fetch. parses db info and creates elements
function display_inventory_contents(loaded_json) {


    let inventory_objects = document.getElementById('inventory_objects');
    removeAllChildNodes(inventory_objects);

    
    for ( let product of loaded_json) {

        let product_container = document.createElement('div');
        product_container.className = 'product_container';

        let showing_row = document.createElement('div');
        showing_row.className = 'showing_row';
    
        let toggle_product = document.createElement('div');
        toggle_product.className = 'toggle_product';
        // listen for click , toggle expaned view div
        toggle_product.addEventListener('click', function() {
            // could search the children .
            let this_showing_row = toggle_product.parentElement;
            
            let this_exp_view = this_showing_row.nextSibling;

            this_exp_view.classList.toggle('show');
            this.classList.toggle('showing');

        });
        
        let product_description = document.createElement('div');
        product_description.className = 'product_description';
        product_description.innerText = product.description;
        
        showing_row.append(toggle_product, product_description);
        
        let expanded_view = document.createElement('div');
        expanded_view.className = 'expanded_view';

        let product_photos = document.createElement('div');
        product_photos.className = 'product_photos';

        for( let photo_file of product.photos_list ) {
            let product_photo = document.createElement('div');
            product_photo.className = 'product_photo';
            product_photo.addEventListener('click', product_photo_removal);

            let product_img = document.createElement('img');
            product_img.className = 'product_img';
            product_img.src = '/static/product_inventory/' + product.id + '/' + photo_file;

            let remove_icon = document.createElement('div');
            remove_icon.className = 'remove_icon';
            remove_icon.id = photo_file;
            
            let trash_can = document.createElement('img');
            trash_can.className = 'trash_can';
            trash_can.src = '/static/trash_can.svg';
            trash_can.id = product.id;
            remove_icon.append(trash_can);

            product_photo.append(product_img, remove_icon);

            product_photos.append(product_photo);

        }  

        // vvv adding product photos

        // create the add_product_image after the loop
        let add_product_photo = document.createElement('div');
        add_product_photo.className = 'product_photo add';

        let add_product_photo_filename = document.createElement('div');
        add_product_photo_filename.className = 'add_product_photo_filename';
        add_product_photo_filename.innerText = 'Add';

        let product_photo_plus_icon = document.createElement('label');
        product_photo_plus_icon.className = 'plus_icon photo_for_product';
        product_photo_plus_icon.setAttribute('for', 'add_product_photo_input');
        product_photo_plus_icon.id = product.id;

        let product_photo_confirm_icon = document.createElement('div');
        product_photo_confirm_icon.className = 'confirm_icon photo_for_product';

        let product_photo_deny_icon = document.createElement('div');
        product_photo_deny_icon.className = 'deny_icon photo_for_product';


        
        let hidden_product_photo_form = document.createElement('form');
        hidden_product_photo_form.enctype = 'multipart/form-data';
        hidden_product_photo_form.className = 'hidden_form';

        let add_product_photo_input = document.createElement('input');
        add_product_photo_input.type = 'file';
        add_product_photo_input.id = 'add_product_photo_input';
        add_product_photo_input.name = 'add_product_photo_input';
        // on input, run upload function.. show confirm/deny icons
        add_product_photo_input.addEventListener('input', upload_product_photo);
        hidden_product_photo_form.append(add_product_photo_input);
        product_photo_plus_icon.append(hidden_product_photo_form);

        add_product_photo.append(add_product_photo_filename, product_photo_plus_icon, product_photo_confirm_icon, product_photo_deny_icon);

        product_photos.append(add_product_photo);
        // ^^^ adding product photos

        let product_details = document.createElement('div');
        product_details.className = 'product_details';
        product_details.innerText = product.details;

        let bottom_row = document.createElement('div');
        bottom_row.className = 'bottom_row';
        
        let product_price = document.createElement('div');
        product_price.className = 'product_price';
        product_price.innerText = '$' + product.price.toString();

        let product_status = document.createElement('div');
        product_status.className = 'product_status';
        // TODO: parse status. set rules for each number.. etc
        product_status.innerText = 'Status: ' + product.status.toString();

        bottom_row.append(product_price, product_status);

        expanded_view.append(product_photos, product_details, bottom_row);



        product_container.append(showing_row, expanded_view);

        inventory_objects.append(product_container);
    }

    



}

// called from input listener. uses plus icon id for product id
function upload_product_photo() {

    console.log(this);
    let form = this.parentElement;
    let plus_icon = form.parentElement;
    let confirm_icon = plus_icon.nextSibling;
    let deny_icon = confirm_icon.nextSibling;

    let filename = plus_icon.previousSibling;

    let file_object = {
            object: this.files[0],
            name: this.files[0].name,
            size: this.files[0].size,
            type: this.files[0].type
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
            
            form_data.append("product_id", plus_icon.id);
            form_data.append("add_product_photo_input", this.files[0]);
            console.log(form_data);

            fetch('/new_product_photo', {
                method: 'POST',
                body: form_data
                })
            .then((success) => {
                inventory_fetch();
                console.log(success);
            })
            .catch((fail) => console.log(fail));
        
        });

        // reverse the confirm / deny. empty the file input. and reset filename
        deny_icon.addEventListener('click', () =>{
            
            confirm_icon.classList.remove('confirm_show');
            deny_icon.classList.remove('confirm_show');
            plus_icon.classList.remove('hide_plus');

            filename.innerText = 'New Photo';

            this.value = '';
        });

}


function product_photo_removal() {

    // add some classes and show remove_icon
    console.log(this);

    let remove_icon = this.firstChild.nextSibling;
    let trash_can = remove_icon.firstChild;
    let product_img = this.firstChild;

    remove_icon.classList.add('show');
    product_img.classList.add('removal');

    // remove icon listener..
    remove_icon.addEventListener('click', remove_product_photo_fetch);

    // global click listener, remove the remove_icon?
    setTimeout(() => {document.body.addEventListener('click', outside_click) }, 100);

    // listener function for state change on outside click
    function outside_click(event) {

        var clicked_in = true;
        var clicked_element = event.target;

        do {
            
            // target element must be watched_element, or a child
            if(clicked_element == remove_icon) {
                // console.log('clicked element');
                return // exit checking loop
            }

            // anything other than the profile div needs to check it's parent
            let next_parent = clicked_element.parentElement;
            
            // next two ifs will loop until it either finds the profile
            // or it finds the body.
            if(next_parent == remove_icon) {
                // console.log('clicked child');
                return // exit checking loop
            }
            
            if(next_parent == document.body ) {
                clicked_in = false;
                // console.log('clicked outside');

                remove_icon.classList.remove('show');
                product_img.classList.remove('removal');   
                
                document.body.removeEventListener('click', outside_click);
                remove_icon.removeEventListener('click', remove_product_photo_fetch)

            }

            // assignment for next iteration..
            clicked_element = next_parent;

        } while (clicked_in);

    }

}

// named for event listener removal
function remove_product_photo_fetch() {
    
    // 'this' is remove_icon, child is trash can

    let form_data = new FormData();
            
    form_data.append("product_id", this.firstChild.id);
    form_data.append("photo_filename", this.id);

    fetch('/remove_product_photo', {
        method: 'POST',
        body: form_data
        })
    .then((success) => {
        inventory_fetch();
        console.log(success);
    })
    .catch((fail) => console.log(fail));

}

