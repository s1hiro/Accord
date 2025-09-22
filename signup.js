let username = document.getElementById("usernameInp");
let password = document.getElementById("passwordInp");
let signupbutton = document.getElementById("submitBtn");
const database = firebase.database().ref()
const usersRef = database.child("users");
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
    for (let i = 0; i < username.value.length; i++) {
        if (username.value[i] === " ") {
            canCreate = false;
            alert("Username cannot contain spaces.");
            break;
        }
    }

    for (let i = 0; i < password.value.length; i++) {
        if (password.value[i] === " ") {
            canCreate = false;
            alert("Password cannot contain spaces.");
            break;
        }
    }


    if (canCreate) {
        if (username.value !== "" && password.value !== "") {
            for (let user in users) {
                if (user === username.value) {
                    canCreate = false;
                    alert("Username already exists, please choose another one.");
                    break;
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
            friends: [],
            groupchats: [],
            datejoined: {
                month: timedata.getMonth() + 1,
                day: timedata.getDate(),
                year: timedata.getFullYear()
            },
            description: "",
            profilePicture: ""
        });
    }

    username.value = "";
    password.value = "";
}