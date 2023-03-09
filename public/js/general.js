function createErrorMessage(text, block = "errorMessageBlock") {
  document.getElementById(block).innerHTML = `<div class="alert alert-danger" role="alert">${text}</div>`;
}

function enterChat(data) {
  
  if (data.success) {
    window.location.href = `./chat.html?id=${ data.result.id }&login=${ data.result.login }`;
  } else {
    createErrorMessage(data.result);
  }
}