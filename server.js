const express = require('express');
const fs = require('fs');
const fsPromises = require('fs').promises;
const app = express();

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`listening in port ${port}`)
})

//simple log function to log output in a logfile
async function log(message) {

    let date = new Date();
    
    console.log(date.getFullYear() + "_" + (date.getMonth() + 1) + "_" + date.getDate() + " @ " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + " " + message);
  
    let oMsg = 
    date.getFullYear() + "_" 
    + String(date.getMonth() + 1).padStart(2,'0') + "_" 
    + String(date.getDate()).padStart(2,'0') + " @ " 
    + String(date.getHours()).padStart(2,'0') + ":" 
    + String(date.getMinutes()).padStart(2,'0') + ":" 
    + String(date.getSeconds()).padStart(2,'0') + "\n" 
    + message + "\n" + "========================="  + "\n";

    try {
        //create /log/log if not exist and if exist append message
        let stream = await fsPromises.mkdir('./log/', {recursive: true}).then( () => {
            fsPromises.writeFile("./log/log", oMsg ,{flag:'a'})
        });
        
        return {
            succes: true,
            data: message
        }

    } catch (error) {
        console.log(error)
        return {
            succes: false,
            data: error
        }
    }
}

app.get('/', function (req, res) {
    res.send('Hello World!');
});
  
app.get('/method/', async function (req, res) {
    res.send(await log("Das ist ein Test"));
});