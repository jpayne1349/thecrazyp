


const navbar = document.getElementById('navbar');
const mobile_navbar_hamburger = document.getElementById('mobile_navbar_hamburger');
const screen_width = screen.width;
const navbar_links = document.getElementsByClassName('navbar_link');
const header_and_logo = document.getElementById('header_and_logo');

// responsive navbar, run right away
if( screen.width < 600 ) {
    
    mobile_navbar_hamburger.addEventListener('click', () => {
        for( let link of navbar_links ) {
            if(link.classList.contains('show')) {
                link.classList.remove('show');
                mobile_navbar_hamburger.classList.remove('open');
                navbar.classList.remove('show');
                header_and_logo.classList.remove('show');
            } else {
                link.classList.add('show');
                mobile_navbar_hamburger.classList.add('open');
                navbar.classList.add('show');
                header_and_logo.classList.add('show');
            }
        }
    });
    
}


const pathname_list = ['/', '/inventory', 'special_order', '/faq'];
// set navbar active link styling
let current_page_pathname = window.location.pathname;

pathname_list.forEach((pathname, index) =>  {
    if(pathname == current_page_pathname) {
        navbar_links[index].classList.add('active_link');
        navbar_links[index].removeAttribute('href');
    }
});
