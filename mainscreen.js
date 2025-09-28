const database = firebase.database().ref();
const userFriendsref = firebase.database().ref(`users/${localStorage.getItem('username')}/friends`);
const dbDms = firebase.database().ref('dms');
const userDms = [];
let currDm = null;
let currReference;

userFriendsref.once('value').then(snapshot => {
  const friendsList = snapshot.val(); // This gets the friends data once loaded
  if (friendsList) {
    for (const friend in friendsList) {
      userDms.push(friend);
    }
    const dmSection = document.getElementById('online-dms');

    userDms.forEach(dm => {
      const dmDiv = document.createElement('div');
      dmDiv.className = 'user-item';
      dmDiv.innerHTML = `
      <div class="user-avatar">
        <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png" alt="User">
        <div class="status-indicator online"></div>
      </div>
      <span id="dm-${dm}" class="username">${dm}</span>`;

      // Add click handler for this DM
      dmDiv.addEventListener('click', () => {
        const chatHeaderName = document.querySelector('.channel-name');
        if (chatHeaderName) chatHeaderName.textContent = dm;

        const currentUser = localStorage.getItem('username');
        const userToFriendRef = dbDms.child(`${currentUser}/${dm}/messages/normList`);
        const friendToUserRef = dbDms.child(`${dm}/${currentUser}/messages/normList`);

        allMessages.innerHTML = "";

        // Load messages user -> friend
        userToFriendRef.once('value').then(snapshotUser => {
          // Load messages friend -> user
          friendToUserRef.once('value').then(snapshotFriend => {
            // Combine messages from both refs into one array
            let combinedMessages = [];

            snapshotUser.forEach(childSnapshot => {
              combinedMessages.push({ key: childSnapshot.key, val: childSnapshot.val() });
            });

            snapshotFriend.forEach(childSnapshot => {
              combinedMessages.push({ key: childSnapshot.key, val: childSnapshot.val() });
            });

            // Sort combined messages by timestamp string ascending
            combinedMessages.sort((a, b) => {
              if (a.val.timestamp < b.val.timestamp) return -1;
              if (a.val.timestamp > b.val.timestamp) return 1;
              return 0;
            });

            // Render messages in order
            combinedMessages.forEach(msg => {
              // Extract username from key (username_timestamp)
              const username = msg.key.split('_')[0];
              messageLoader({ key: msg.key, val: () => msg.val }); // Adapt messageLoader if needed to accept object with key and val method
            });
          });
        });
      });

      dmSection.appendChild(dmDiv);
    });
    // Now userDms contains the actual list of user's friends
    console.log('User friends loaded:', userDms);
  }
});

const allMessages = document.querySelector('#all-messages');
const sendBtn = document.getElementById('send-btn');
sendBtn.onclick = messageSender;

console.log(localStorage.getItem('username'));
console.log(localStorage.getItem('loginStatus'));

// sidebar toggler
document.addEventListener('DOMContentLoaded', function () {
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');

  sidebarToggle.addEventListener('click', function () {
    const isCollapsed = sidebar.classList.toggle('collapsed');

    // Change the SVG path based on collapsed state
    const svg = this.querySelector('svg');
    const path = svg.querySelector('path');
    if (isCollapsed) {
      path.setAttribute('d', 'M13 8l4 4-4 4');
    } else {
      path.setAttribute('d', 'M17 16l-4-4 4-4');
    }
  });
});

// sidebar user info
document.addEventListener('DOMContentLoaded', () => {
  const usernameElem = document.getElementById('sidebar-user');
  const imgSrc = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png"
  usernameElem.textContent = localStorage.getItem('username') || 'Guest';
  const pfpElem = document.getElementById('sidebar-pfp');
  pfpElem.src = imgSrc;
});

function messageSender(event) {
  event.preventDefault();

  const timedata = new Date();
  const username = localStorage.getItem('username');
  const messageElem = document.getElementById('message');
  const dm = document.querySelector('.channel-name').textContent.trim();

  if (!dm) {
    alert('Please select a DM to send a message.');
    return;
  }

  let timestampKey = `${timedata.getFullYear()}-${(timedata.getMonth() + 1).toString().padStart(2, '0')}-${timedata.getDate().toString().padStart(2, '0')}-${timedata.getHours().toString().padStart(2, '0')}${timedata.getMinutes().toString().padStart(2, '0')}${timedata.getSeconds().toString().padStart(2, '0')}`;

  let customKey = `${username}_${timestampKey}`;

  let data = {
    content: messageElem.value,
    timestamp: `${timedata.getMonth() + 1}/${timedata.getDate()}/${timedata.getFullYear()} ${timedata.getHours()}:${timedata.getMinutes()}`
  };

  const dmRef = dbDms.child(`${username}/${dm}/messages/normList`);

  dmRef.child(customKey).set(data)
    .then(() => {
      messageElem.value = "";
      console.log('Message sent with key:', customKey);
    })
    .catch(error => {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + error.message);
    });
}


//userDms.on('child_added', messageLoader)

function messageLoader(rowData) {
  const data = rowData.val()
  const key = rowData.key; // This is the message key, e.g. "username_timestamp"

  // Extract the username from the key by splitting at "_" if you used "username_timestamp"
  const username = key.split('_')[0];
  let singleMessage = makeSingleMessageHTML(username, data.content, data.timestamp);
  allMessages.append(singleMessage)
}

function makeSingleMessageHTML(usernameTxt, messageTxt, timestampTxt) {
  let parentDiv = document.createElement("div");
  parentDiv.className = 'discord-message';

  let imgSrc = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png"
  let avatar = document.createElement("img");
  avatar.className = 'discord-avatar';
  avatar.src = imgSrc;

  let contentDiv = document.createElement("div");
  contentDiv.className = 'discord-content';

  let topRow = document.createElement("div");
  topRow.className = 'discord-top-row';
  let userSpan = document.createElement("span");
  userSpan.className = 'discord-username';
  userSpan.textContent = usernameTxt;
  let timeSpan = document.createElement("span");
  timeSpan.className = 'discord-time';
  timeSpan.textContent = `${timestampTxt}`;
  topRow.appendChild(userSpan);
  topRow.appendChild(timeSpan);

  let msgDiv = document.createElement("div");
  msgDiv.className = 'discord-text';
  msgDiv.textContent = messageTxt;

  contentDiv.appendChild(topRow);
  contentDiv.appendChild(msgDiv);
  parentDiv.appendChild(avatar);
  parentDiv.appendChild(contentDiv);

  return parentDiv;
}

//add friends redirect
document.addEventListener('DOMContentLoaded', () => {
  const addFriendsBtn = document.getElementById('add-friends-btn');
  addFriendsBtn.addEventListener('click', () => {
    localStorage.setItem('lastPage', 'mainscreen.html');
    window.location.href = 'add-friends.html';
  });
});