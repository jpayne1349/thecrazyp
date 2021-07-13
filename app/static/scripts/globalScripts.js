


const navbar = document.getElementById('navbar');
const navbar_link_holder = document.getElementById('navbar_link_holder');
const screen_width = screen.width;
const navbar_links = document.getElementsByClassName('navbar_link');


// responsive navbar, run right away
if( screen.width < 600 ) {
    
    navbar_link_holder.addEventListener('click', () => {
        for( let link of navbar_links ) {
            if(link.classList.contains('show')) {
                link.classList.remove('show');
            } else {
                link.classList.add('show');
            }
        }
    });
    
}


// does a listdir of photos folder on server, allow for easy removal/addition of photos?
fetch('/carousel_photos', { method: 'POST' })
    .then(response => response.json())
    .then(json_of_file_names => populate_carousel(json_of_file_names))
    .catch( error => console.log('ERROR', error));


// creating images and indicators, calls animation function on completion
function populate_carousel(list_of_photo_file_names) {

    let index_tracking = {
        pictures: [],
        indicators: []
    }

    let carousel_container = document.getElementById('picture_carousel');
    
    let indicator_container = document.getElementById('carousel_indicator');
    let file_string = 'static/carousel_photos/';

    for( let file_name of list_of_photo_file_names ) {
        
        let file_path = file_string + file_name


        let image_container = document.createElement('div');
        image_container.className = 'image_container';

        let new_carousel_img = document.createElement('img');
        new_carousel_img.className = 'ss_picture';
        new_carousel_img.src = file_path;

        image_container.append(new_carousel_img);
        
        carousel_container.append(image_container);

        // indicator dot
        let new_indicator = document.createElement('div');
        new_indicator.className = 'ss_indicator';
        new_indicator.setAttribute('for', file_name);

        index_tracking.pictures.push(image_container);
        index_tracking.indicators.push(new_indicator);

        indicator_container.append(new_indicator);
    }

    // this makes the container a square, which matches the photos, and allows for centering easily
    carousel_container.style.height = carousel_container.scrollWidth + 'px';
    
    carousel_animation(index_tracking);

}

function carousel_animation(carousel_object) {
    // set up the interval for changing the classes..

}
