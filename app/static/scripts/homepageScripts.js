
var images_are_loaded_global = false;
var global_play_button = document.getElementById('playing_button');
var global_pause_button = document.getElementById('paused_button');
var global_auto_interval;

// does a listdir of photos folder on server, gets the filenames essentially
fetch('/carousel_photos', { method: 'POST' })
    .then(handle_error)
    .then(response => response.json())
    .then(json_files_object => populate_carousel(json_files_object))
    .catch( error => console.log(error));


// creating images and indicators, calls animation function on completion
function populate_carousel(json_files_object) {

    console.log(json_files_object);

    let index_tracking = {
        pictures: [],
        indicators: []
    }

    let carousel_container = document.getElementById('picture_carousel');
    
    let indicator_container = document.getElementById('carousel_indicator');
    
    let lr_file_string = 'static/carousel_photos/LowRes/';
    let hr_file_string = 'static/carousel_photos/HighRes/';

    let image_loaded_counter = 0;

    // this loop makes each individual carousel photo element
    for (const [id, file_name] of Object.entries(json_files_object)) {

        let lr_file_path = lr_file_string + file_name + '?id=' + id;
        let hr_file_path = hr_file_string + file_name + '?id=' + id;

        let image_container = document.createElement('div');
        image_container.className = 'image_container';

        let img_loading_placeholder = document.createElement('div');
        img_loading_placeholder.className = 'img_loading_placeholder shimmer';
        img_loading_placeholder.style.height = (carousel_container.scrollWidth * 0.75) + 'px';

        let lr_carousel_img = document.createElement('img');
        lr_carousel_img.className = 'ss_picture lr';

        // before adding source, need to setup the onload function
        lr_carousel_img.onload = function() {
            img_loading_placeholder.classList.add('loaded');
            setTimeout(()=>{
                lr_carousel_img.classList.add('loaded');
                img_loading_placeholder.remove();
            },1000);

            image_loaded_counter += 1;
            // when this gets to key.length, update the global that the animation is waiting for
            if(image_loaded_counter == Object.keys(json_files_object).length) {
                images_are_loaded_global = true;
                console.log('all images have been loaded');
                
            }
        };

        lr_carousel_img.src = lr_file_path;

        let hr_loader = document.createElement('div');
        hr_loader.className = 'hr_loader';

        // TODO: load the HighRes copy and get it in the background
        let hr_carousel_img = document.createElement('img');
        hr_carousel_img.className = 'ss_picture hr';
        hr_carousel_img.onload = function() {
            hr_loader.classList.add('hide');
            // TODO: need a HD loader thingy
            // and a seamless transition of the hr_img ontop before deletion of lr
            image_container.append(hr_carousel_img);
            hr_carousel_img.classList.add('loaded');
            setTimeout(()=>{
                lr_carousel_img.remove();
                hr_loader.remove();
            },1000);
        }

        hr_carousel_img.src = hr_file_path;
                
        image_container.append(img_loading_placeholder, lr_carousel_img, hr_loader);
        
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


// controls animation. starts in auto, changes to manual after first click event
function carousel_animation(carousel_object) {
    
    let interval_time = 4000;
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
                    pause_button_active();
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

    
    function swipe_moving() {
        if(screen.width < 1000) {
            let first_swipe_bool = true;

            slide_show_container.addEventListener('touchstart', handleTouchStart, false);        
            slide_show_container.addEventListener('touchmove', handleTouchMove, false);

            var xDown = null;                                                        
            var yDown = null;

            function getTouches(evt) {
                return evt.touches // browser API
            }                                                     
                                                                                    
            function handleTouchStart(evt) {
                clearInterval(global_auto_interval); 
                pause_button_active();

                const firstTouch = getTouches(evt)[0];                                      
                xDown = firstTouch.clientX;                                      
                yDown = firstTouch.clientY;                   
            };                                                
                                                                                    
            function handleTouchMove(evt) {
                if ( ! xDown || ! yDown ) {
                    return;
                }

                var xUp = evt.touches[0].clientX;                                    
                var yUp = evt.touches[0].clientY;

                var xDiff = xDown - xUp;
                var yDiff = yDown - yUp;
                                                    
                if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
                    if ( xDiff > 0 ) {
                        /* right swipe */ 
                        // console.log('right swipe');
                        console.log('original index', active_index);
                        if(first_swipe_bool == true) {
                            active_index -= 1;
                            first_swipe_bool = false;
                        };
                        active_index += 1;
                        active_index = limit(active_index, array_size);
                        update_animation(carousel_object, active_index);
                    } else {
                        /* left swipe */
                        // console.log('left swipe');
                        if(first_swipe_bool == true) {
                            active_index -= 1;
                            first_swipe_bool = false;
                        };
                        active_index -= 1;
                        active_index = limit(active_index, array_size);
                        update_animation(carousel_object, active_index);
                    }                       
                } else {
                    if ( yDiff > 0 ) {
                        /* down swipe */ 
                        
                    } else { 
                        /* up swipe */
                        
                    }                                                                 
                }
                /* reset values */
                xDown = null;
                yDown = null;                                             
            };
        }
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

function pause_button_active() {
    if(global_play_button.classList.contains('active')) {
        global_pause_button.classList.add('active');
        global_play_button.classList.remove('active');
    }
}


// generic function to be used in all script files
function handle_error(response) {

    if(!response.ok) {

        // try to process the response text before sending to server
        response.text().then((text) => {
            
            let error_string = 'Url: ' + response.url + '\n Status Code: ' + response.status + '\n Response Text: ' + text;
            
            let json_data = {
                'error': error_string
            };
            
            json_data = JSON.stringify(json_data)
    
            fetch('/handle_error', {
                method: 'POST',
                body: json_data,
                headers: {
                    "Content-Type": 'application/json'
                }
                })
            .then(handle_error)
            .then((success) => {
                // redirect to error template
                window.location.replace("/error");
            })
            .catch((fail) => console.log(fail));

        });
    }

    return response;
}