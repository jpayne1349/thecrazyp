// does a listdir of photos folder on server, allow for easy removal/addition of photos?

// page global which holds the current open card, used to close on other open
var current_open_card = [];

fetch("/load_inventory", { method: "POST" })
  .then(handle_error)
  .then((response) => response.json())
  .then((inventory_products) => load_inventory(inventory_products))
  .catch((error) => console.log(error));

class inventoryCard {
  constructor(description, details, id, photos_list, price, status) {
    this.description = description;
    this.details = details;
    this.id = id;
    this.photos_list = photos_list;
    this.price = price;
    this.status = status;

    this.product_card_element = undefined;
    this.cancel_request_element = undefined;
    this.card_listener = undefined;
    this.request_form_open = false;

    this.createCard();

  }

  createCard() {
      
    let product_card = document.createElement("div");
    product_card.className = "product_card";
    this.product_card_element = product_card;
    product_card.addEventListener('click', openCard);

    let product_photos_div = document.createElement("div");
    product_photos_div.className = "product_photos_div";

    let product_descript = document.createElement("div");
    product_descript.className = "product_descript";
    product_descript.innerText = this.description;

    let previous_photo_button = document.createElement("div");
    previous_photo_button.className = "previous_photo_button";
    previous_photo_button.addEventListener("click", this.changePhoto);

    let photo_stack = document.createElement("div");
    photo_stack.className = "photo_stack";
    photo_stack.id = "photo_stack";

    let first_photo = true;
    for (let photo_src of this.photos_list) {
      let lr_inv_product_photo = document.createElement("img");
      lr_inv_product_photo.className = "inv_product_photo lr";

      let img_loading_placeholder = document.createElement("div");
      img_loading_placeholder.className = "img_loading_placeholder shimmer";

      // before adding src, need to setup onload function for each
      lr_inv_product_photo.onload = function () {
        img_loading_placeholder.classList.add("loaded");
        setTimeout(() => {
          // wait 1 second and fade in low res image, remove placeholder
          lr_inv_product_photo.classList.add("loaded");
          img_loading_placeholder.remove();
        }, 1000);
      };

      lr_inv_product_photo.src =
        "/static/product_inventory/" + this.id + "/LowRes/" + photo_src;
      // set first looped photo to active on load..
      if (first_photo == true) {
        lr_inv_product_photo.classList.add("active");
        first_photo = false;
      }

      let loader = document.createElement("div");
      loader.className = "loader show";

      let hr_inv_product_photo = document.createElement("img");
      hr_inv_product_photo.className = "inv_product_photo hr";

      hr_inv_product_photo.onload = function () {
        // allow card to be opened
        product_card.addEventListener("click", this.open_card);
        product_card.classList.add("loaded");
        // remove loader
        lr_inv_product_photo.classList.remove("loaded");
        hr_inv_product_photo.classList.add("loaded");
        loader.classList.add("hide");
        if (lr_inv_product_photo.classList.contains("active")) {
          lr_inv_product_photo.classList.remove("active");
          hr_inv_product_photo.classList.add("active");
        }
        photo_stack.append(hr_inv_product_photo);
        setTimeout(() => {
          lr_inv_product_photo.remove();
          loader.remove();
        }, 1000);
      };

      hr_inv_product_photo.src =
        "/static/product_inventory/" + this.id + "/HighRes/" + photo_src;

      photo_stack.append(img_loading_placeholder, lr_inv_product_photo, loader);
    }

    let next_photo_button = document.createElement("div");
    next_photo_button.className = "next_photo_button";
    next_photo_button.addEventListener("click", this.changePhoto);

    product_photos_div.append(
        previous_photo_button,
        photo_stack,
        next_photo_button
    );

    let close_selected_product = document.createElement("div");
    close_selected_product.className = "close_selected_product";
    close_selected_product.addEventListener('click', closeCard);

    let product_details = document.createElement("div");
    product_details.className = "product_details";
    product_details.innerText = this.details;

    let lower_section = document.createElement("div");
    lower_section.className = "lower_section";

    let product_price = document.createElement("div");
    product_price.className = "product_price";
    product_price.innerText = "$" + this.price;

    let product_ship_and_handle = document.createElement("div");
    product_ship_and_handle.className = "product_ship_and_handle";
    product_ship_and_handle.innerText = "+ shipping & handling";

    product_price.append(product_ship_and_handle);

    let purchase_button = document.createElement("div");
    purchase_button.className = "purchase_button";

    if (this.status == "0") {
      purchase_button.innerText = "Request";
      purchase_button.classList.add("avail");
      product_card.classList.add("avail");
    } else if (this.status == "1") {
      purchase_button.innerText = "Pending";
      purchase_button.classList.add("pend");
      product_card.classList.add("pend");
    } else {
      purchase_button.innerText = "Sold";
      purchase_button.classList.add("sold");
      product_card.classList.add("sold");
    }
    purchase_button.setAttribute("var", this.id);
    purchase_button.addEventListener("click", this.showRequestForm);

    lower_section.append(product_price, purchase_button);

    product_card.append(
      close_selected_product,
      product_descript,
      product_photos_div,
      product_details,
      lower_section
    );

    let request_div = document.createElement("div");
    request_div.className = "request_div";

    let request_title = document.createElement("div");
    request_title.className = "request_title";
    request_title.innerText = "How can we contact you?";

    let request_examples = document.createElement("div");
    request_examples.className = "request_examples";
    request_examples.innerText = "Text , Email , Instagram, Facebook, etc";

    let request_contact_input = document.createElement("textarea");
    request_contact_input.className = "request_contact_input";
    request_contact_input.placeholder =
      "Include an address for a shipping quote!";

    let request_descript = document.createElement("div");
    request_descript.className = "request_descript";
    request_descript.innerHTML =
      "This hat and your contact info will go straight to us! <br> We will reach out soon!";

    let request_buttons = document.createElement("div");
    request_buttons.className = "request_buttons";

    let cancel_request = document.createElement("div");
    cancel_request.className = "cancel_request button";
    cancel_request.innerText = "Cancel";
    this.cancel_request_element = cancel_request;
    cancel_request.addEventListener("click", this.closeRequestForm );

    let send_request = document.createElement("div");
    send_request.className = "send_request button";
    send_request.innerText = "Send";
    send_request.setAttribute("var", this.id);
    send_request.addEventListener("click", this.sendRequest);

    request_buttons.append(cancel_request, send_request);

    request_div.append(
      request_title,
      request_examples,
      request_contact_input,
      request_descript,
      request_buttons
    );
    lower_section.append(request_div);
    
    let inventory_div = document.getElementById("inventory_div");
    inventory_div.append(product_card);


    function openCard() {
        console.log('running open card', this);
        this.removeEventListener('click', openCard);
        
        this.classList.add("selected");
        setTimeout(
        () => this.classList.add("show_lower"),
        200
        );
        
    }

    function closeCard() {
        let parent_card = this.parentElement;
        parent_card.classList.remove("selected");
        parent_card.classList.remove("show_lower");
       
        let card_elements = parent_card.children;
        let lower_section = card_elements[4];
        let lower_elements = lower_section.children;
        let request_div = lower_elements[2];
        let request_elements = request_div.children;
        let buttons_div = request_elements[4];
        let cancel_button = buttons_div.firstChild;
        if(request_div.classList.contains('show')) {
            cancel_button.click();
        }

        setTimeout(()=> parent_card.addEventListener('click', openCard), 200);
    }
    
  }




  showRequestForm() {
    // check the request button for classes that coincide with status
    let request_button = this;
    let lower_section = request_button.parentElement;
    let lower_children = lower_section.children;
    let request_div = lower_children[2];
    let request_div_children = request_div.children;

    // product details
    let product_details = lower_section.previousSibling;
    let photos_div = product_details.previousSibling;
    let target_y = product_details.offsetTop;

    if (request_button.classList.contains("pend")) {
      request_div.classList.add("pend");
      request_div_children[2].classList.add("pend");
      let request_title = request_div_children[0];
      request_title.innerText = "We can make more!";
      let request_descript = request_div_children[3];
      request_descript.innerHTML =
        "Drop your contact info above and we will contact you about making a hat similar to this one!";
      let request_address = request_div_children[5];
    } else if (request_button.classList.contains("sold")) {
      request_div.classList.add("sold");
      request_div_children[2].classList.add("sold");
      let request_title = request_div_children[0];
      request_title.innerText = "We can make more!";
      let request_descript = request_div_children[3];
      request_descript.innerHTML =
        "Drop your contact info above and we will contact you about making a hat similar to this one!";
    }

    // focus the request_contact_input... has to be done in the timeout below, after it's been displayed to the page
    let request_contact_input = request_div_children[2];

    request_div.classList.add("show");
    setTimeout(() => {
      for (let element of request_div_children) {
        element.classList.add("show");
      }
      // cursor focus
      request_contact_input.focus();
    }, 800);

    // TODO: make this show/hide work with opacity fading.

    let request_start_point = request_div.offsetTop;
    let calculated_height = request_start_point - target_y;

    request_div.style.height = calculated_height + "px";
  }

  closeRequestForm() {

    let cancel_button = this;
    let button_div = cancel_button.parentElement;
    let descript = button_div.previousElementSibling;
    let textarea_input = descript.previousElementSibling;
    let request_div = button_div.parentElement;
    let div_children = request_div.children;

    if (button_div.classList.contains("show")) {
        for (let element of div_children) {
        element.classList.remove("show");
        }

        request_div.style.height = "0px";
        
        setTimeout(()=> request_div.classList.remove('show'), 900);

        if (textarea_input.classList.contains("required")) {
        textarea_input.classList.remove("required");
        }
    }
  }

  sendRequest() {
  console.log(this);
  let send_button = this;
  let button_div = send_button.parentElement;
  let request_div = button_div.parentElement;
  let request_children = request_div.children;
  let contact_input = request_children[2];

  let contact_info = contact_input.value;

  // check for empty input
  if (contact_info == "") {
    contact_input.classList.add("required");
  } else {
    // TODO: make this sending class look better on mobile
    send_button.classList.add("sending");
    send_button.removeEventListener("click", this.sendRequest);
    // TODO: check the request_div for a pend/sold class
    // modify the object to send based on this, to keep track of this

    let status = 0;
    // get pend/sold status if applicable
    if (request_div.classList.contains("pend")) {
      status = 1;
    } else if (request_div.classList.contains("sold")) {
      status = 2;
    }

    // get product id, and contact info, send to server
    let product_id = send_button.getAttribute("var");

    let today = new Date();
    let date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    let time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date + " " + time;

    let object_to_send = {
      id: product_id,
      contact_info: contact_info,
      date_created: dateTime,
      status: status,
    };

    let json_object = JSON.stringify(object_to_send);

    // ajax submission
    fetch("/inventoryProductRequest", {
      method: "POST",
      body: json_object,
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(handle_error)
      .then((success) => {
        console.log(success);
        // redirect to thank you page.
        window.location.replace("/thank_you");
        // setTimeout(()=>, 2000);
      })
      .catch((error) => console.log(error));
  }
  }

  changePhoto() {
      let arrow = this;
      let product_photo_div = arrow.parentElement;
      let children_arr = product_photo_div.children;

      let photo_stack = children_arr[1];

      let direction;
      if (this.classList.contains("previous_photo_button")) {
        direction = -1;
      } else {
        direction = 1;
      }
      let photos_list = photo_stack.children;

      for (let photo of photos_list) {
        // find the current active photo.., get next/prev based on that.
        if (photo.classList.contains("active")) {
          let next_photo = photo.nextSibling;
          if (next_photo == null) {
            next_photo = photos_list.item(0);
          }

          let prev_photo = photo.previousSibling;
          if (prev_photo == null) {
            prev_photo = photos_list.item(photos_list.length - 1);
          }

          setTimeout(() => {
            if (direction == 1) {
              next_photo.classList.add("active");
            } else {
              prev_photo.classList.add("active");
            }
          }, 200);

          photo.classList.remove("active");

          break;
        }
      }
  }


}

// includes open_card and close_card functions
function load_inventory(inventory_products) {
  let product;
  let inventory_div = document.getElementById("inventory_div");

  console.log(inventory_products);

  for (product of inventory_products) {
    let inventory_card = new inventoryCard(
        product["description"],
        product["details"],
        product["id"],
        product["photos_list"],
        product["price"],
        product["status"]
    );

  }

}


// generic function to be used in all script files
function handle_error(response) {
  if (!response.ok) {
    // try to process the response text before sending to server
    response.text().then((text) => {
      let error_string =
        "Url: " +
        response.url +
        "\n Status Code: " +
        response.status +
        "\n Response Text: " +
        text;

      let json_data = {
        error: error_string,
      };

      json_data = JSON.stringify(json_data);

      fetch("/handle_error", {
        method: "POST",
        body: json_data,
        headers: {
          "Content-Type": "application/json",
        },
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
