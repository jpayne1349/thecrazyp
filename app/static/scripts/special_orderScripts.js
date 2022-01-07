
// form object to be updated and accessed by functions
// needs to be dynamic based on page content or from fetch info
var formObject = {

}

main();

function main() {
    show_first_selection();

}

async function show_first_selection() {

    const first_selection = await init_label_holders();
    const regular_options = await init_regular_options();
    const other_options = await init_other_options();
    const contact_options = await init_contact_options();
    const submit_setup = await reviewButtonListener();
    const notes_listener = await init_notes_input();
    const review_form_setup = await populate_form_object();
    //const desktop_view = await scrollInDesktopView();
    first_selection.click();

}

// form is dynamically populated with categories, must populate form object dynamically
function populate_form_object() {

    // we can try to get this information from the html, as it is loaded dynamically as well
    let selection_divs = document.getElementsByClassName('selection');

    for( let category of selection_divs ) {
        let category_name = category.getAttribute('sel_type');

        // add this as an empty key in the formObject
        formObject[category_name] = '';

    }

}

function init_label_holders() {

    let label_holders = document.getElementsByClassName('label_holder');
    let index_counter = 0;
    for(let i = 0; i<label_holders.length; i++ ) {
        let wrapper = label_holders[i].parentElement;
        let top_of_wrapper = wrapper.offsetTop;
        wrapper.style.zIndex = (label_holders.length * 3 ) - index_counter;
        index_counter++;
        label_holders[i].style.zIndex = (label_holders.length * 3 ) - index_counter;
        index_counter++;
        let selection_below = label_holders[i].nextElementSibling;
        selection_below.style.zIndex = (label_holders.length * 3) - index_counter;
        index_counter++;
        selection_below.classList.add('loaded');
        let label_name = label_holders[i].firstElementChild;
        let option_display = label_name.nextElementSibling;
        let arrow = option_display.nextElementSibling;

        let selection_height = selection_below.clientHeight;
        let orig_wrapper_ht = wrapper.clientHeight;
        let expanded_height = orig_wrapper_ht + selection_height;
        
        wrapper.style.height = orig_wrapper_ht + 'px';
        
        label_holders[i].addEventListener('click', () => {
            
            if( selection_below.classList.contains('show')) {
                label_holders[i].classList.remove('focus');
                selection_below.classList.remove('show');
                arrow.classList.remove('showing');
                wrapper.classList.remove('expanded');
                wrapper.style.height = orig_wrapper_ht + 'px';

            } else {

                // removal 1/7/22
                //doScrolling(top_of_wrapper - 50, 2000);

                label_holders[i].classList.add('focus');
                selection_below.classList.add('show');
                arrow.classList.add('showing');
                wrapper.classList.add('expanded');
                wrapper.style.height = expanded_height + 'px';
            }
        }
        );

        if( label_holders[i].classList.contains('notes')) {
            label_holders[i].addEventListener('click', function() {
                let notes_option = selection_below.firstElementChild;
                let notes_input = notes_option.firstElementChild;
                notes_option.classList.add('show');
                formObject['notes'] = notes_input.value;
                notes_input.addEventListener('input', ()=> {
                    formObject['notes'] = notes_input.value;
                });
            });
        }   

    }

    return label_holders[0];

}

function init_other_options() {
    let other_options = document.getElementsByClassName('other');

    for(let n = 0; n < other_options.length; n++) {
        other_options[n].addEventListener('click', () => {
            // expand the other input
            other_options[n].classList.add('focus');
            let close = other_options[n].firstElementChild;
            let label = close.nextElementSibling;
            let input = label.nextElementSibling;
            // focus this input on open... not reliable on iOS
            setTimeout(() => {
                input.focus();
                input.select();
            }, 100);
            

            input.classList.add('show');
            close.classList.add('show');

            let parent_holder = other_options[n].parentElement;
            let wrapper = parent_holder.parentElement;
            
            let next_wrapper = wrapper.nextElementSibling;
            if(next_wrapper == null) {
                next_wrapper = document.getElementById
            }
            let next_label_holder = next_wrapper.firstElementChild;
            let next_sel_label_holder = parent_holder.nextElementSibling;
            
            let sel_label_holder = parent_holder.previousElementSibling;
            
            let sel_label = sel_label_holder.firstElementChild;
            let selected_option_display = sel_label.nextElementSibling;
            let arrow = selected_option_display.nextElementSibling;
            let sel_type = parent_holder.getAttribute('sel_type');
            let options = parent_holder.children;
            for(let i = 0; i < options.length - 1; i++ ) {
                options[i].classList.add('hide');
            }

            close.addEventListener('click', () => {
                // don't trigger the outer click listener too.
                event.stopPropagation();
                if(input.classList.contains('show')) {
                    input.classList.remove('show');
                    close.classList.remove('show');
                    other_options[n].classList.remove('focus');
                    for(let i = 0; i < options.length - 1; i++ ) {
                        options[i].classList.remove('hide');
                    }
                    if( close.classList.contains('accept_input')) {
                         // deselect any other options that may have been selected
                        for( let each of parent_holder.children) {
                            if(each.classList.contains('value_added')) {
                                each.classList.remove('value_added');
                            }
                        }
                        other_options[n].classList.add('value_added');
                        formObject[sel_type] = input.value;
                        selected_option_display.innerText = '- ' + input.value;
                        // add green bottom border to label holder
                        sel_label_holder.classList.add('option_selected');
                        // turn into a checkmark
                        arrow.classList.add('option_selected');

                        sel_label_holder.click();
                        // setTimeout(() => next_label_holder.click(), 600);
                        setTimeout(() => openNextEmptySelection(sel_label_holder), 600);

                    } else { // other option closed with no input added
                        if(sel_label_holder.classList.contains('option_selected')) {
                            sel_label_holder.classList.remove('option_selected');
                            arrow.classList.remove('option_selected');
                            selected_option_display.innerText = '';
                            formObject[sel_type] = '';
                        }
                    }
                    
                    
                }
            });

            input.addEventListener('input', function() {
                if(input.value == '') { // if no text in
                    if(other_options[n].classList.contains('value_added')) {
                        other_options[n].classList.remove('value_added');
                        close.classList.remove('accept_input');
                        label.innerText = 'Other';
                    }
                } else { // found text
                    if(other_options[n].classList.contains('value_added')) {   
                        label.innerText = input.value;
                    } else {
                        other_options[n].classList.add('value_added');
                        close.classList.add('accept_input');
                        label.innerText = input.value;
            
                    }

                }
                
            });
            // listen for enter key
            input.addEventListener('keypress', ()=>{
                if(event.keyCode == 13) {
                    close.click();
                    input.blur();
                }
            });

        });


    }
}

// TODO: change the label holder to display 'Name' - ### 
// TODO: package the name and contact info together for back end saving.

// set up contact option listeners
// TODO: close on filled out option should erase any possible entries in the others.
function init_contact_options() {
    // get the options and setup their listeners/class changes
    let phone_option = document.getElementById('phone_option');
    let phone_close = phone_option.firstElementChild;
    let phone_label = phone_close.nextElementSibling;
    let phone_name_input = phone_label.nextElementSibling;
    let phone_input = phone_name_input.nextElementSibling;

    let selection_div = phone_option.parentElement;
    let sel_type = selection_div.getAttribute('sel_type');
    let dropdown_wrapper = selection_div.parentElement;
    let label_holder = dropdown_wrapper.firstElementChild;
    let label_holder_children = label_holder.children;
    let selected_option_display = label_holder_children[1];
    let arrow = label_holder_children[2];

    let email_option = document.getElementById('email_option');
    let email_close = email_option.firstElementChild;
    let email_label = email_close.nextElementSibling;
    let email_name_input = email_label.nextElementSibling;
    let email_input = email_name_input.nextElementSibling;

    let other_option = email_option.nextElementSibling;

    phone_option.addEventListener('click', function() {
        phone_option.classList.add('focus');
        email_option.classList.add('hide');
        other_option.classList.add('hide');
        phone_close.classList.add('show');
        phone_name_input.classList.add('show');
        phone_input.classList.add('show');

        setTimeout(() => {
                // doesn't really like this having two inputs
                //phone_input.focus();
                //phone_input.select();
            }, 100);

        phone_input.addEventListener('input', () => {
            if( phone_input.value == '' ) {
                if(phone_option.classList.contains('value_added')) {
                        phone_option.classList.remove('value_added');
                        phone_close.classList.remove('accept_input');
                        phone_label.innerText = 'Text';
                    }
            } else {
                if(phone_option.classList.contains('value_added')) {   
                        phone_label.innerText = phone_input.value;
                    } else {
                        phone_option.classList.add('value_added');
                        phone_close.classList.add('accept_input');
                        phone_label.innerText = phone_input.value;
            
                    }
            }
        });

        phone_input.addEventListener('keypress', () => {
            if(event.keyCode == 13) {
                phone_close.click();
            }
        });

        phone_close.addEventListener('click', () => {

            event.stopPropagation();
            if(phone_input.classList.contains('show')) {
                phone_option.classList.remove('focus');
                email_option.classList.remove('hide');
                other_option.classList.remove('hide');
                phone_close.classList.remove('show');
                phone_name_input.classList.remove('show');
                phone_input.classList.remove('show');
    
                if( phone_close.classList.contains('accept_input')) {
                    // populate the label holder 
                    let contact_info = 'Name: ' + '\n' + phone_name_input.value + '\n' + 'Phone: ' + '\n' + phone_input.value;
                    formObject[sel_type] = contact_info;
                    selected_option_display.innerText = phone_name_input.value + ' -' + phone_input.value;
                    label_holder.classList.add('option_selected');
                    arrow.classList.add('option_selected');

                    label_holder.click();

                    validateForm();
                    setTimeout(()=> openNextEmptySelection(label_holder), 200);
                    // TODO: set timeout, run form validation function
                    // set form validation to start running on every label click.
                    // from this point on out.
                    // this should do the same 'next label click' as the other options

                } else {
                    if( label_holder.classList.contains('option_selected')) {
                        label_holder.classList.remove('option_selected');
                        arrow.classList.remove('option_selected');
                        selected_option_display.innerText = '';
                    }

                }
            }
        });
    });

    email_option.addEventListener('click', function() {
        email_option.classList.add('focus');
        phone_option.classList.add('hide');
        other_option.classList.add('hide');
        email_close.classList.add('show');
        email_name_input.classList.add('show');
        email_input.classList.add('show');

        setTimeout(() => {
                //email_input.focus();
                //email_input.select();
            }, 100);

        email_input.addEventListener('input', () => {
            if( email_input.value == '' ) {
                if(email_option.classList.contains('value_added')) {
                        email_option.classList.remove('value_added');
                        email_close.classList.remove('accept_input');
                        email_label.innerText = 'Email';
                    }
            } else {
                if(email_option.classList.contains('value_added')) {   
                        email_label.innerText = email_input.value;
                    } else {
                        email_option.classList.add('value_added');
                        email_close.classList.add('accept_input');
                        email_label.innerText = email_input.value;
            
                    }
            }
        });

        email_input.addEventListener('keypress', () => {
            if(event.keyCode == 13) {
                email_close.click();
            }
        });

        email_close.addEventListener('click', () => {

            event.stopPropagation();
            if(email_input.classList.contains('show')) {
                email_option.classList.remove('focus');
                phone_option.classList.remove('hide');
                other_option.classList.remove('hide');
                email_close.classList.remove('show');
                email_name_input.classList.remove('show');
                email_input.classList.remove('show');
    
                if( email_close.classList.contains('accept_input')) {
                    // populate the label holder
                    let contact_info = 'Name: ' + '\n' + email_name_input.value + '\n' + 'Email: ' + '\n'+ email_input.value;
                    formObject[sel_type] = contact_info;
                    selected_option_display.innerText = email_name_input.value + ' -' + email_input.value;
                    label_holder.classList.add('option_selected');
                    arrow.classList.add('option_selected');

                    label_holder.click();

                    validateForm();
                    setTimeout(()=> openNextEmptySelection(label_holder), 200);
                    // TODO: set timeout, run form validation function
                    // set form validation to start running on every label click.
                    // from this point on out.
                } else {
                    if( label_holder.classList.contains('option_selected')) {
                        label_holder.classList.remove('option_selected');
                        arrow.classList.remove('option_selected');
                        selected_option_display.innerText = '';
                    }

                }
            }
        });
    });

}


function init_regular_options() {
    // this should use something to verify one input only
    let all_options = document.getElementsByClassName('option');
    
    let option;
    for( option of all_options) {
        // skip some
        if(option.classList.contains('other')) {
            continue;
        }  
        if(option.id == 'phone_option' || option.id == 'email_option') {
            continue;
        }
        
        option.addEventListener('click', function() {
            let selection_div = option.parentElement;
            let sel_type = selection_div.getAttribute('sel_type');
            let clicked_obj = this;

            // run the select this option function and pass this option in.
            selectOneOption(this);            

        });
        
    }

}

function init_notes_input() {
    // should just listen for inputs, and add to formObject when the label gets clicked
    let label_holders = document.getElementsByClassName('label_holder');
    let notes_holder;
    for(let holder of label_holders) {
        if(holder.classList.contains('notes')){
            notes_holder = holder;

        }
    }


}

// can be used for selection and deselection. checks for state.
function selectOneOption(option) {

    // apply the class to the option and deselect any others
    let selection = option.parentElement;
    let label_holder = selection.previousElementSibling;
    let label_children = label_holder.children;
    let sel_option_display = label_children[1];
    let arrow = label_children[2];
    let sel_type = selection.getAttribute('sel_type');
    
    let all_options = selection.children;
    let wrapper = label_holder.parentElement;
    let next_wrapper = wrapper.nextElementSibling;
    let n_wrapper_children = next_wrapper.children;
    let next_label_holder = n_wrapper_children[0];

    // if this was a deselection, just remove the stuff and return
    if(option.classList.contains('value_added')) {
        option.classList.remove('value_added');
        formObject[sel_type] = '';
        sel_option_display.innerText = '';
        label_holder.classList.remove('option_selected');
        arrow.classList.remove('option_selected');
        return;
    }

    // a selection. reset all other options, and then check the selected one
    for(let each of all_options) {
        if(each.classList.contains('value_added')){
            each.classList.remove('value_added');
        }
        if(each.classList.contains('other')) {
            let children = each.children;
            children[1].innerText = 'Other';
        }
    }
    option.classList.add('value_added');
    formObject[sel_type] = option.id;
    sel_option_display.innerText = '- ' + option.id;
    label_holder.classList.add('option_selected');
    arrow.classList.add('option_selected');

    // close selection and open next
    label_holder.click();
    setTimeout(() => {
        //next_label_holder.click();
        openNextEmptySelection(label_holder);
    }, 700);
    
}


function validateForm() {
    // check the formObject for empty values, apply a class to signify
    let object_keys = Object.keys(formObject);
    let selected_option_displays = document.getElementsByClassName('selected_option_display');

    object_keys.forEach(function(key) {
        if(key == 'notes') {
            return;
        }
        if(formObject[key] == '') {
            // search for matching option display
            for(let elem of selected_option_displays) {
                let sel_type = elem.getAttribute('sel_type');
                if(sel_type == key) {
                    let arrow = elem.nextElementSibling;
                    arrow.classList.add('missing_info');
                }
            }
        }
    }
    );

    let label_holders = document.getElementsByClassName('label_holder');

    for( let holder of label_holders ) {
        holder.addEventListener('click', validateForm);
    }

}


function openNextEmptySelection(this_label_holder) {
   
    let label_holders = document.getElementsByClassName('label_holder');
    let indexer = 0;
    let current_index;
    for( let holder of label_holders ) {
        // if( holder.classList.contains('notes')) {
        //     indexer++;
        //     continue;
        // } // i think with notes at the end, 
        
        if(current_index != undefined) {
            if( holder.classList.contains('option_selected')) {
                
            } else {
                if( holder.classList.contains('focus')) {
                    return;
                } else if( holder.classList.contains('notes')){
                    // do nothing
                } else {
                    holder.click();
                    return;
                }
            }
        }

        if( holder == this_label_holder ) {
            current_index = indexer;
        }

        indexer++;

        if( indexer == label_holders.length ) {
            // restart loop check and check each one from beginning.
            for( let holder of label_holders ) {
                if( holder.classList.contains('notes')) {
                    continue;
                }
                if(holder.classList.contains('option_selected')) {

                } else {
                    if( holder.classList.contains('focus')) {
                        return;
                    } else {
                        holder.click();
                        return;
                    }
                }
            }
            // if this never returns, the form is filled out completely..

            doScrolling(0, 1000);
            let review_button = document.getElementById('review');
            review_button.classList.add('available');
        }
    }

}

function reviewButtonListener() {

    // listen for clicks.
    // check the label holders, and the button to verify completion
    let review_button = document.getElementById('review');
    review_button.addEventListener('click', function() {

        let label_holders = document.getElementsByClassName('label_holder')
        for( let holder of label_holders ) {
            if( holder.classList.contains('notes') ) {
                continue;
            }
            if( !holder.classList.contains('option_selected')) {
                validateForm();
                return;
            }
        }
        
        if( review_button.classList.contains('available')) {
            // TODO: add a loader here for effect?
            setTimeout(toggleReviewContainer, 200);
            
        }

        }
    );

}


function toggleReviewContainer() {
    
    let review_container = document.getElementById('review_container');
    let click_blocker = document.getElementById('click_blocker');
    let container_top = review_container.offsetTop;

    let back_button = document.getElementById('back_button');
    let send_button = document.getElementById('send_button');

    back_button.addEventListener('click', toggleReviewContainer);
    send_button.addEventListener('click', sendSpecialOrder);

    if( review_container.classList.contains('block')) {
        
        review_container.classList.remove('visible');
        click_blocker.classList.remove('visible');
        
        setTimeout(()=>{
            click_blocker.classList.remove('block');
            review_container.classList.remove('block');
        }, 1000);
       
    } else {
        // POPULATE the divs.. and then show.
        let review_options = document.getElementsByClassName('review_option');
        let review_option;
        for(review_option of review_options) {
            // grab some useful elements in the review option container
            let review_option_children = review_option.children;
            let review_option_content = review_option_children[1];
            let content_children = review_option_content.children;
            let review_image = content_children[0];
            let review_label = content_children[1];

            let id = review_option.id;
            let split_id = id.split('_');
            let key = split_id[1];

            // set the label , done from the previous entry into the formObject
            review_label.innerText = formObject[key];
            
            // now copy the image src from that selected option : alittle more tedious

            // finds the parent div for all the options in this category
            let parent_category_div = document.querySelector('div.selection[sel_type="'+ key + '"]');
            console.log('parent found', parent_category_div);

            // notes will never have an image
            if(key == 'notes' || key == 'contact') {
                review_image.classList.add('hide');
                console.log('skipping notes or contact');
                continue;
            }

            let selected_option_in_category;
            // loop the children and get the value added one.
            for( let option of parent_category_div.children) {
                if( option.classList.contains('value_added')) {
                    console.log('selected option found ', option);
                    selected_option_in_category = option;
                }
            }

            if(selected_option_in_category.classList.contains('other')) {
                // a selection of other will not have an image to display
                // maybe we add a class here instead of remove
                review_image.classList.add('hide');
            } else {
                let selected_option_image_element = selected_option_in_category.firstElementChild;
                review_image.src = selected_option_image_element.src;
            }

        }

        review_container.classList.add('block');
        click_blocker.classList.add('block');

        setTimeout(()=>{
            review_container.classList.add('visible');
            click_blocker.classList.add('visible');
        }, 100);

        doScrolling(0, 1000);
    }

}

// ajax to send server the formObject
// should trigger a save of the form, and an email send to owner.
function sendSpecialOrder() {
    // start loader/spinner
    console.log('sending special order');
    let send_button = document.getElementById('send_button');
    send_button.classList.add('sending');
    
    if(formObject['notes'] == '') {formObject['notes'] == 'None' };

    let modified_formObject = {};
    let dynamic_json = {};
    // change* stringify a portion of the form object to be dynamically saved.
    for( const[key, value] of Object.entries(formObject)) {
        if(key == 'notes') {
            modified_formObject[key] = value;
            continue;
        }
        if(key == 'contact') {
            modified_formObject[key] = value;
            continue;
        };

        dynamic_json[key] = value;
        
    }
    dynamic_json = JSON.stringify(dynamic_json);

    modified_formObject['json'] = dynamic_json;
    

    let form_json = JSON.stringify(modified_formObject);

    // ajax submission
    fetch('/special_order_formObject', {
            method: 'POST',
            body: form_json,
            headers: {
                "Content-Type": 'application/json'
            }
            })
        .then(handle_error)
        .then((success) => {
            console.log(success)
            // redirect to thank you page.
            window.location.replace('/thank_you')

        })
        .catch( error => console.log(error));

}
// TODO: formObject[contact] need to differentiate between email and phone? idk.. 


function scrollInDesktopView() {

    if(screen.width > 768) {
        // get the first dropdown wrapper
        let wrappers = document.getElementsByClassName('dropdown_wrapper');
        let y_position = wrappers[0].offsetTop;
        y_position-= 50;
        doScrolling(y_position, 2000);

    }

}

function doScrolling(elementY, duration) { 
  var startingY = window.pageYOffset;
  var diff = elementY - startingY;
  var start;

  // Bootstrap our animation - it will get called right before next frame shall be rendered.
  window.requestAnimationFrame(function step(timestamp) {
    if (!start) start = timestamp;
    // Elapsed milliseconds since start of scrolling.
    var time = timestamp - start;
    // Get percent of completion in range [0, 1].
    var percent = Math.min(time / duration, 1);

    window.scrollTo(0, startingY + diff * percent);

    // Proceed with animation as long as we wanted it to.
    if (time < duration) {
      window.requestAnimationFrame(step);
    }
  })
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