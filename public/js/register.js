const socket = io('http://localhost:18092/register');

document.getElementById('registerForm').addEventListener('submit', function(e) {

  e.preventDefault();

  let data = {
      login: document.getElementById('login').value,
      password: document.getElementById('password').value,
      repeat: document.getElementById('repeat').value,
  };

  socket.emit('register', data);
});

socket.on('register', enterChat);