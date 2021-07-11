


var navbar = document.getElementById('navbar');
var navbar_link_holder = document.getElementById('navbar_link_holder');
var screen_width = screen.width;
var navbar_links = document.getElementsByClassName('navbar_link');

console.log('screen width', screen_width);
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