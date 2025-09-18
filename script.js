const database = firebase.database().ref();
/**
 * @TODO get const references to the following elements:
 *      - div with id #all-messages
 *      - input with id #username
 *      - input with id #message
 *      - button with id #send-btn and the updateDB
 *        function as an onclick event handler
 */

const allMessages = document.querySelector('#all-messages');
const usernameElem = document.getElementById('username');
const messageElem = document.getElementById('message');
const emailElem = document.getElementById('email')
const sendBtn = document.getElementById('send-btn');
const imgElem = document.getElementById('profile')

/**
 * @TODO create a function called updateDB which takes
 * one parameter, the event, that:
 *      - gets the values of the input elements and stores
 *        the data in a temporary object with the keys USERNAME
 *        and MESSAGE
 *      - console.logs the object above
 *      - writes this object to the database
 *      - resets the value of #message input element
 */

sendBtn.onclick = updateDB

function updateDB(event) {

  event.preventDefault();

  let timedata = new Date();

  let data;

  if (imgElem.value != "") {
    data = {
      USERNAME: usernameElem.value,
      EMAIL: emailElem.value,
      MESSAGE: messageElem.value,
      DATE: `${timedata.getMonth() + 1}/${timedata.getDate()}/${timedata.getFullYear()}`,
      TIME: `${timedata.getHours()}:${timedata.getMinutes()}:${timedata.getSeconds()}`,
      IMG: imgElem.value
    };
  } else {
    data = {
      USERNAME: usernameElem.value,
      EMAIL: emailElem.value,
      MESSAGE: messageElem.value,
      DATE: `${timedata.getMonth() + 1}/${timedata.getDate()}/${timedata.getFullYear()}`,
      TIME: `${timedata.getHours()}:${timedata.getMinutes()}:${timedata.getSeconds()}`,
      IMG: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png'
    };
  }

  database.push(data)
  messageElem.value = "";
}

/**
 * @TODO add the addMessageToBoard function as an event
 * handler for the "child_added" event on the database
 * object
 */

database.on('child_added', addMessageToBoard)

/**
 * @TODO create a function called addMessageToBoard that
 * takes one parameter rowData which:
 *      - console.logs the data within rowData
 *      - creates a new HTML element for a single message
 *        containing the appropriate data
 *      - appends this HTML to the div with id
 *        #all-messages (we should have a reference already!)
 *
 */

function addMessageToBoard(rowData) {
  // Store the value of rowData inside object named 'data'
  // console.log data
  // Create a variable named singleMessage
  // that stores function call for makeSingleMessageHTML()
  // Append the new message HTML element to allMessages
  const data = rowData.val()
  let singleMessage = makeSingleMessageHTML(data.USERNAME, data.EMAIL, data.MESSAGE, data.DATE, data.TIME, data.IMG);
  allMessages.append(singleMessage)
}

/**
 * @TODO create a function called makeSingleMessageHTML which takes
 * two parameters, usernameTxt and messageTxt, that:
 *      - creates a parent div with the class .single-message
 *
 *      - creates a p tag with the class .single-message-username
 *      - update the innerHTML of this p to be the username
 *        provided in the parameter object
 *      - appends this p tag to the parent div
 *
 *      - creates a p tag
 *      - updates the innerHTML of this p to be the message
 *        text provided in the parameter object
 *      - appends this p tag to the parent div
 *
 *      - returns the parent div
 */

function makeSingleMessageHTML(usernameTxt, emailTxt, messageTxt, dateTxt, timeTxt, imgSrc) {
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

  let emailP = document.createElement('p');
  emailP.className = "single-message-email";
  emailP.innerHTML = emailTxt;
  parentDiv.append(emailP);

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

/**
 * @BONUS add an onkeyup event handler to the form HTML
 * element so the user can also submit the form with the
 * Enter key
 *
 * @BONUS use an arrow function
 */
