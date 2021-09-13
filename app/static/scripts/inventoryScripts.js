

// TODO: maybe make the request form slide up from the bottom of the green border?
// would look cool.

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
        product_card.addEventListener('click', open_card); 
        
        let placeholder = document.createElement('div');
        placeholder.className = 'product_card placeholder';

        // event listener on product card has to be removed, in order to add one to the close button
        function open_card() {

            // we need to quickly make a placeholder for this card,
            // and send this one into absolute positioning.
            
            let top = this.offsetTop - 20;
            let left = this.offsetLeft - 48;

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
            let inv_product_photo = document.createElement('img');
            inv_product_photo.className = 'inv_product_photo';
    
            inv_product_photo.src = '/static/product_inventory/' + product.id + '/' + photo_src;
            // set first looped photo to active on load..
            if(first_photo == true) {
                inv_product_photo.classList.add('active');
                first_photo = false;
            }

            photo_stack.appendChild(inv_product_photo);
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

            setTimeout( () => {
                
                purchase_button.classList.remove('show');
                product_price.classList.remove('show');
                previous_photo_button.classList.remove('show');
                next_photo_button.classList.remove('show');
                

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
            purchase_button.setAttribute('var', product['id']);
            purchase_button.addEventListener('click', requestItemForm);
        } else if( product['status'] == '1') {
            purchase_button.innerText = 'Pending';
            purchase_button.classList.add('pend');
            product_card.classList.add('pend');
        } else {
            purchase_button.innerText = 'Sold';
            purchase_button.classList.add('sold');
            product_card.classList.add('sold');
        }
        

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

    let request_button = this;
    let lower_section = request_button.parentElement;
    let lower_children = lower_section.children;
    let request_div = lower_children[2];
    let request_div_children = request_div.children;

    // product details
    let product_details = lower_section.previousSibling;
    let target_y = product_details.offsetTop;
    console.log(target_y);
    
    request_div.classList.add('show');
    setTimeout(()=>{
        for( let element of request_div_children ) {
            element.classList.add('show');   
        }
    },800);

    // TODO: make this show/hide work with opacity fading.

    let request_start_point = request_div.offsetTop;
    let calculated_height = request_start_point - target_y;
    console.log(request_start_point);
    console.log(calculated_height);

    request_div.style.height = calculated_height + 'px';

    
}

// hides the request form popup. also will run in async from close card function
function closeRequestForm() {

    let cancel_button = this;
    let button_div = cancel_button.parentElement;
    let request_div = button_div.parentElement;
    let div_children = request_div.children;

    if( button_div.classList.contains('show')) {

        for( let element of div_children) {
            element.classList.remove('show');
        }

        request_div.style.height = '0px';

    }

}

// grab product id/info and send to server side for db changes and emailing owner
function sendInventoryRequest() {

    console.log(this);
}