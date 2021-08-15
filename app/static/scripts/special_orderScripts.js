

main();

function main() {

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
        let arrow = label_name.nextElementSibling;

        let selection_height = selection_below.clientHeight;
        let orig_wrapper_ht = wrapper.clientHeight;
        let expanded_height = orig_wrapper_ht + selection_height;
        wrapper.style.height = orig_wrapper_ht + 'px';
        
        label_holders[i].addEventListener('click', () => {
            if( selection_below.classList.contains('show')) {
                selection_below.classList.remove('show');
                arrow.classList.remove('showing');
                wrapper.classList.remove('expanded');
                wrapper.style.height = orig_wrapper_ht + 'px';
            } else {
                selection_below.classList.add('show');
                arrow.classList.add('showing');
                wrapper.classList.add('expanded');
                wrapper.style.height = expanded_height + 'px';
            }
        }
        );

    }

    window.addEventListener('click', () => console.log(event.target));
}
