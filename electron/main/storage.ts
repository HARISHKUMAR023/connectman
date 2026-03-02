import fs from 'fs'
import path from 'path'

const filePath = path.join(
 process.cwd(),
 "data",
 "servers.json"
)

function loadServers(){

if(!fs.existsSync(filePath)){

fs.writeFileSync(filePath,
JSON.stringify({servers:[]})
)

}

const data=fs.readFileSync(filePath)

return JSON.parse(data)

}


function saveServer(server){

const data=loadServers()

data.servers.push(server)

fs.writeFileSync(
filePath,
JSON.stringify(data,null,2)
)

}

module.exports={
 loadServers,
 saveServer
}