


var navbar = document.getElementById('navbar');
var navbar_link_holder = document.getElementById('navbar_link_holder');
var screen_width = screen.width;
var navbar_links = document.getElementsByClassName('navbar_link');


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


// fetching a list of photo extensions and passing to element creation
fetch('/carousel_photos', { method: 'POST' })
    .then(response => response.json())
    .then(json => populate_carousel(json))
    .catch( error => console.log('ERROR', error));

// creating img's and assigning sources..
function populate_carousel(photo_names) {
    var carousel_container = document.getElementById('picture_carousel');
    var indicator_container = document.getElementById('carousel_indicator');
    var file_string = 'static/carousel_photos/';

    console.log(carousel_container);

    for( let photo_name of photo_names ) {
        
        var photo_url = file_string + photo_name
        console.log(photo_url);

        var image_container = document.createElement('div');
        image_container.className = 'image_container';

        var new_carousel_img = document.createElement('img');
        new_carousel_img.className = 'ss_picture';
        new_carousel_img.src = photo_url;

        image_container.append(new_carousel_img);
        
        carousel_container.append(image_container);

        // indicator dot
        var new_indicator = document.createElement('div');
        new_indicator.className = 'ss_indicator';
        new_indicator.setAttribute('for', photo_name);

        indicator_container.append(new_indicator);
    }
    
    carousel_movement();
}



function carousel_movement() {
    var carousel_container = document.getElementById('picture_carousel');

    var carousel_cont_center = carousel_container.offsetWidth / 2;

    var zero_center = carousel_container.offsetLeft + 15;
    
    var photo_containers = document.getElementsByClassName('image_container');

    var image_cont_center =  photo_containers[0].offsetWidth / 2;

    var first_center = carousel_cont_center - image_cont_center;

    // calculate translation points..
    var center_points = [];
    let image_count = photo_containers.length;
    let i;
    for(i = 0; i < image_count; i++ ) {
        center_points.push(first_center - (i * photo_containers[0].offsetWidth)); 
        // set initial translate
        photo_containers[i].style.translate = first_center + 'px';  
    }
    console.log(center_points);

    // photo_containers[0].style.translate = center_points[0] +'px';


    var counter = 1;
    var move_on_interval = window.setInterval( function() {
        for( let photo of photo_containers ) {
            photo.style.translate = center_points[counter] + 'px';

        }
        counter = counter + 1;

        if(counter > photo_containers.length) {
            counter = 0;
        }

        

    }, 3000);

}
