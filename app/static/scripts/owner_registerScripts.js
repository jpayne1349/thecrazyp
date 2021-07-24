

function validateRegisterForm() {

    console.log('check for empty fields')

    let blank = '';
    // grab form inputs, check if none, change colors to fill out
    // let email_input = $('#email.input');
    let email_input = document.getElementById('email');
    let email_value = email_input.value;

    // let username_input = $('#username.input');
    let username_input = document.getElementById('username');
    let username_value = username_input.value;

    // let password_input = $('#password.input');
    let password_input = document.getElementById('password');
    let password_value = password_input.value;
    console.log(password_value);
    
    if( username_value == blank || password_value == blank || email_value == blank) {
        if( email_value == blank ) {
            email_input[0].style.borderColor = 'rgba(255, 0, 0, 0.3)';
            email_input[0].placeholder = 'Required';
        } else {
            email_input[0].style.borderColor = '#e1e4e8';
            email_input[0].placeholder = '';
        }

        if( username_value == blank ) {
            username_input[0].style.borderColor = 'rgba(255, 0, 0, 0.3)';
            username_input[0].placeholder = 'Required';
        } else {
            username_input[0].style.borderColor = '#e1e4e8';
            username_input[0].placeholder = '';
        }

        if (password_value == blank) {
            password_input[0].style.borderColor = 'rgba(255, 0, 0, 0.3)';
            password_input[0].placeholder = 'Required';
        } else {
            password_input[0].style.borderColor = '#e1e4e8';
            password_input[0].placeholder = '';
        }

        return false;
    }

    return true;


    //returns true or false to submit to backend



}