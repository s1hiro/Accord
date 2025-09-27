let users;
const allUsernames = [];

firebase.database().ref('users').once('value').then(snapshot => {
    if (snapshot.exists()) {
        users = snapshot.val();
        console.log(users);

        for (let user in users) {
            allUsernames.push({
                username: user,
                pfp: users[user].profilePicture || 'https://i.pinimg.com/originals/9e/83/75/9e837528f01cf3f42119c5aeeed1b336.jpg?nii=t'
            });
        }
    }
}).catch((error) => {
    console.error(error);
});

console.log(allUsernames);
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    searchResults.innerHTML = '';
    if (searchTerm === '') { return; };

    const matches = allUsernames.filter(u => u.username.includes(searchTerm));
    matches.forEach(({ username, pfp }) => {
        const userDiv = document.createElement('div');
        userDiv.className = 'user-result';

        const pfpImg = document.createElement('img');
        pfpImg.className = 'pfp';
        pfpImg.src = pfp;

        const at = document.createElement('span');
        at.className = 'at-symbol';
        at.textContent = '@';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'username';
        nameSpan.textContent = username;

        const addBtn = document.createElement('button');
        addBtn.className = 'add-btn';
        addBtn.textContent = 'Add Friend';
        addBtn.onclick = () => {
            if (localStorage.getItem('loginStatus') !== 'true') {
                alert("You must be logged in to add friends.");
                window.location.href = "login.html";
                return;
            }

            const currentUser = localStorage.getItem('username');
            const friendUser = nameSpan.textContent;

            if (!users[friendUser]) {
                alert("User not found.");
                return;
            }

            let friendList = users[currentUser]?.friends;
            if (!Array.isArray(friendList)) {
                friendList = [];
            }

            if (!friendList.includes(friendUser)) {
                const userFriendRef = firebase.database().ref(`users/${currentUser}/friends`);

                userFriendRef.once('value').then(snapshot => {
                    if (snapshot.exists()) {
                        return userFriendRef.push(friendUser);
                    }
                }).then(() => {
                    addBtn.disabled = true;
                    addBtn.textContent = 'Friended';
                }).catch(error => {
                    console.error("Error adding friend:", error);
                    alert("Failed to add friend. Try again.");
                });
            } else {
                addBtn.disabled = true;
                addBtn.textContent = 'Friended';
            }
        };


        userDiv.appendChild(pfpImg);
        userDiv.appendChild(at);
        userDiv.appendChild(nameSpan);
        userDiv.appendChild(addBtn);

        searchResults.appendChild(userDiv);
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const backBtn = document.getElementById("backBtn");
    backBtn.addEventListener("click", () => {
        const lastPage = localStorage.getItem("lastPage");
        if (lastPage) {
            window.location.href = lastPage;
        } else {
            // Fallback if lastPage not set
            window.history.back();
        }
    });
});