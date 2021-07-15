
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
product_card.addEventListener('click', () => {
    // change of class info to make this expand to screen
    // .. show additional elements that are hidden at first?

});

// needs a photo
let product_photo = document.createElement('img');
product_photo.className = 'product_photo';
product_photo.src = 'static/carousel_photos/hat01.jpeg';

let product_descript = document.createElement('div');
product_descript.className = 'product_descript';
product_descript.innerText = 'description';



product_card.append(product_photo, product_descript);

inventory_div.append(product_card);


// we also want to expand this card for more info..
 // or maybe more photos of that product..???

