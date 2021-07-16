
// does a listdir of photos folder on server, allow for easy removal/addition of photos?
fetch('/inventory_items', { method: 'POST' })
    .then(response => response.json())
    .then(json_of_file_names => console.log(json_of_file_names))
    .catch( error => console.log('ERROR', error));



    // products may contain more than one photo
// probably have a product class that we can have prototype methods on
class Product {

    constructor(something) {
        this.something = something;

    }


    // method to create html and place into grid.


}


// mockup of a product can be done outside of class instance.

let inventory_div = document.getElementById('inventory_div');

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
    selected_product_description.classList.add('show');
    purchase_button.classList.add('show');

    setTimeout( () => {
        selected_product_description.style.opacity = '1';
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

let previous_photo_button = document.createElement('div');
previous_photo_button.className = 'previous_photo_button';

let new_photo = document.createElement('img');
new_photo.className = 'product_photo';
new_photo.src = 'static/carousel_photos/hat01.jpeg';

let next_photo_button = document.createElement('div');
next_photo_button.className = 'next_photo_button';

product_photos_div.append(previous_photo_button, new_photo, next_photo_button);

let product_descript = document.createElement('div');
product_descript.className = 'product_descript';
product_descript.innerText = 'description';

let close_selected_product = document.createElement('div');
close_selected_product.className = 'close_selected_product';

function close_card() {

    
    previous_photo_button.style.opacity = '0';
    next_photo_button.style.opacity = '0';
    product_descript.classList.remove('selected');
    close_selected_product.classList.remove('show');
    selected_product_description.style.opacity = '0';
    purchase_button.style.opacity = '0';
    product_card.classList.remove('selected');
    product_photos_div.classList.remove('selected');
    

    setTimeout( () => {
        selected_product_description.classList.remove('show');
        purchase_button.classList.remove('show');
        previous_photo_button.classList.remove('show');
        next_photo_button.classList.remove('show');

    }, 300);

    product_card.removeEventListener('click', close_card);
    setTimeout( () => product_card.addEventListener('click', open_card) , 100);
}

let selected_product_description = document.createElement('div');
selected_product_description.className = 'selected_product_description';
selected_product_description.innerText = 'More product info here...';

let purchase_button = document.createElement('div');
purchase_button.className = 'purchase_button';
purchase_button.innerText = 'Purchase';




product_card.append(close_selected_product, product_photos_div, product_descript, selected_product_description, purchase_button);

inventory_div.append(product_card);


// we also want to expand this card for more info..
 // or maybe more photos of that product..???
function toggle_selected_card(card_element) {
    
    card_element.classList.remove('selected');

    let close_selected_product = document.getElementsByClassName('close_selected_product');
    close_selected_product[0].classList.remove('show');

    let purchase_button = document.getElementsByClassName('purchase_button');
    purchase_button[0].classList.remove('show');

    let selected_product_description = document.getElementsByClassName('selected_product_description');
    selected_product_description[0].classList.remove('show');

}