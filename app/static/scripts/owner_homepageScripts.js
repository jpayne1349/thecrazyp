



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
        carousel_object.addEventListener('click', trigger_removal);

        
        function trigger_removal() {
            img_div.classList.add('blur');
            remove_icon.classList.add('show');
            
            let click_catcher = document.createElement('div');
            click_catcher.id = 'click_catcher';
            document.body.appendChild(click_catcher);

            carousel_object.removeEventListener('click', trigger_removal);
            click_catcher.addEventListener('click', untrigger_removal);
               
        }

        function untrigger_removal() {
            img_div.classList.remove('blur');
            remove_icon.classList.remove('show');

            let click_catcher = document.getElementById('click_catcher');
            click_catcher.removeEventListener('click', untrigger_removal)
            click_catcher.remove();

            carousel_object.addEventListener('click', trigger_removal);

        }

        carousel_object.append(filename, img_div);

        // add listener, etc.

        carousel_objects_div.append(carousel_object);

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
    // remove click catcher too
    let click_catcher = document.getElementById('click_catcher');
    click_catcher.remove();

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
        product_container.setAttribute('p_id', product.id);

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

        let edit_product = document.createElement('div');
        edit_product.className = 'edit_product';
        let edit_pencil = document.createElement('img');
        edit_pencil.className = 'edit_pencil';
        edit_pencil.src = '/static/edit_pencil.svg';
        edit_product.appendChild(edit_pencil);
        edit_product.addEventListener('click', edit_product_inputs);

        showing_row.append(toggle_product, product_description, edit_product);
        
        let expanded_view = document.createElement('div');
        expanded_view.className = 'expanded_view';

        let product_photos = document.createElement('div');
        product_photos.className = 'product_photos';

        // adding existing photos
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
        product_photo_plus_icon.setAttribute('for', 'add_product_photo_input'+ product.id);
        product_photo_plus_icon.id = product.id;

        let product_photo_icons = document.createElement('div');
        product_photo_icons.className = 'product_photo_icons';

        let product_photo_confirm_icon = document.createElement('div');
        product_photo_confirm_icon.className = 'confirm_icon photo_for_product';

        let product_photo_deny_icon = document.createElement('div');
        product_photo_deny_icon.className = 'deny_icon photo_for_product';

        product_photo_icons.append(product_photo_confirm_icon, product_photo_deny_icon);
        
        let hidden_product_photo_form = document.createElement('form');
        hidden_product_photo_form.enctype = 'multipart/form-data';
        hidden_product_photo_form.className = 'hidden_form';

        let add_product_photo_input = document.createElement('input');
        add_product_photo_input.type = 'file';
        add_product_photo_input.id = 'add_product_photo_input' + product.id;
        add_product_photo_input.name = 'add_product_photo_input';
        // on input, run upload function.. show confirm/deny icons
        add_product_photo_input.addEventListener('input', upload_product_photo);
        hidden_product_photo_form.append(add_product_photo_input);
        product_photo_plus_icon.append(hidden_product_photo_form);

        add_product_photo.append(add_product_photo_filename, product_photo_plus_icon, product_photo_icons);

        product_photos.append(add_product_photo);
        // ^^^ adding product photos

        let product_details = document.createElement('div');
        product_details.className = 'product_details';
        product_details.innerText = product.details;

        let bottom_row = document.createElement('div');
        bottom_row.className = 'bottom_row';
        
        let product_price = document.createElement('div');
        product_price.className = 'product_price';
        let product_price_sign = document.createElement('div');
        product_price_sign.innerText = '$';
        let product_price_value = document.createElement('div');
        product_price_value.innerText = product.price.toString();
        product_price.append(product_price_sign, product_price_value);

        let product_status = document.createElement('div');
        product_status.className = 'product_status';
        product_status.setAttribute('val', product.status);
        //  0 - avail, 1 - pending , 2 - sold
        if(product.status == 0 ) {
            product_status.classList.add('avail');
            product_status.innerText = 'Available';
        } else if ( product.status == 1 ) {
            product_status.classList.add('pending');
            product_status.innerText = 'Pending';
        } else {
            product_status.classList.add('sold');
            product_status.innerText = 'Sold';
        }

        bottom_row.append(product_price, product_status);

        let delete_product = document.createElement('div');
        delete_product.className = 'delete_product';
        let trash_can = document.createElement('img');
        trash_can.className = 'product_trash_can';
        trash_can.src = '/static/trash_can.svg';
        delete_product.appendChild(trash_can);
        delete_product.addEventListener('click', delete_product_func);
        

        expanded_view.append(product_photos, product_details, bottom_row, delete_product);

        product_container.append(showing_row, expanded_view);

        inventory_objects.append(product_container);
    }

    // creation of new product vvv
    let product_container = document.createElement('div');
    product_container.className = 'product_container new_product';

    let new_product_description = document.createElement('input');
    new_product_description.className = 'new_product_description edit_product_input hide_new_form';
    new_product_description.placeholder = 'Product Description';

    // photos list here.
    let product_photos = document.createElement('div');
    product_photos.className = 'new_product_photos hide_new_form';
    
    let add_photos_text = document.createElement('div');
    add_photos_text.className = 'add_photos_text';
    add_photos_text.innerText = 'Add Photos after Saving';
    product_photos.appendChild(add_photos_text);

    let new_product_details = document.createElement('textarea');
    new_product_details.className = 'new_product_details edit_product_input hide_new_form';
    new_product_details.placeholder = 'Product Details';

    let bottom_row = document.createElement('div');
    bottom_row.className = 'bottom_row hide_new_form';

    let new_product_price = document.createElement('div');
    new_product_price.className = 'new_product_price';
    let product_price_sign = document.createElement('div');
    product_price_sign.innerText = '$';
    let new_product_price_value = document.createElement('input');
    new_product_price_value.className = 'new_product_price_value edit_product_input';
    new_product_price_value.type = 'number';
    new_product_price_value.value = 0;
    new_product_price.append(product_price_sign, new_product_price_value);
    
    let new_product_status = document.createElement('select');
    new_product_status.className = 'new_product_status edit_product_input';

    let available_option = document.createElement('option');
    available_option.className = 'edit_status_option';
    available_option.innerText = 'Available';
    available_option.value = 0;
    let pending_option = document.createElement('option');
    pending_option.className = 'edit_status_option';
    pending_option.innerText = 'Pending';
    pending_option.value = 1;
    let sold_option = document.createElement('option');
    sold_option.className = 'edit_status_option';
    sold_option.innerText = 'Sold';
    sold_option.value = 2;

    new_product_status.value = 0;

    new_product_status.append(available_option, pending_option, sold_option);
    bottom_row.append(new_product_price, new_product_status);

    let product_edit_buttons = document.createElement('div');
    product_edit_buttons.className = 'product_edit_buttons hide_new_form';

    let cancel_product_edits = document.createElement('div');
    cancel_product_edits.className = 'cancel_product_edits';
    cancel_product_edits.innerText = 'Cancel';
    // TODO: fix this. lol
    cancel_product_edits.addEventListener('click', inventory_fetch);

    let save_product_edits = document.createElement('div');
    save_product_edits.className = 'save_product_edits';
    save_product_edits.innerText = 'Save';
    save_product_edits.addEventListener('click', ()=>{
        // json packaged values?
        let edited_product = {
            'description': new_product_description.value,
            'details': new_product_details.value,
            'price': new_product_price_value.value,
            'status': new_product_status.value
        }
        console.log(edited_product);

        let product_json = JSON.stringify(edited_product);

        // ajax submission
        fetch('/new_product', {
                method: 'POST',
                body: product_json,
                headers: {
                    "Content-Type": 'application/json'
                }
                })
            .then((success) => {
                inventory_fetch();
            })
            .catch((fail) => console.log(fail));

        // refresh inventory fetch
        
    });

    product_edit_buttons.append(cancel_product_edits, save_product_edits);


       
    let new_product_plus_icon = document.createElement('div');
    new_product_plus_icon.className = 'plus_icon new_product';
    new_product_plus_icon.addEventListener('click', () => {
        new_product_plus_icon.classList.add('hide_new_form');
        new_product_description.classList.add('show');
        product_photos.classList.add('show');
        new_product_details.classList.add('show');
        bottom_row.classList.add('show');
        product_edit_buttons.classList.add('show');
    });

    product_container.append(new_product_plus_icon, new_product_description, product_photos, new_product_details, bottom_row, product_edit_buttons);

    inventory_objects.append(product_container);



}

// called from input listener. uses plus icon id for product id
function upload_product_photo() {

    console.log(this);
    let form = this.parentElement;
    let plus_icon = form.parentElement;
    let product_photo_icons = plus_icon.nextSibling;
    let confirm_icon = product_photo_icons.firstChild;
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

    this.removeEventListener('click', product_photo_removal);
    
    let remove_icon = this.firstChild.nextSibling;
    let trash_can = remove_icon.firstChild;
    let product_img = this.firstChild;

    remove_icon.classList.add('show');
    product_img.classList.add('removal');

    // remove icon listener..
    remove_icon.addEventListener('click', remove_product_photo_fetch);

    let click_catcher = document.createElement('div');
    click_catcher.id = 'click_catcher';
    document.body.appendChild(click_catcher);

    click_catcher.addEventListener('click', () => {
        remove_icon.classList.remove('show');
        product_img.classList.remove('removal');

        click_catcher.remove();

        this.addEventListener('click', product_photo_removal);

    });
}

// named for event listener removal
function remove_product_photo_fetch() {
    // remove click catcher
    var click_catcher = document.getElementById('click_catcher');
    click_catcher.remove();

    let form_data = new FormData();
            
    form_data.append("product_id", this.firstChild.id);
    form_data.append("photo_filename", this.id);

    fetch('/remove_product_photo', {
        method: 'POST',
        body: form_data
        })
    .then((success) => {
        // TODO: these reloads should just be done locally.
        // maybe another fetch endpoint, so the reload is much cleaner.
        inventory_fetch();
        
    })
    .catch((fail) => console.log(fail));

}

// called on edit_product click
function edit_product_inputs() {

    let showing_row = this.parentElement;
    let product_description = showing_row.firstChild.nextSibling;
    
    let expanded_view = showing_row.nextSibling;
    let product_details = expanded_view.firstChild.nextSibling;
    let bottom_row = product_details.nextSibling;
    let delete_product = bottom_row.nextSibling;
    let product_price = bottom_row.firstChild;
    let product_price_value = product_price.firstChild.nextSibling;
    let product_status = product_price.nextSibling;

    this.remove();
    delete_product.remove();

    let edit_product_description = document.createElement('input');
    edit_product_description.className = 'edit_product_description edit_product_input';
    edit_product_description.value = product_description.innerText;

    showing_row.insertBefore(edit_product_description, product_description);
    product_description.remove();

    let edit_product_details = document.createElement('textarea');
    edit_product_details.className = 'edit_product_details edit_product_input';
    edit_product_details.value = product_details.innerText;

    expanded_view.insertBefore(edit_product_details, product_details);
    product_details.remove();

    let edit_product_price_value = document.createElement('input');
    edit_product_price_value.className = 'edit_product_price_value edit_product_input';
    edit_product_price_value.type = 'number';
    edit_product_price_value.value = parseInt(product_price_value.innerText);
    
    product_price.insertBefore(edit_product_price_value, product_price_value);
    product_price_value.remove();

    // TODO: this will be a select with options?
    let edit_product_status = document.createElement('select');
    edit_product_status.className = 'edit_product_status edit_product_input';

    let available_option = document.createElement('option');
    available_option.className = 'edit_status_option';
    available_option.innerText = 'Available';
    available_option.value = 0;
    let pending_option = document.createElement('option');
    pending_option.className = 'edit_status_option';
    pending_option.innerText = 'Pending';
    pending_option.value = 1;
    let sold_option = document.createElement('option');
    sold_option.className = 'edit_status_option';
    sold_option.innerText = 'Sold';
    sold_option.value = 2;

    edit_product_status.value = product_status.getAttribute('val');

    edit_product_status.append(available_option, pending_option, sold_option);


    bottom_row.insertBefore(edit_product_status, product_status);
    product_status.remove();



    // display a save and cancel option

    let product_edit_buttons = document.createElement('div');
    product_edit_buttons.className = 'product_edit_buttons';

    let cancel_product_edits = document.createElement('div');
    cancel_product_edits.className = 'cancel_product_edits';
    cancel_product_edits.innerText = 'Cancel';
    // TODO: fix this. lol
    cancel_product_edits.addEventListener('click', inventory_fetch);

    let save_product_edits = document.createElement('div');
    save_product_edits.className = 'save_product_edits';
    save_product_edits.innerText = 'Save';
    save_product_edits.addEventListener('click', ()=>{
        // json packaged values?
        let edited_product = {
            'id': showing_row.parentElement.getAttribute('p_id'),
            'description': edit_product_description.value,
            'details': edit_product_details.value,
            'price': edit_product_price_value.value,
            'status': edit_product_status.value
        }
        console.log(edited_product);

        let product_json = JSON.stringify(edited_product);

        // ajax submission
        fetch('/edit_product', {
                method: 'POST',
                body: product_json,
                headers: {
                    "Content-Type": 'application/json'
                }
                })
            .then((success) => {
                inventory_fetch();
            })
            .catch((fail) => console.log(fail));

        // refresh inventory fetch
        
    });


    product_edit_buttons.append(cancel_product_edits, save_product_edits);

    expanded_view.append(product_edit_buttons);

}

function delete_product_func(event) {

    let clicked_elem = event.target;
    let parent_elem = event.target.parentElement;
    // loop up to parent with class = product_container
    let found_container = false;
    while(!found_container) {
        if(parent_elem.classList.contains('product_container')) {
            found_container = true;
            break;
        }
        parent_elem = parent_elem.parentElement;
    }

    let product_id = parent_elem.getAttribute('p_id');

    let json_data = JSON.stringify({'id':product_id});
    
    fetch('/delete_product', {
                method: 'POST',
                body: json_data,
                headers: {
                    "Content-Type": 'application/json'
                }
                })
            .then((success) => {
                inventory_fetch();
            })
            .catch((fail) => console.log(fail));

}
