
// TODO: load a lower quality image first, to cut down on loading time?


// does a listdir of photos folder on server, allow for easy removal/addition of photos?
fetch('/load_inventory', { method: 'POST' })
    .then(response => response.json())
    .then(inventory_products => load_iventory(inventory_products))
    .catch( error => console.log('ERROR', error));



function load_iventory(inventory_products) {
    let product;
    let inventory_div = document.getElementById('inventory_div');

    console.log(inventory_products);

    for( product of inventory_products) {

        let product_card = document.createElement('div');
        product_card.className = 'product_card';
        //product_card.addEventListener('click', open_card); 
        
        let placeholder = document.createElement('div');
        placeholder.className = 'product_card placeholder';

        // event listener on product card has to be removed, in order to add one to the close button
        function open_card() {
            // card should not open until final hd photo has loaded?
            

            // we need to quickly make a placeholder for this card,
            // and send this one into absolute positioning.
            
            let top = this.offsetTop - 20;
            let left = this.offsetLeft - 50;

            if( screen.width < 600 ) {
                left = this.offsetLeft;
            }
            product_card.style.top = top + 'px';
            product_card.style.left = left + 'px';
            
            this.before(placeholder);
            

            // add photos to the product photo div? or img.. 
            product_card.classList.add('selected');

            product_photos_div.classList.add('selected');
            previous_photo_button.classList.add('show');
            next_photo_button.classList.add('show');
            product_descript.classList.add('selected');
            close_selected_product.classList.add('show');
            product_details.classList.add('show');
            product_price.classList.add('show');
            purchase_button.classList.add('show');
            

            setTimeout( () => {
                product_details.style.opacity = '1';
                product_price.style.opacity = '1';
                purchase_button.style.opacity = '1';
                previous_photo_button.style.opacity = '1';
                next_photo_button.style.opacity = '1';

            }, 300);

            product_card.removeEventListener('click', open_card);
            close_selected_product.addEventListener('click', close_card);

        }

        // needs a photo
        let product_photos_div = document.createElement('div');
        product_photos_div.className = 'product_photos_div';

        let product_descript = document.createElement('div');
        product_descript.className = 'product_descript';
        product_descript.innerText = product['description'];

        let previous_photo_button = document.createElement('div');
        previous_photo_button.className = 'previous_photo_button';
        previous_photo_button.addEventListener('click', change_photo);

        let photo_stack = document.createElement('div');
        photo_stack.className = 'photo_stack';
        photo_stack.id = 'photo_stack';
        
        let first_photo = true;
        for( let photo_src of product.photos_list ) {
            let lr_inv_product_photo = document.createElement('img');
            lr_inv_product_photo.className = 'inv_product_photo lr';

            let img_loading_placeholder = document.createElement('div');
            img_loading_placeholder.className = 'img_loading_placeholder shimmer';

            // before adding src, need to setup onload function for each
            lr_inv_product_photo.onload = function() {
                img_loading_placeholder.classList.add('loaded');
                setTimeout(()=>{
                    lr_inv_product_photo.classList.add('loaded');
                    img_loading_placeholder.remove();
                },1000);
                
            };

            lr_inv_product_photo.src = '/static/product_inventory/' + product.id + '/LowRes/' + photo_src;
            // set first looped photo to active on load..
            if(first_photo == true) {
                lr_inv_product_photo.classList.add('active');
                first_photo = false;
            }

            let loader = document.createElement('div');
            loader.className = 'loader show';


            let hr_inv_product_photo = document.createElement('img');
            hr_inv_product_photo.className = 'inv_product_photo hr';

            hr_inv_product_photo.onload = function() {
                // allow card to be opened
                product_card.addEventListener('click', open_card);
                product_card.classList.add('loaded');
                // remove loader
                lr_inv_product_photo.classList.remove('loaded');
                hr_inv_product_photo.classList.add('loaded');
                loader.classList.add('hide');
                if(lr_inv_product_photo.classList.contains('active')){
                    lr_inv_product_photo.classList.remove('active');
                    hr_inv_product_photo.classList.add('active');
                }
                photo_stack.append(hr_inv_product_photo);
                setTimeout(()=>{
                    lr_inv_product_photo.remove();
                    loader.remove();
                },1000);

                
            };

            hr_inv_product_photo.src = '/static/product_inventory/' + product.id + '/HighRes/' + photo_src;
            
            photo_stack.append(img_loading_placeholder, lr_inv_product_photo, loader);
        }

        let next_photo_button = document.createElement('div');
        next_photo_button.className = 'next_photo_button';
        next_photo_button.addEventListener('click', change_photo);

        product_photos_div.append(previous_photo_button, photo_stack, next_photo_button);

        let close_selected_product = document.createElement('div');
        close_selected_product.className = 'close_selected_product';

        function close_card() {

            // close the request form if it is open.
            // simulate click.
            let lower_section = product_details.nextElementSibling;
            let lower_children = lower_section.children;
            let request_div = lower_children[2];
            let request_children = request_div.children;
            let request_buttons = request_children[4];
            let cancel_button = request_buttons.firstChild;
            cancel_button.click();

            // add a closing class before removing the absolute position
            product_card.classList.add('closing');
            
            previous_photo_button.style.opacity = '0';
            next_photo_button.style.opacity = '0';
            product_descript.classList.remove('selected');
            close_selected_product.classList.remove('show');
            product_details.style.opacity = '0';
            product_price.style.opacity = '0';
            purchase_button.style.opacity = '0';
            
            product_photos_div.classList.remove('selected');
            product_details.classList.remove('show');
            previous_photo_button.classList.remove('show');
            next_photo_button.classList.remove('show');

            setTimeout( () => {
                
                purchase_button.classList.remove('show');
                product_price.classList.remove('show');
                

            }, 300);

            setTimeout( () => {
                product_card.classList.remove('selected');
                placeholder.remove();
                product_card.classList.remove('closing');
            }, 1000);

            product_card.removeEventListener('click', close_card);
            setTimeout( () => product_card.addEventListener('click', open_card) , 100);
        }

        let product_details = document.createElement('div');
        product_details.className = 'product_details';
        product_details.innerText = product['details'];

        let lower_section = document.createElement('div');
        lower_section.className = 'lower_section';

        let product_price = document.createElement('div');
        product_price.className = 'product_price';
        product_price.innerText = '$' + product['price'];

        let purchase_button = document.createElement('div');
        purchase_button.className = 'purchase_button';
        if(product['status'] == '0') {
            purchase_button.innerText = 'Request';
            purchase_button.classList.add('avail');
            product_card.classList.add('avail');
        } else if( product['status'] == '1') {
            purchase_button.innerText = 'Pending';
            purchase_button.classList.add('pend');
            product_card.classList.add('pend');
        } else {
            purchase_button.innerText = 'Sold';
            purchase_button.classList.add('sold');
            product_card.classList.add('sold');
        }
        purchase_button.setAttribute('var', product['id']);
        purchase_button.addEventListener('click', requestItemForm);
        

        lower_section.append(product_price, purchase_button);
        
        // TODO: also, sort the product the status. unavailable product should come last...
        
        product_card.append(close_selected_product, product_descript, product_photos_div, product_details, lower_section);

        let request_div = document.createElement('div');
        request_div.className = 'request_div';

        let request_title = document.createElement('div');
        request_title.className = 'request_title';
        request_title.innerText = 'How can we contact you?'

        let request_examples = document.createElement('div');
        request_examples.className = 'request_examples';
        request_examples.innerText = 'Text , Email , Instagram, Facebook, etc';

        let request_contact_input = document.createElement('textarea');
        request_contact_input.className = 'request_contact_input';
        request_contact_input.placeholder = 'Include an address for a shipping quote!'

        let request_descript = document.createElement('div');
        request_descript.className = 'request_descript';
        request_descript.innerHTML = 'This hat and your contact info will go straight to us! <br> We will reach out soon!'

        let request_buttons = document.createElement('div');
        request_buttons.className = 'request_buttons';

        let cancel_request = document.createElement('div');
        cancel_request.className = 'cancel_request button';
        cancel_request.innerText = 'Cancel';
        cancel_request.addEventListener('click', closeRequestForm);

        let send_request = document.createElement('div');
        send_request.className = 'send_request button';
        send_request.innerText = 'Send';
        send_request.setAttribute('var', product['id']);
        send_request.addEventListener('click', sendInventoryRequest);

        request_buttons.append(cancel_request, send_request);

        request_div.append(request_title, request_examples, request_contact_input, request_descript, request_buttons);
        lower_section.append(request_div);

        inventory_div.append(product_card);

    }

}

// we also want to expand this card for more info..
// or maybe more photos of that product..???
function toggle_selected_card(card_element) {
    
    card_element.classList.remove('selected');

    let close_selected_product = document.getElementsByClassName('close_selected_product');
    close_selected_product[0].classList.remove('show');

    let purchase_button = document.getElementsByClassName('purchase_button');
    purchase_button[0].classList.remove('show');

    let product_details = document.getElementsByClassName('product_details');
    product_details[0].classList.remove('show');

}


// move showing class forward or backward
function change_photo(event) {
    
    let arrow = event.srcElement;
    let product_photo_div = arrow.parentElement;
    let children_arr = product_photo_div.children;

    let photo_stack = children_arr[1];

    let direction;
    if(event.target.classList.contains('previous_photo_button')) {
        direction = -1;
    } else {
        direction = 1;
    }
    let photos_list = photo_stack.children;

    for( let photo of photos_list ) {
        // find the current active photo.., get next/prev based on that.
        if( photo.classList.contains('active')) {
            
            let next_photo = photo.nextSibling;
            if( next_photo == null) {
                next_photo = photos_list.item(0);
            }
            
            let prev_photo = photo.previousSibling;
            if( prev_photo == null) {
                prev_photo = photos_list.item(photos_list.length - 1);
    
            }
            
            setTimeout(()=>{
                if( direction == 1 ) {
                next_photo.classList.add('active');
                } else {
                    prev_photo.classList.add('active');
                }
            },200);
            
            photo.classList.remove('active');

            break;
        }
    }

}

// pull the items info and display a form to fill out
function requestItemForm() {

    // check the request button for classes that coincide with status
    let request_button = this;
    let lower_section = request_button.parentElement;
    let lower_children = lower_section.children;
    let request_div = lower_children[2];
    let request_div_children = request_div.children;

    // product details
    let product_details = lower_section.previousSibling;
    let photos_div = product_details.previousSibling;
    let target_y = product_details.offsetTop;

    if( request_button.classList.contains('pend')) {
        request_div.classList.add('pend');
        request_div_children[2].classList.add('pend');
        let request_title = request_div_children[0];
        request_title.innerText = 'We can make more!';
        let request_descript = request_div_children[3];
        request_descript.innerHTML = 'Drop your contact info above and we will contact you about making a hat similar to this one!';
        let request_address = request_div_children[5];
        

    } else if (request_button.classList.contains('sold')) {
        request_div.classList.add('sold');
        request_div_children[2].classList.add('sold');
        let request_title = request_div_children[0];
        request_title.innerText = 'We can make more!';
        let request_descript = request_div_children[3];
        request_descript.innerHTML = 'Drop your contact info above and we will contact you about making a hat similar to this one!';
    }

    request_div.classList.add('show');
    setTimeout(()=>{
        for( let element of request_div_children ) {
            element.classList.add('show');   
        }
    },800);

    // TODO: make this show/hide work with opacity fading.

    let request_start_point = request_div.offsetTop;
    let calculated_height = request_start_point - target_y;

    request_div.style.height = calculated_height + 'px';

    
}

// hides the request form popup. also will run in async from close card function
function closeRequestForm() {

    let cancel_button = this;
    let button_div = cancel_button.parentElement;
    let descript = button_div.previousElementSibling;
    let textarea_input = descript.previousElementSibling;
    let request_div = button_div.parentElement;
    let div_children = request_div.children;

    if( button_div.classList.contains('show')) {

        for( let element of div_children) {
            element.classList.remove('show');
        }

        request_div.style.height = '0px';
        
        if( textarea_input.classList.contains('required')) {
            textarea_input.classList.remove('required');
        }

    }

}

// grab product id/info and send to server side for db changes and emailing owner
function sendInventoryRequest() {

    console.log(this);
    let send_button = this;
    let button_div = send_button.parentElement;
    let request_div = button_div.parentElement;
    let request_children = request_div.children;
    let contact_input = request_children[2];

    let contact_info = contact_input.value;

    // check for empty input
    if( contact_info == '') {
        contact_input.classList.add('required');
    } else {
        // TODO: make this sending class look better on mobile
        send_button.classList.add('sending');

        // TODO: check the request_div for a pend/sold class
        // modify the object to send based on this, to keep track of this

        let status = 0;
        // get pend/sold status if applicable
        if( request_div.classList.contains('pend')) {
            status = 1;
        } else if( request_div.classList.contains('sold')) {
            status = 2;
        }

        // get product id, and contact info, send to server
        let product_id = send_button.getAttribute('var');

        let today = new Date();
        let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        let dateTime = date+' '+time;

        let object_to_send = {
            'id': product_id,
            'contact_info': contact_info,
            'date_created': dateTime,
            'status': status
        };

        let json_object = JSON.stringify(object_to_send);

        // ajax submission
        fetch('/inventoryProductRequest', {
                method: 'POST',
                body: json_object,
                headers: {
                    "Content-Type": 'application/json'
                }
                })
            .then((success) => {
                console.log(success)
                // redirect to thank you page.
                setTimeout(()=>window.location.replace('/thank_you'), 2000);

            })
            .catch((fail) => {
                // TODO: display an error page or message
                console.log(fail)
            });

    }

}