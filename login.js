let usernameInp = document.getElementById("usernameInp");
let passwordInp = document.getElementById("passwordInp");
let loginbutton = document.getElementById("login");
const database = firebase.database().ref()
let usersRef = firebase.database().ref('users');

function getObjectFromDB(usr, pswd) {
    // Construct the path to the specific user based on the username
    const objectRef = usersRef.child(usr);

    objectRef.once("value").then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            localStorage.setItem('username', userData.username);
            localStorage.setItem('loginStatus', 'false');
            // Check if the password from the input matches the password in the database
            if (userData.password === pswd) {
                console.log("Login successful! Welcome,", userData.username);
                localStorage.setItem("loginStatus", "true");
                window.location.href = "mainscreen.html";
            } else {
                alert("Incorrect password. Please try again.");
                console.log("Password mismatch.")
            }
        } else {
            alert("No user found with the provided username.");
            console.log("No data available at the specified path.");
        }
    }).catch((error) => {
        console.error("Error fetching object:", error);
    });
}


loginbutton.onclick = function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Get the values from the input fields
    const username = usernameInp.value;
    const password = passwordInp.value;

    // Check that the input fields are not empty
    if (username && password) {
        // Call the function to check against the database
        getObjectFromDB(username, password);
    } else {
        alert("Please enter both username and password.");
    }
};