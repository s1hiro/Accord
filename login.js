let usernameInp = document.getElementById("usernameInp");
let passwordInp = document.getElementById("passwordInp");
let loginbutton = document.getElementById("login");
const database = firebase.database().ref()
let usersRef = firebase.database().ref('users');
let adminData;

function getObjectFromDB(usr, pswd) {
    if (["admin", "Admin", "ADMIN"].includes(usr)) {
        const adminRef = usersRef.child("admin");

        adminRef.once("value")
            .then((adminSnap) => {
                if (!adminSnap.exists()) {
                    alert("Admin account not found in database.");
                    return;
                }

                const adminData = adminSnap.val();

                if (adminData.password !== pswd) {
                    alert("Incorrect admin password.");
                    return;
                }

                // 🔒 Load the admin security question
                return database.child("admin/question").once("value");
            })
            .then((snap) => {
                if (!snap) return; // means previous return happened early

                const qData = snap.val();

                if (!qData) {
                    // 🟡 Admin has no question — create form
                    document.body.innerHTML = `
                    <div class="page-container">
                        <div class="form-box">
                        <h2 class="form-header">Admin Security Setup</h2>

                        <div class="form-group">
                            <input id="secQuestion" type="text" autocomplete="off" class="input-field" placeholder="Enter your security question" />
                        </div>

                        <div class="form-group">
                            <input id="secAnswer" type="text" autocomplete="off" class="input-field" placeholder="Enter your answer" />
                        </div>

                        <button id="saveQuestion" class="action-button">Save</button>
                        </div>
                    </div>
                `;

                    document.getElementById("saveQuestion").onclick = () => {
                        const q = document.getElementById("secQuestion").value.trim();
                        const a = document.getElementById("secAnswer").value.trim();
                        if (!q || !a) return alert("Please fill both fields.");

                        database.child("admin/question").set({ secQuestion: q, answer: a }).then(() => {
                            alert("Admin security question saved!");
                            localStorage.setItem("username", "admin");
                            localStorage.setItem("loginStatus", "true");
                            window.location.href = "admin-panel.html";
                        });
                    };
                    return;
                }

                // ✅ Security question exists — show verification form
                document.body.innerHTML = `
                <div class="page-container">
                    <div class="form-box">
                    <h2 class="form-header">Security Verification</h2>

                    <p class="form-question">${qData.secQuestion}</p>

                    <div class="form-group">
                        <input id="securityAnswer" type="text" autocomplete="off" class="input-field" placeholder="Enter your answer" />
                    </div>

                    <button id="verifyBtn" class="action-button">Submit</button>
                    </div>
                </div>
            `;

                document.getElementById("verifyBtn").onclick = () => {
                    const answer = document.getElementById("securityAnswer").value.trim();

                    if (answer.toLowerCase() === qData.answer.toLowerCase()) {
                        alert("Access granted!");
                        localStorage.setItem("username", "admin");
                        localStorage.setItem("loginStatus", "true");
                        window.location.href = "admin-panel.html";
                    } else {
                        const inpForm = document.getElementById("securityAnswer");
                        inpForm.value = "";
                        inpForm.focus();
                        inpForm.placeholder = "Incorrect answer, try again.";
                        inpForm.style.width = "350px";
                        setTimeout(() => {
                            inpForm.style.width = "fit-content";
                            inpForm.placeholder = "Enter your answer";
                        }, 1500);
                    }
                };
            })
            .catch((err) => console.error("Error fetching admin question:", err));
    } else {

        // Construct the path to the specific user based on the username
        const objectRef = usersRef.child(usr);

        objectRef.once("value").then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                localStorage.setItem('username', usr);
                localStorage.setItem('loginStatus', 'false');
                // Check if the password from the input matches the password in the database
                if (userData.password === pswd) {
                    console.log("Login successful! Welcome,", usr);
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
}


loginbutton.onclick = function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Get the values from the input fields
    const username = usernameInp.value;
    const password = passwordInp.value;

    if (username && password) {
        // Normal user login
        getObjectFromDB(username, password);
    } else {
        alert("Please enter both username and password.");
    }
};