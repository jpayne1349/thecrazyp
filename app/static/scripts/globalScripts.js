


const navbar = document.getElementById('navbar');
const mobile_navbar_hamburger = document.getElementById('mobile_navbar_hamburger');
const screen_width = screen.width;
const navbar_links = document.getElementsByClassName('navbar_link');


// responsive navbar, run right away
if( screen.width < 600 ) {
    
    mobile_navbar_hamburger.addEventListener('click', () => {
        for( let link of navbar_links ) {
            if(link.classList.contains('show')) {
                link.classList.remove('show');
                mobile_navbar_hamburger.classList.remove('open');
            } else {
                link.classList.add('show');
                mobile_navbar_hamburger.classList.add('open');
            }
        }
    });
    
}

