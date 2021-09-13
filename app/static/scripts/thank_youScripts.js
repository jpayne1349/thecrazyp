

let menu_linker = document.getElementById('menu_linker');
let menu_button = document.getElementById('mobile_navbar_hamburger');

if(screen.width < 800) {

    menu_linker.addEventListener('click', () => {
        menu_button.click();
        
    });

} else {

    menu_linker.innerHTML = 'Inventory';
    menu_linker.addEventListener('click', () => {
        window.location.href = '/inventory';
    });

}
