const database = firebase.database().ref();
const userFriendsref = firebase.database().ref(`users/${localStorage.getItem('username')}/friends`);
const dbDms = firebase.database().ref('dms');
const userDms = [];
let currDm = null;
let currReference;  
const userInput = document.getElementById('message');

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
      let combinedMessages = [];
      // Add click handler for this DM
      dmDiv.addEventListener('click', () => {
        const chatHeaderName = document.querySelector('.channel-name');
        if (chatHeaderName) {
          chatHeaderName.textContent = dm;
          userInput.placeholder = "Message " + dm;
        }

        const currentUser = localStorage.getItem('username');

        const userToFriendRef = dbDms.child(`${currentUser}/${dm}/messages/normList`).orderByChild('timestampNumeric');
        const friendToUserRef = dbDms.child(`${dm}/${currentUser}/messages/normList`).orderByChild('timestampNumeric');

        allMessages.innerHTML = "";
        combinedMessages = [];

        userToFriendRef.off();
        friendToUserRef.off();

        function addAndRenderMessage(snapshot) {
          const key = snapshot.key;
          const val = snapshot.val();

          // Add new message if not already in combinedMessages (to avoid duplicates)
          if (!combinedMessages.some(msg => msg.key === key)) {
            combinedMessages.push({ key: key, val: val });

            // Sort by numeric timestamp
            combinedMessages.sort((a, b) => a.val.timestampNumeric - b.val.timestampNumeric);

            // Clear and rerender all messages in order
            allMessages.innerHTML = "";
            combinedMessages.forEach(msg => {
              const username = msg.key.split('_')[0];
              messageLoader({ key: msg.key, val: () => msg.val });
            });
            allMessages.scrollTop = allMessages.scrollHeight;
          }
        }

        userToFriendRef.on('child_added', addAndRenderMessage);
        friendToUserRef.on('child_added', addAndRenderMessage);
      });


      dmSection.appendChild(dmDiv);
    });
  }
});

const logout = document.querySelector('.back-btn');

logout.onclick = function () {
  localStorage.setItem('loginStatus', 'false');
  localStorage.removeItem('username');
  window.location.href = 'index.html';
};

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

function padZero(num) {
  return num.toString().padStart(2, '0');
}

// sidebar user info
document.addEventListener('DOMContentLoaded', () => {
  const usernameElem = document.getElementById('sidebar-user');
  const imgSrc = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png"
  usernameElem.textContent = localStorage.getItem('username') || 'Login!  ';
  const pfpElem = document.getElementById('sidebar-pfp');
  pfpElem.src = imgSrc;
});

function messageSender(event) {
  event.preventDefault();

  const timedata = new Date();
  const username = localStorage.getItem('username');
  const messageElem = document.getElementById('message');
  const dm = document.querySelector('.channel-name').textContent.trim();

  if(!messageElem.value) {
    userInput.placeholder = "Please write something!";
    userInput.focus();
    setTimeout(() => {
      userInput.placeholder = "Message " + dm;
      userInput.unfocus();
    }, 5000);
    return;
  }

  if (!dm) {
    alert('Please select a DM to send a message.');
    return;
  }

  let timestampKey = `${timedata.getFullYear()}-${(timedata.getMonth() + 1).toString().padStart(2, '0')}-${timedata.getDate().toString().padStart(2, '0')}-${timedata.getHours().toString().padStart(2, '0')}${timedata.getMinutes().toString().padStart(2, '0')}${timedata.getSeconds().toString().padStart(2, '0')}`;

  let customKey = `${username}_${timestampKey}`;

  let data = {
    content: messageElem.value,
    timestamp: `${padZero(timedata.getMonth() + 1)}/${padZero(timedata.getDate())}/${timedata.getFullYear()} ${padZero(timedata.getHours())}:${padZero(timedata.getMinutes())}`,
    timestampNumeric: timedata.getTime()  // Numeric timestamp in milliseconds
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
    if (localStorage.getItem('loginStatus') === 'true') {
      localStorage.setItem('lastPage', 'mainscreen.html');
      window.location.href = 'add-friends.html';
    } else {
      alert('You must be logged in to add friends.');
      window.location.href = 'login.html';
    }
  });
});