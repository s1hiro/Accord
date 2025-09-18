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

