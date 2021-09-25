
var images_are_loaded_global = false;
var global_play_button = document.getElementById('playing_button');
var global_pause_button = document.getElementById('paused_button');
var global_auto_interval;

// does a listdir of photos folder on server, gets the filenames essentially
fetch('/carousel_photos', { method: 'POST' })
    .then(response => response.json())
    .then(json_files_object => populate_carousel(json_files_object))
    .catch( error => console.log('ERROR', error));


// creating images and indicators, calls animation function on completion
function populate_carousel(json_files_object) {

    let index_tracking = {
        pictures: [],
        indicators: []
    }

    let carousel_container = document.getElementById('picture_carousel');
    
    let indicator_container = document.getElementById('carousel_indicator');
    let file_string = 'static/carousel_photos/';

    let image_loaded_counter = 0;

    for (const [id, file_name] of Object.entries(json_files_object)) {

        let file_path = file_string + file_name + '?id=' + id;


        let image_container = document.createElement('div');
        image_container.className = 'image_container';

        let img_loading_placeholder = document.createElement('div');
        img_loading_placeholder.className = 'img_loading_placeholder shimmer';
        img_loading_placeholder.style.height = (carousel_container.scrollWidth * 0.75) + 'px';

        let new_carousel_img = document.createElement('img');
        new_carousel_img.className = 'ss_picture';


        // before adding source, need to setup the onload function
        new_carousel_img.onload = function() {
            img_loading_placeholder.classList.add('loaded');
            setTimeout(()=>{
                new_carousel_img.classList.add('loaded');
                img_loading_placeholder.remove();
            },1000);

            image_loaded_counter += 1;
            // when this gets to key.length, update the global that the animation is waiting for
            if(image_loaded_counter == Object.keys(json_files_object).length) {
                images_are_loaded_global = true;
                console.log('all images have been loaded');
                
            }
        };

        new_carousel_img.src = file_path;

        image_container.append(img_loading_placeholder, new_carousel_img);
        
        carousel_container.append(image_container);

        // indicator dot
        let new_indicator = document.createElement('div');
        new_indicator.className = 'ss_indicator';
        new_indicator.setAttribute('for', file_name);

        index_tracking.pictures.push(image_container);
        index_tracking.indicators.push(new_indicator);

        indicator_container.append(new_indicator);
    }

    // this makes the container a rect? , which matches the photos, and allows for centering easily
    carousel_container.style.height = (carousel_container.scrollWidth * 0.75) + 'px';

    carousel_animation(index_tracking);
    
}

// TODO: don't start the carousel animation until the images have loaded...

// controls animation. starts in auto, changes to manual after first click event
function carousel_animation(carousel_object) {
    
    let interval_time = 8000;
    // tracks whether out of auto or not yet
    let auto_bool = true;
    let slide_show_container = document.getElementById('slide_show_container');
    let container_middle = slide_show_container.scrollWidth/2;
    let array_size = carousel_object.pictures.length;
    // initialize at zero
    update_animation(carousel_object, 0);

    // start tracking int at one
    let active_index = 1;

    // this starts the auto scroll, or sets a reoccuring check to see if the images are loaded
    if(images_are_loaded_global) {
        global_auto_interval = window.setInterval(auto_scroll_next, interval_time);
        switch_active_button();
        button_listeners();
        click_moving();
        swipe_moving();
    } else {
        let images_waiting = window.setInterval(function() {
            if(check_global()) {
                clearInterval(images_waiting);
                global_auto_interval = window.setInterval(auto_scroll_next, interval_time);
                switch_active_button();
                button_listeners();
                click_moving();
                swipe_moving();
            }
        }, 1000);
    }

    function auto_scroll_next() {

        update_animation(carousel_object, active_index);

        if( active_index == carousel_object.pictures.length - 1) {
            active_index = 0;

        } else {
            active_index++;

        }
    }

    function click_moving() {
        if(screen.width > 1000) {
            let desktop_click_move = slide_show_container.addEventListener('click', (event) => {
            
                // bool used so this clearInterval is only done once
                if(auto_bool == true) {
                    clearInterval(global_auto_interval); 
                    switch_active_button();
                    auto_bool = false;
                    // on initial setinto manual, index has already been incremented for next auto loop
                    active_index -= 1;
                }

                if(event.clientX < (container_middle)) {
                    // left side
                    active_index -= 1;
                    active_index = limit(active_index, array_size);
                    update_animation(carousel_object, active_index);

                } else {
                    // right side
                    active_index += 1;
                    active_index = limit(active_index, array_size);
                    update_animation(carousel_object, active_index);
                }

            });
        }
    }

    // TODO: write this function of listeners
    function swipe_moving() {

    }

    // button listeners to start and stop the window interval
    function button_listeners() {
        global_pause_button.addEventListener('click', function(event) {
            event.stopPropagation();
            if(this.classList.contains('active')) {
                return;
            }
            // basically just remove the window interval
            clearInterval(global_auto_interval); 
            switch_active_button();

        });
        global_play_button.addEventListener('click', function(event) {
            event.stopPropagation();
            console.log(this);
            if(this.classList.contains('active')) {
                return;
            }
            global_auto_interval = window.setInterval(auto_scroll_next, 4000);
            switch_active_button();

        });

    }

}

// checking to see if the images have loaded and returning
function check_global() {
    if(images_are_loaded_global == true) {
        return true;
    } else {
        return false;
    }
}

// convert out of bounds number to within range 0 - length
function limit(value, length) {
    if( value > length - 1 ) {
        value = value - length;
    }
    if( value < 0 ) {
        value = length + value;
    }
    return value;
}

// loops all photos and sets appropriate css classes based on index passed in.
function update_animation(carousel_object, active_index) {
    let length = carousel_object.pictures.length;

    let classes = {
        previous2: active_index - 2,
        previous: active_index - 1,
        active: active_index,
        next: active_index + 1,
        queue: active_index + 2
    }
    
    let index = 0;
    for( index = 0; index < carousel_object.pictures.length; index++ ) {
        
        if(index == classes.active) {
            carousel_object.pictures[index].className = 'image_container active';
            carousel_object.indicators[index].className = 'ss_indicator filled';
        } else if( index == limit(classes.previous2, length) ) {
            // previous2
            carousel_object.pictures[index].className = 'image_container prev2';
            carousel_object.indicators[index].className = 'ss_indicator';

        }else if( index == limit(classes.previous, length) ) {
            // previous
            carousel_object.pictures[index].className = 'image_container prev';
            carousel_object.indicators[index].className = 'ss_indicator';

        } else if (index == limit(classes.next, length) ) {
            // next
            carousel_object.pictures[index].className = 'image_container next';
            carousel_object.indicators[index].className = 'ss_indicator';

        } else if (index == limit(classes.queue, length) ) {
            //next2
            carousel_object.pictures[index].className = 'image_container next2';
            carousel_object.indicators[index].className = 'ss_indicator';

        } else {
            // all others
            carousel_object.pictures[index].className = 'image_container';
            if(carousel_object.indicators[index].classList.contains('filled')) {
                carousel_object.indicators[index].classList.remove('filled');
            }
        }

    }


}

function switch_active_button() {
    global_pause_button.classList.toggle('active');
    global_play_button.classList.toggle('active');
}