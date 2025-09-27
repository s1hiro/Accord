const database = firebase.database().ref(); 
const userFriends = firebase.database().ref(`users/${localStorage.getItem('username')}/friends`);
const dbDms = firebase.database().ref('dms');
const userDms = [];
userFriends.once('value').then(snapshot => {
  const friendsList = snapshot.val(); // This gets the friends data once loaded
  if (friendsList) {
    for (const friend in friendsList) {
      userDms.push(friend);
    }
    // Now userDms contains the actual list of user's friends
    console.log('User friends loaded:', userDms);
  }
});
const allMessages = document.querySelector('#all-messages');
const sendBtn = document.getElementById('send-btn');
sendBtn.onclick = updateDB

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

function updateDB(event) {

  event.preventDefault();

  let timedata = new Date();

  let data = {
    USERNAME: usernameElem.value,
    MESSAGE: messageElem.value,
    DATE: `${timedata.getMonth() + 1}/${timedata.getDate()}/${timedata.getFullYear()}`,
    TIME: `${timedata.getHours()}:${timedata.getMinutes()}}`,
  }

  userDms.push(data)
  messageElem.value = "";
}


//userDms.on('child_added', addMessageToBoard) 

function addMessageToBoard(rowData) {
  const data = rowData.val()
  let singleMessage = makeSingleMessageHTML(data.USERNAME, data.MESSAGE, data.DATE, data.TIME);
  allMessages.append(singleMessage)
}

function makeSingleMessageHTML(usernameTxt, messageTxt, dateTxt, timeTxt) {
  let parentDiv = document.createElement("div")
  parentDiv.className = 'single-message'

  let image = document.createElement("img");
  image.className = "single-message-img";
  image.src = imgSrc;
  parentDiv.append(image);

  let usernameP = document.createElement("p");
  usernameP.className = 'single-message-username';
  usernameP.innerHTML = usernameTxt + ':';
  parentDiv.append(usernameP);

  let messageP = document.createElement("p");
  messageP.innerHTML = messageTxt;
  parentDiv.append(messageP);

  let dateP = document.createElement('p');
  dateP.className = "single-message-date";
  dateP.innerHTML = dateTxt;
  parentDiv.append(dateP);

  let timeP = document.createElement('p');
  timeP.className = "single-message-time";
  timeP.innerHTML = timeTxt;
  parentDiv.append(timeP);


  return parentDiv;
}

document.addEventListener('DOMContentLoaded', () => {
  const addFriendsBtn = document.getElementById('add-friends-btn');
  addFriendsBtn.addEventListener('click', () => {
    localStorage.setItem('lastPage', 'mainscreen.html');
    window.location.href = 'add-friends.html';
  });
});