const express = require('express');
const app = express();
const fs = require("fs");
const http = require('http').Server(app);
const path = require('path');
const port = process.env.PORT || 3000;

app.use(express.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine','ejs');
http.listen(port);

const {Server} = require('socket.io');
const io = new Server(http);

io.on("connection", socket => {
    console.log(`${socket.id} is now online`);
    socket.emit("greetings", `Your socket id is ${socket.id}`);

    socket.on("message", (data) => {
        io.emit("message", data);
      console.log(data);
    });

});

app.get('/', (req, res) => {
  fs.readFile(path.join(__dirname, 'data/users.json'), (err, data)=>
  {
      const userData = JSON.parse(data.toString());
      if(err) throw err;
      res.render('./index', {userData});
  });
});

app.post('/add', (req, res) =>{
  fs.readFile(path.join(__dirname, 'data/users.json'), (err, data) =>{
      if (err) throw err;
      const userData = JSON.parse(data.toString());
      userData.push(req.body);
      fs.writeFile(path.join(__dirname, 'data/users.json'), JSON.stringify(userData), err =>
      {
          if(err) throw err;
      });
  });
  res.redirect('/');
});

app.get('/delete/:userId', (req, res) =>{
  fs.readFile(path.join(__dirname, 'data/users.json'), (err, data) =>{
      if (err) throw err;
      const userData = JSON.parse(data.toString());
      userData.splice(userData.findIndex(x => x.id == req.params.userId), 1);
      fs.writeFile(path.join(__dirname, 'data/users.json'), JSON.stringify(userData), err =>
      {
          if(err) throw err;
      });
  });
  res.redirect('/');
});