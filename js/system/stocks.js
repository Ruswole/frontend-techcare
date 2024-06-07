import {
  backendURL,
  showNavAdminPages,
  successNotification,
  errorNotification,
  getLoggedUser,
} from "../utils/utils.js";

// Get Logged User Info
getLoggedUser();

// // Get Admin Pages
showNavAdminPages();

// Get All Data
getDatas();

async function getDatas() {
  const response = await fetch(backendURL + "/api/stock", {
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  });

  // Get response if 200-299 status code
  if (response.ok) {
    const json = await response.json();

    // Get Each Json Elements and merge with Html element and put it into a container
    let container = "";
    // Now caters pagination; You can use "json.data" if using pagination or "json" only if no pagination
    json.forEach((element) => {
      const date = new Date(element.created_at).toLocaleString();

      container += `<div class="container">
    <table class="table table-striped table-bordered">
        <thead class="thead-dark">
            <tr>
                <th>Inventory ID</th>
                <th>Branch ID</th>
                <th>Movement Type</th>
                <th>Quantity</th>
                <th>Date</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody id="medicineTableBody">
            <!-- Your JavaScript/Server-side code will populate this tbody with rows -->
            <tr>
                <td>${element.inventory_id}</td>
                <td>${element.branch_id}</td>
                <td>${element.movement_type}</td>
                <td>${element.quantity}</td>
                <td>${date}</td>
                <td>
                    <div class="dropdown">
                        <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"><i class="fa-solid fa-pen-to-square"></i></button>
                        <ul class="dropdown-menu">
                            <!-- Dropdown menu items -->
                            <li>
                            <a class="dropdown-item" href="#" id="btn_edit" data-id="${element.stock_id}">Edit</a>
                        </li>
                        <li>
                            <a class="dropdown-item" href="#" id="btn_delete" data-id="${element.stock_id}">Delete</a>
                        </li>
                        </ul>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</div>`;
    });
    // Use the container to display the fetch data
    document.getElementById("get_data").innerHTML = container;

    // Assign click event on Edit Btns
    document.querySelectorAll("#btn_edit").forEach((element) => {
      element.addEventListener("click", editAction);
    });

    // Assign click event on Delete Btns
    document.querySelectorAll("#btn_delete").forEach((element) => {
      element.addEventListener("click", deleteAction);
    });

    // Get Each Json Elements and merge with Html element and put it into a container
    // let pagination = "";
    // // Now caters pagination; Remove below if no pagination
    // json.links.forEach((element) => {
    //   pagination += `<li class="page-item">
    //                       <a class="page-link
    //                       ${element.url == null ? " disabled" : ""}
    //                       ${element.active ? " active" : ""}
    //                       " href="#" id="btn_paginate" data-url="${
    //                         element.url
    //                       }">
    //                           ${element.label}
    //                       </a>
    //                   </li>`;
    // });
    // // Use the container to display the fetch data
    // document.getElementById("get_pagination").innerHTML = pagination;

    // //   // Assign click event on Page Btns
    // document.querySelectorAll("#btn_paginate").forEach((element) => {
    //   element.addEventListener("click", pageAction);
    // });
  }
  // Get response if 400+ or 500+ status code
  else {
    errorNotification("HTTP-Error: " + response.status);
  }
}

// // Search Form
const form_search = document.getElementById("form_search");
form_search.onsubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData(form_search);

  getDatas("", formData.get("keyword"));
};

// Submit Form Functionality; This is for Create and Update
const form_slides = document.getElementById("form_slides");

form_slides.onsubmit = async (e) => {
  e.preventDefault();

  // Disable Button
  document.querySelector("#form_slides button[type='submit']").disabled = true;
  document.querySelector(
    "#form_slides button[type='submit']"
  ).innerHTML = `<div class="spinner-border me-2" role="status">
                        </div>
                        <span>Loading...</span>`;

  // Get Values of Form (input, textarea, select) set it as form-data
  const formData = new FormData(form_slides);

  // Check key/value pairs of FormData; Uncomment to debug
  // for (let [name, value] of formData) {
  //   console.log(`${name} = ${value}`); // key1 = value1, then key2 = value2
  // }

  let response;
  // Check if for_update_id is empty, if empty then it's create, else it's update
  if (for_update_id == "") {
    // Fetch API Medicine Store Endpoint
    response = await fetch(backendURL + "/api/stock", {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: formData,
    });
  }
  // for Update
  else {
    // Add Method Spoofing to cater Image upload coz you are using FormData; Comment if no Image upload
    formData.append("_method", "PUT");
    // Fetch API Carousel Item Update Endpoint
    response = await fetch(backendURL + "/api/stock/" + for_update_id, {
      method: "POST", // Change to PUT/PATCH if no Image Upload
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      // Comment body below; if with Image Upload; form-data equivalent
      body: formData,
      // Uncomment body below; if no Image Upload; form-urlencoded equivalent
      // body: new URLSearchParams(formData)
    });
  }

  // Get response if 200-299 status code
  if (response.ok) {
    // Uncomment for debugging purpose
    // const json = await response.json();
    // console.log(json);

    // Reset Form
    form_slides.reset();

    successNotification(
      "Successfully " +
        (for_update_id == "" ? "created" : "updated") +
        " stocks.",
      10
    );

    // Close Modal Form
    document.getElementById("modal_close").click();

    // Reload Page
    getDatas();
  }
  // Get response if 422 status code
  else if (response.status == 422) {
    const json = await response.json();

    // Close Modal Form
    document.getElementById("modal_close").click();

    errorNotification(json.message, 10);
  }

  // Always reset for_update_id to empty string
  for_update_id = "";

  document.querySelector("#form_slides button[type='submit']").disabled = false;
  document.querySelector("#form_slides button[type='submit']").innerHTML =
    "Submit";
};

// Delete Functionality
const deleteAction = async (e) => {
  // Use JS Confirm to ask for confirmation; You can use bootstrap modal instead of this
  if (confirm("Are you sure you want to delete?")) {
    // Get Id from data-id attrbute within the btn_delete anchor tag
    const id = e.target.getAttribute("data-id");

    // Background red the card that you want to delete
    document.querySelector(`[data-id="${id}"]`);

    // Fetch API Carousel Item Delete Endpoint
    const response = await fetch(backendURL + "/api/stock/" + id, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    // Get response if 200-299 status code
    if (response.ok) {
      // Uncomment for debugging purpose
      // const json = await response.json();
      // console.log(json);

      successNotification("Successfully deleted stock", 10);

      // Remove the Card from the list
      document.querySelector(`[data-id="${id}"]`).remove();
    }
    // Get response if 400+ or 500+
    else {
      errorNotification("Unable to delete!", 10);

      // Background white the card if unable to delete
      document.querySelector(`[data-id="${id}"]`);
    }
  }
};

// // Update Functionality
const editAction = async (e) => {
  // Get Id from data-id attrbute within the btn_edit anchor tag
  const id = e.target.getAttribute("data-id");

  // Show Functionality function call
  showData(id);

  // Show Modal Form
  document.getElementById("modal_show").click();
};

// Storage of Id of chosen data to update
let for_update_id = "";

// Show Functionality
const showData = async (id) => {
  // Background yellow the card that you want to show
  document.querySelector(`[data-id="${id}"]`);

  // Fetch API Carousel Item Show Endpoint
  const response = await fetch(backendURL + "/api/stock/" + id, {
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  });

  // Get response if 200-299 status code
  if (response.ok) {
    const json = await response.json();
    // console.log(json);

    // Store id to a variable; id will be utilize for update
    for_update_id = json.stock_id;

    // Display json response to Form tags; make sure to set id attrbute on tags (input, textarea, select)
    document.getElementById("inventory_id").value = json.inventory_id;
    document.getElementById("branch_id").value = json.branch_id;
    document.getElementById("movement_type").value = json.movement_type;
    document.getElementById("quantity").value = json.quantity;

    // Change Button Text using textContent; either innerHTML or textContent is fine here
    document.querySelector("#form_slides button[type='submit']").textContent =
      "Update Info";
  }
  // Get response if 400+ or 500+
  else {
    errorNotification("Unable to show!", 10);

    // Background white the card if unable to show
    document.querySelector(`.card[data-id="${id}"]`).style.backgroundColor =
      "white";
  }
};
// // Page Functionality
// const pageAction = async (e) => {
//   // Get url from data-url attrbute within the btn_paginate anchor tag
//   const url = e.target.getAttribute("data-url");

//   // Refresh card list
//   getDatas(url);
// };
const btn_logout = document.getElementById("btn_logout");
btn_logout.onclick = async () => {
  // Access Logout API Endpoint
  const response = await fetch(backendURL + "/api/logout", {
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  });

  // Get response if 200-299 status code
  if (response.ok) {
    // Clear Tokens
    localStorage.clear();

    successNotification("Logout Successful.");
    // Redirect Page
    window.location.pathname = "/";
  }
  // Get response if 400 or 500 status code
  else {
    const json = await response.json();

    errorNotification(json.message, 10);
  }
};
