let username = document.getElementById("usernameInp").value;
let password = document.getElementById("passwordInp").value;
let signupbutton = document.querySelector("button");


signupbutton.onclick = function (event) {
    event.preventDefault(); // Prevent the default form submission

    if (username != "" && password != "") {
        for (let i = 0; i < database.length; i++) {
            if (database[i].USERNAME == username) {
                alert("Username already exists. Please choose a different username.");
                break;
            } else {    
                database.push({
                    USERNAME: username,
                    PASSWORD: password
                });
            }
        }

        // Here you would typically handle the signup logic, e.g., sending the data to your server
        console.log("Signing up with:", username, password);
    };
}
