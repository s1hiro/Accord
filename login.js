let username = document.getElementById("usernameInp").value;
let password = document.getElementById("passwordInp").value;
let loginbutton = document.querySelector("button");

loginbutton.onclick = function(event) {
    event.preventDefault(); // Prevent the default form submission

    

    // Here you would typically handle the signup logic, e.g., sending the data to your server
    console.log("Signing up with:", username, password);
};
