

// does a listdir of photos folder on server, allow for easy removal/addition of photos?
fetch('/load_inventory', { method: 'POST' })
    .then(response => response.json())
    .then(inventory_products => load_iventory(inventory_products))
    .catch( error => console.log('ERROR', error));



function load_iventory(inventory_products) {
    let product;
    let inventory_div = document.getElementById('inventory_div');
    
    for( product of inventory_products) {

        let product_card = document.createElement('div');
        product_card.className = 'product_card';
        product_card.addEventListener('click', open_card);

        // event listener on product card has to be removed, in order to add one to the close button
        function open_card() {

            // add photos to the product photo div? or img.. 
            product_card.classList.add('selected');

            product_photos_div.classList.add('selected');
            previous_photo_button.classList.add('show');
            next_photo_button.classList.add('show');
            product_descript.classList.add('selected');
            close_selected_product.classList.add('show');
            product_details.classList.add('show');
            purchase_button.classList.add('show');

            setTimeout( () => {
                product_details.style.opacity = '1';
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
        product_descript.innerText = 'description';

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
            // TODO: might need version number on this as well
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

            
            previous_photo_button.style.opacity = '0';
            next_photo_button.style.opacity = '0';
            product_descript.classList.remove('selected');
            close_selected_product.classList.remove('show');
            product_details.style.opacity = '0';
            purchase_button.style.opacity = '0';
            product_card.classList.remove('selected');
            product_photos_div.classList.remove('selected');
            product_details.classList.remove('show');

            setTimeout( () => {
                
                purchase_button.classList.remove('show');
                previous_photo_button.classList.remove('show');
                next_photo_button.classList.remove('show');

            }, 300);

            product_card.removeEventListener('click', close_card);
            setTimeout( () => product_card.addEventListener('click', open_card) , 100);
        }

        let product_details = document.createElement('div');
        product_details.className = 'product_details';
        product_details.innerText = 'More product info here...';

        let purchase_button = document.createElement('div');
        purchase_button.className = 'purchase_button';
        purchase_button.innerText = 'Request';




        product_card.append(close_selected_product, product_descript, product_photos_div, product_details, purchase_button);

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
    let photo_stack = document.getElementById('photo_stack');
    let direction;
    if(event.target.classList.contains('previous_photo_button')) {
        direction = -1;
    } else {
        direction = 1;
    }
    let photos_list = photo_stack.children;

    console.log( 'move direction', direction);
    for( let photo of photos_list ) {
        if( photo.classList.contains('active')) {
            // photo.classList.remove('active');
            let next_photo = photo.nextSibling;
            if( next_photo == null) {
                next_photo = photos_list.item(0);
            }
            console.log('next', next_photo);
            let prev_photo = photo.previousSibling;
            if( prev_photo == null) {
                console.log(photos_list.length);
                prev_photo = photos_list.item(photos_list.length - 1);
                console.log('null, changed to', prev_photo);
            }
            console.log('prev', prev_photo);

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