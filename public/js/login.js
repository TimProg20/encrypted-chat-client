const socket = io('http://localhost:18092/login');

document.getElementById('loginForm').addEventListener('submit', function(e) {

  e.preventDefault();

  let data = {
      login: document.getElementById('login').value,
      password: document.getElementById('password').value,
  };

  socket.emit('login', data);
});

socket.on('login', enterChat);