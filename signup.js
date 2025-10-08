let username = document.getElementById("usernameInp");
let password = document.getElementById("passwordInp");
let signupbutton = document.getElementById("submitBtn");
const database = firebase.database().ref()
const usersRef = database.child("users");
const dmsRef = database.child("dms");
let users = null;

usersRef.get().then((snapshot) => {
    if (snapshot.exists()) {
        users = snapshot.val();
        console.log(users);
    } else {
        console.log("No data available");
    }
}).catch((error) => {
    console.error(error);
});

signupbutton.onclick = function (event) {
    event.preventDefault(); // Prevent the default form submission

    let canCreate = true;
    if (/\s/.test(username.value) || /\s/.test(password.value)) {
    canCreate = false;
    alert("Username and password cannot contain spaces.");
    }


    if (canCreate) {
        if (username.value !== "" && password.value !== "") {
        // Check reserved name first
        if (["admin", "Admin", "ADMIN"].includes(username.value)) {
            canCreate = false;
            alert("admin is reserved. Please choose another username.");
        } else {
            // Then check if username already exists
            for (let user in users) {
                if (user === username.value) {
                    canCreate = false;
                    alert("Username already exists, please choose another one.");
                    break;
                }
            }
        }
    } else {
        canCreate = false;
        alert("Please fill out both fields.");
    }
    }

    if (canCreate) {
        const newEntry = usersRef.child(username.value);
        let timedata = new Date();
        newEntry.set({
            password: password.value,
            datejoined: {
                month: timedata.getMonth() + 1,
                day: timedata.getDate(),
                year: timedata.getFullYear()
            },
            description: "Hello my name is " + username.value + "!",
            profilePicture: "https://i.pinimg.com/originals/9e/83/75/9e837528f01cf3f42119c5aeeed1b336.jpg?nii=t"
        });
        localStorage.setItem('username', username.value);
        localStorage.setItem('loginStatus', 'true');
        window.location.href = "mainscreen.html";
    }

    username.value = "";
    password.value = "";
}