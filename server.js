const express = require('express');
const fs = require('fs');
const fsPromises = require('fs').promises;
//const { promisify } = require('util');
const app = express();
const path = require('path');
const cCTVs = require('./config.json');

const port = process.env.PORT || 5000;

//simple log function to log output in a logfile and console
async function log(message) {
    // check if log directory exists and create it if it doesn't exist
    try {
        await fsPromises.access('./log/', fs.constants.F_OK);
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log('"./log/" does not exist, will create...');

            await fsPromises.mkdir('./log/').catch((err) => {
                return {
                    status: "ERROR",
                    data: err
                }
            });
            console.log('..."./log/" created');
        } else {
            console.log(err);
            return {
                status: "ERROR",
                data: err
            }
        }
    }
    try {
        let date = new Date();

        let timeStmpdMsg =
        date.getFullYear() + "_" 
        + String(date.getMonth() + 1).padStart(2,'0') + "_" 
        + String(date.getDate()).padStart(2,'0') + " @ " 
        + String(date.getHours()).padStart(2,'0') + ":" 
        + String(date.getMinutes()).padStart(2,'0') + ":" 
        + String(date.getSeconds()).padStart(2,'0');
        
        console.log(timeStmpdMsg + " " + message);
        
        let oMsg =  timeStmpdMsg + "\n" + message + "\n" + "========================="  + "\n";
        
        fsPromises.writeFile("./log/log", oMsg ,{flag:'a'});
        
        return {
            status: 'succes',
            data: oMsg
        }
    } catch (err) {
        console.log(err)
        return {
            status: 'ERROR',
            data: err
        }
    }
};

async function clean() {
    let logMessage = "";
    const currentDate = new Date();

    //calculating termintation date
    currentDate.setDate(currentDate.getDate() - 7);
    let dd = String(currentDate.getDate()).padStart(2, '0');
    let mm = String(currentDate.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = currentDate.getFullYear();

    let terminationDate = yyyy + mm + dd;
    
    logMessage += `Deleting File before ${dd}.${mm}.${yyyy}:`;

    let timeElapsed = Date.now();

    for await( const cam of cCTVs) {
        let subDirs = await fsPromises.readdir(cam.path).catch((err) => console.log(err));
        for await(const item of subDirs) {
            if(item < terminationDate) {
                let dir = path.join(cam.path, item);
    
                fsPromises.rm(dir, {recursive: true}).catch((err) => console.log(err));
    
                logMessage += `\ndeleted: ${dir}`;
                //console.log(`deleted: ${dir}`);
                console.log(`Elapsed: ${Date.now() - timeElapsed}`);
            }
        }
    }
    log(logMessage);
    console.log(`final Elapsed: ${Date.now() - timeElapsed}`);

}

clean()


// app.get('/', function (req, res) {
//    res.send('Hello World!');
// });
 
// app.get('/method/', async function (req, res) {
//    res.send(await log("Das ist ein Test"));
// });

app.listen(port, () => {
    console.log(`listening in port ${port}`)
 })