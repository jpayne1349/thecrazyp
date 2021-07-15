


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

