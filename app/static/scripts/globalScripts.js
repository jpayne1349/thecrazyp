


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
    let interval_time = 5000;

    // initialize at zero
    update_animation(carousel_object, 0);

    // testing this, dumb way to change a css class
    for(let style_object of document.styleSheets[0].cssRules) {
        if(style_object.selectorText == '.prev') {
            setTimeout( () => {
                style_object.style.cssText = "transform: translate(-85vw); opacity: 0.5; transition: transform 1s ease-in, opacity 1s;";
            }, 1000);
        }
    }

    // for tracking 
    let active_index = 1;

    console.log(carousel_object);

    window.setInterval(() => {
        console.log(active_index);

        update_animation(carousel_object, active_index);

        active_index += 1;
        if ( active_index == carousel_object.pictures.length ) active_index = 0;

    }, interval_time);


}

function update_animation(carousel_object, active_index) {

    // loop through the object to set classes on everything
    let index = 0;
    for( index = 0; index < carousel_object.pictures.length; index++ ) {
        if(index == active_index) {
            carousel_object.pictures[index].className = 'image_container active';
            carousel_object.indicators[index].className = 'ss_indicator filled';
        } else if( index == active_index - 1 ) {
            // previous
            carousel_object.pictures[index].className = 'image_container prev';
            if(carousel_object.indicators[index].classList.contains('filled')) {
                carousel_object.indicators[index].classList.remove('filled');
            }
        } else if (index == active_index + 1 ) {
            // next
            carousel_object.pictures[index].className = 'image_container next';
        } else {
            // all others
            carousel_object.pictures[index].className = 'image_container';
            if(carousel_object.indicators[index].classList.contains('filled')) {
                carousel_object.indicators[index].classList.remove('filled');
            }
        }

        // additional settings for beginning and end
        if( active_index == 0 ) {
            carousel_object.pictures[carousel_object.pictures.length - 1].classList.add('prev');

        }

        if( active_index == carousel_object.pictures.length - 1) {
            carousel_object.pictures[0].classList.add('next');
        }

    }


}

