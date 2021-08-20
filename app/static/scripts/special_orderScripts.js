

// form object to be updated and accessed by functions
var formObject = {

    style:'',
    color:'',
    band_type:'',
    design:'',
    notes:'',
    contact: {}

}

main();

function main() {
    show_first_selection();

}

async function show_first_selection() {

    const first_selection = await init_label_holders();
    const other_options = await init_other_options();
    first_selection.click();

}

function init_label_holders() {

    let label_holders = document.getElementsByClassName('label_holder');
    let index_counter = 0;
    for(let i = 0; i<label_holders.length; i++ ) {
        let wrapper = label_holders[i].parentElement;
        wrapper.style.zIndex = (label_holders.length * 2 ) - index_counter;
        index_counter++;
        label_holders[i].style.zIndex = (label_holders.length * 2 ) - index_counter;
        index_counter++;
        let selection_below = label_holders[i].nextElementSibling;
        selection_below.style.zIndex = (label_holders.length * 2) - index_counter;
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
                label_holders[i].classList.add('focus');
                selection_below.classList.add('show');
                arrow.classList.add('showing');
                wrapper.classList.add('expanded');
                wrapper.style.height = expanded_height + 'px';
            }
        }
        );

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
            input.focus();
            input.classList.add('show');
            close.classList.add('show');

            let parent_holder = other_options[n].parentElement;
            // TODO: find next label holder for next click
            let wrapper = parent_holder.parentElement;
            let next_wrapper = wrapper.nextElementSibling;
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
                        formObject[sel_type] = input.value;
                        selected_option_display.innerText = '- ' + input.value;
                        // add green bottom border to label holder
                        sel_label_holder.classList.add('option_selected');
                        // turn into a checkmark
                        arrow.classList.add('option_selected');
                        // TODO: close the selection, open the next.
                        sel_label_holder.click();
                        setTimeout(() => next_label_holder.click(), 600);

                    } else { // other option closed with no input added
                        if(sel_label_holder.classList.contains('option_selected')) {
                            sel_label_holder.classList.remove('option_selected');
                            arrow.classList.remove('option_selected');
                            selected_option_display.innerText = '';
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
        });


    }
}

// function for init of all regular options,
// listeners and updating label_holder displays and what not.