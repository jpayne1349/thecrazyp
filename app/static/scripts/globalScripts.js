


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


// does a listdir of photos folder on server, allow for easy removal/addition of photos?
fetch('/carousel_photos', { method: 'POST' })
    .then(response => response.json())
    .then(json_of_file_names => populate_carousel(json_of_file_names))
    .catch( error => console.log('ERROR', error));



