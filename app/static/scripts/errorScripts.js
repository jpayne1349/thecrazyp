


let send_button = document.getElementById('send_button');
let mail_icon = send_button.firstElementChild;
let form_input = send_button.previousElementSibling;

send_button.addEventListener('click', send_report);

function send_report() {
    // send form input string via ajax, to email dev list
    if(form_input.value == '') {
        form_input.classList.add('required');
        return
    }

    mail_icon.classList.add('sending');

    let json_data = {
        'error': form_input.value
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
        // remove and replace with a thank you
        setTimeout(()=>{
            let thank_you_div = document.createElement('div');
            thank_you_div.className = 'thank_you_div';
            thank_you_div.innerText = 'Thank you!';

            form_input.before(thank_you_div);
            form_input.remove();
            send_button.remove();

        }, 1000);
        
        
    })
    .catch((fail) => console.log(fail)); 

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
