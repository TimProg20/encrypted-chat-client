const request = window.location.search.substr(1).split("&");

let chatKeys = [];

let auth = {};

auth.id = Number(request[0].split('=')[1]);
auth.login = request[1].split('=')[1];

createKeyTable(auth.id);

removeKeys({ isActive: false });

const socket = io('http://localhost:18092/chat', {
  query: { userId: auth.id, userLogin: auth.login }
});

function showMessage(userId, userLogin, value, position = 'beforeend', color = 'warning') {
  document.querySelector(`.messagesBlock[data-user-id="${ userId }"]`).insertAdjacentHTML(position,
		`<div class="alert alert-${ color }" role="alert"><b>${ userLogin }:</b> ${ value }</div>`);
}

function initDialog(userId, userLogin, checkMessages) {

	let form = document.querySelector(`.messageForm[data-user-id="${ userId }"]`);

	form.addEventListener('submit', function(e) {

		e.preventDefault();

		let messageInput = document.querySelector(`.messageInput[data-user-id="${ userId }"]`);
	
		let request = {
      login: auth.login,
      message: {
        senderId: auth.id,
        receiverId: userId,
        value: messageInput.value
      }
    }

		socket.emit('createMessage', request);
		showMessage(userId, auth.login, messageInput.value, 'beforeend');
		messageInput.value = '';
	});

	if (checkMessages) {
    
		function showMoreMessages() {
			socket.emit('showMessages', {
        firstUser: { id: auth.id, login: auth.login },
        secondUser: {id: userId, login: userLogin},
				lastIndex: document.querySelector(`.userLink[data-user-id="${ userId }"]`).dataset.lastIndex,
				messagesCount: document.querySelector(`.userLink[data-user-id="${ userId }"]`).dataset.messagesCount,
			});
		}

    document.querySelector(`.showMessagesButton[data-user-id="${ userId }"]`).addEventListener('click', showMoreMessages);  
	}
}

function insertUserToList(block, user, position = 'beforeend') {
  document.getElementById(block).insertAdjacentHTML(position, 
    `<li class="list-group-item userLink cursorPointer" data-user-id="${ user.id }" data-user-login="${ user.login }"><span class="loginBlock">${ user.login }</span> <span class="circle bg-${ (user.isOnline) ? 'success' : 'danger' }"></span></li>`
  );
}

function insertUserWithTabToList(userBlock, tabBlock, user, position = 'beforeend') {

  console.log(document.getElementById(userBlock));

  const checkMessages = user.messagesCount > 0;

  document.getElementById(userBlock).insertAdjacentHTML(position, 
    `<li class="list-group-item list-group-item-action userLink" 
      data-user-id="${ user.id }" 
      data-messages-count="${ user.messagesCount }" 
      data-last-index="${ user.lastIndex }" 
      data-bs-toggle="list"
      href="#userTab-${ user.id }"><span class="loginBlock">${ user.login }</span> <span class="circle bg-${ (user.isOnline) ? 'success' : 'danger' }"></span></li>`
  );

  document.getElementById(tabBlock).insertAdjacentHTML('beforeend',
    `<div id="userTab-${ user.id }" class="tab-pane fade" role="tabpanel">
      ${(checkMessages) ? `<button class="btn btn-primary d-flex my-3 mx-auto showMessagesButton" data-user-id="${ user.id }">Показать сообщения</button>` : ""}
      <div class="messagesBlock" data-user-id="${ user.id }"></div>
      <form class="messageForm" data-user-id="${ user.id }">
        <div class="my-3">
          <div class="input-group messageInputBlock" data-user-id="${ user.id }">
          <input type="text" class="form-control messageInput" data-user-id="${ user.id }" placeholder="Write messsage..." aria-label="Write messsage..." required>
          <button class="btn btn-danger" type="submit">Send Message</button>
          </div>
        </div>
      </form>
    </div>`
  );

  initDialog(user.id, user.login, checkMessages);
}

async function initPage(data) {

  if (data.success) {

    let { success, result: keys } = await selectKeys();

    if (success) {

      chatKeys = keys;

      for(let user of data.result) {

        if (auth.id === user.id) {
          continue;
        }

        if (keys.findIndex(item => item.userId === user.id) === -1) {
          if (user.isOnline) {
            insertUserToList('newUsersList', user);
          }
        } else {
          insertUserWithTabToList('oldUsersList', 'dialogsBlock', user);
        }
      }
    }

  } else {
    createErrorMessage(data.result);
  }
}

socket.on('init', initPage);


socket.on('showMessages', function(data) {

  let secondUserId = data.result.secondUserId;

  console.log(data);

  document.querySelector(`.userLink[data-user-id="${ secondUserId }"]`).dataset.lastIndex = data.result.newLast;
	document.querySelector(`.userLink[data-user-id="${ secondUserId }"]`).dataset.messagesCount = data.result.newMessagesCount;

  data.result.results.forEach(function(item) {
    showMessage(secondUserId, item.senderLogin, item.value, 'afterbegin');
  });

  if (data.result.checkEnd) {
    document.querySelector(`.showMessagesButton[data-user-id="${ secondUserId }"]`).remove();
  }
});


socket.on('create', function(data) {

  if (data.success) {

    const request = {
      where: { userId: data.result, isActive: false },
      set: { isActive: true }
    }

    let elem = document.querySelector(`.userLink[data-user-id="${data.result}"]`);

    updateKeys(request);
    document.getElementById('newUsersList').querySelector(`.userLink[data-user-id="${data.result}"]`).remove();

    const userInfo = {
      id: data.result, 
      login: elem.dataset.userLogin, 
      messagesCount: 0,
      lastIndex: 0,
      isOnline: true 
    };

    insertUserWithTabToList('oldUsersList', 'dialogsBlock', userInfo);
  } else {
    createErrorMessage(data.result);
  }
});

document.getElementById('newUsersList').addEventListener('click', function (e) {
  socket.emit('create', { firstUser: auth.id, secondUser: Number(e.target.dataset.userId) });
});

socket.on('createKey', async function(data) {

  let response = (data.isInvited) ? { firstUserId: data.userId, secondUserId: auth.id, isInvited: data.isInvited } :
    { firstUserId: auth.id, secondUserId: data.userId, isInvited: data.isInvited };

  let createKeyResponse = await createKey({ key: data.secretKey, userId: data.userId, isActive: false });
  
  if (createKeyResponse.success) {
    socket.emit('createKey', response);
  } else {
    createErrorMessage(createKeyResponse.result);
  }

});

socket.on('userJoined', function(data) {
  
  if (auth.id !== data.userId) {

    toastr.success(`${data.userLogin} joined chat`);

    if (chatKeys.findIndex(item => item.userId === data.userId) === -1) {

      const userInfo = {
        id: data.userId,
        login: data.userLogin,
        isOnline: true
      }


      insertUserToList('newUsersList', userInfo);
    } else {

      let span = document.querySelector(`.userLink[data-user-id="${data.userId}"] > .circle`);

      console.log(span);

      span.classList.remove('bg-danger');
      span.classList.add('bg-success');
    }
  }
});

socket.on('userLeft', async function(data) {
  
  toastr.warning(`${data.userLogin} left chat`);

  let elem = document.getElementById('newUsersList').querySelector(`.userLink[data-user-id="${data.userId}"]`);

  removeKeys({ userId: data.userId, isActive: false });

  if (elem === null) {
    
    let span = document.querySelector(`.userLink[data-user-id="${data.userId}"] > .circle`);

    console.log(data.userId);
    console.log(span);

    span.classList.remove('bg-success');
    span.classList.add('bg-danger');
  } else {
    elem.remove();
  }
});

socket.on('createMessage', function(data) {
  console.log(data);
  showMessage(data.userId, data.login, data.value, 'beforeend');
  toastr.info(`New message from ${data.login}`);
});

document.getElementById('removeMyselfButton').addEventListener('click', function(e) {
  socket.emit('removeUser');
});

socket.on('removeUser', async function(data) {

  console.log(data);

  if (data.success) {

    if (data.result == auth.id) {
      await dropTableKeys();
      window.location.href = `./login.html`;
    } else {
      let userLink = document.querySelector(`.userLink[data-user-id="${data.result}"]`);

      console.log(data.result);
      console.log(userLink);
      userLink.querySelector('.loginBlock').innerHTML = 'DELETED';
      document.querySelector(`.messageInputBlock[data-user-id="${data.result}"]`).remove();
    }
  } else {
    createErrorMessage(data.result);
  }
});