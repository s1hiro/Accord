const db = firebase.database().ref();
const userListElem = document.getElementById('user-list');
const adminDmList = document.getElementById('admin-dm-list');
const adminMessagesList = document.getElementById('admin-messages-list');
const selectedUser = document.getElementById('selected-user');

const DELETE_SVG = `
<svg fill="#000000" width="32px" height="32px" viewBox="-3 -2 24 24" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin" class="jam jam-trash"><path d='M6 2V1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1h4a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-.133l-.68 10.2a3 3 0 0 1-2.993 2.8H5.826a3 3 0 0 1-2.993-2.796L2.137 7H2a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h4zm10 2H2v1h14V4zM4.141 7l.687 10.068a1 1 0 0 0 .998.932h6.368a1 1 0 0 0 .998-.934L13.862 7h-9.72zM7 8a1 1 0 0 1 1 1v7a1 1 0 0 1-2 0V9a1 1 0 0 1 1-1zm4 0a1 1 0 0 1 1 1v7a1 1 0 0 1-2 0V9a1 1 0 0 1 1-1z'/></svg>
`;

function esc(str) {
  return (str || '').replace(/[<>&"]/g, s => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[s]));
}

function loadUsers() {
  userListElem.innerHTML = '';
  db.child('users').once('value').then(snap => {
    const users = snap.val();
    if (!users) {
      userListElem.innerHTML = '<p>No users found.</p>';
      console.log("No users found in DB.");
      return;
    }
    Object.keys(users).forEach(username => {
      if (username === localStorage.getItem('username')) return; // skip self

      let div = document.createElement('div');
      div.className = 'user-item';

      // Create avatar image element with fallback URL if profilePicture is missing
      const pfpImg = document.createElement('img');
      pfpImg.className = 'discord-avatar'; // reuse your existing DM avatar CSS class
      pfpImg.src = users[username].profilePicture || 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png';
      pfpImg.alt = `${username} profile picture`;
      pfpImg.style.marginRight = "8px";

      // Create username span
      const usernameSpan = document.createElement('span');
      usernameSpan.className = 'username';
      usernameSpan.textContent = username;

      // Create delete button with SVG icon
      const delBtn = document.createElement('button');
      delBtn.className = 'delete-icon';
      delBtn.title = `Delete ${username}?`;
      delBtn.innerHTML = DELETE_SVG;

      // Assemble user-item div: avatar, username, delete button
      div.appendChild(pfpImg);
      div.appendChild(usernameSpan);
      div.appendChild(delBtn);

      // Click to show DM partners
      div.onclick = e => {
        if (e.target.closest('.delete-icon')) return;
        showDmPartners(username);
      };

      // Delete button action
      delBtn.onclick = e => {
        e.stopPropagation();
        if (confirm(`Delete user '${username}' and all related data?`)) {
          deleteUserFully(username);
        }
      };

      userListElem.appendChild(div);
    });
  });
}

function showDmPartners(username) {
  selectedUser.textContent = username;
  adminDmList.innerHTML = '';
  adminMessagesList.innerHTML = '';
  db.child(`dms/${username}`).once('value').then(snap => {
    const partners = snap.val() ? Object.keys(snap.val()) : [];
    if (partners.length === 0) {
      adminDmList.innerHTML = '<div class="discord-message">No DM partners found.</div>';
      return;
    }
    partners.forEach(partner => {
      let div = document.createElement('div');
      div.className = 'user-item';
      div.innerHTML = `<span class="username">${esc(partner)}</span>`;
      div.onclick = () => showMessages(username, partner);
      adminDmList.appendChild(div);
    });
  });
}

function showMessages(user, partner) {
  adminMessagesList.innerHTML = '';
  const paths = [
    `dms/${user}/${partner}/messages/normList`,
    `dms/${partner}/${user}/messages/normList`
  ];
  Promise.all(paths.map(p => db.child(p).once('value'))).then(([s1, s2]) => {
    const msgs = [];

    // helper to safely add snapshot messages
    const addMsgs = (snap, path) => {
      const val = snap.val();
      if (!val) return;
      Object.entries(val).forEach(([k, v]) => {
        msgs.push({ key: k, val: v, path });
      });
    };

    addMsgs(s1, paths[0]);
    addMsgs(s2, paths[1]);

    msgs.sort((a, b) => (a.val.timestampNumeric || 0) - (b.val.timestampNumeric || 0));

    if (msgs.length === 0) {
      adminMessagesList.innerHTML = '<div class="discord-message">No messages found.</div>';
      return;
    }

    msgs.forEach(msg => {
      const d = document.createElement('div');
      d.className = 'discord-message';
      d.innerHTML = `
      <div class="discord-content">
        <div class="discord-top-row">
          <span class="discord-username">${esc(msg.key.split('_')[0])}</span>
          <span class="discord-time">${esc(msg.val.timestamp || '')}</span>
        </div>
        <div class="discord-text">${esc(msg.val.content)}</div>
      </div>
      <button class="delete-icon" title="Delete message">${DELETE_SVG}</button>
    `;

      d.querySelector('.delete-icon').onclick = e => {
        e.stopPropagation();
        if (confirm('Delete this message?')) {
          db.child(`${msg.path}/${msg.key}`).remove().then(() => d.remove());
        }
      };

      adminMessagesList.appendChild(d);
    });
  });
}

function deleteUserFully(username) {
  const updates = {};
  updates[`users/${username}`] = null;
  updates[`dms/${username}`] = null;
  db.child('users').once('value').then(snap => {
    Object.keys(snap.val() || {}).forEach(other => {
      updates[`users/${other}/friends/${username}`] = null;
      updates[`dms/${other}/${username}`] = null;
    });
    db.update(updates).then(() => {
      adminDmList.innerHTML = '';
      adminMessagesList.innerHTML = '';
      selectedUser.textContent = '';
      loadUsers();
    });
  });
}

document.getElementById('logout-btn').onclick = () => {
  localStorage.setItem('loginStatus', 'false');
  localStorage.removeItem('username');
  window.location.href = 'index.html';
};

loadUsers();