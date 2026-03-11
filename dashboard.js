function toggleSidebar(){

const sidebar = document.getElementById("sidebar")

if(sidebar.style.display === "none"){
sidebar.style.display = "block"
}else{
sidebar.style.display = "none"
}

}


function openPage(id){

document.querySelectorAll(".page").forEach(p=>{
p.classList.remove("active")
})

document.getElementById(id).classList.add("active")

}


// =====================
// LOAD LEADERBOARD
// =====================
async function loadLeaderboard(){

const params = new URLSearchParams(window.location.search)
const channel = params.get("channel")

if(!channel){
console.log("No channel in URL")
return
}

try{

const res = await fetch(
`https://sharan-bot-kp71.onrender.com/leaderboard?channel=${channel}`
)

const data = await res.json()

const table = document.querySelector("#leaderboardTable tbody")

table.innerHTML = ""

if(!data || data.length === 0){

table.innerHTML = `<tr><td colspan="2">No data yet</td></tr>`
return

}

data.forEach((user,i)=>{

const row = document.createElement("tr")

row.innerHTML = `
<td>${i+1}. ${user.username}</td>
<td>${user.points}</td>
`

table.appendChild(row)

})

}catch(err){

console.error("Leaderboard load failed:", err)

}

}


// =====================
// LOAD COMMANDS
// =====================
async function loadCommands(){

const params = new URLSearchParams(window.location.search)
const channel = params.get("channel")

if(!channel){
console.log("No channel")
return
}

try{

const res = await fetch(
`https://sharan-bot-kp71.onrender.com/commands?channel=${channel}`
)

const data = await res.json()

const container = document.getElementById("commandsList")

container.innerHTML = ""

if(!data || data.length === 0){
container.innerHTML = "<p>No commands yet</p>"
return
}

data.forEach(cmd=>{

const row = document.createElement("div")

row.className = "commandRow"

row.innerHTML = `
<div class="cmdName">${cmd.command}</div>
<div class="cmdResponse">${cmd.response}</div>

<div class="cmdMenu">
<button onclick="deleteCommand('${cmd.command}')">⋮</button>
</div>
`

container.appendChild(row)

})

}catch(err){

console.error("Commands load failed:", err)

}

}


// =====================
// DELETE COMMAND
// =====================
async function deleteCommand(command){

const params = new URLSearchParams(window.location.search)
const channel = params.get("channel")

await fetch(
"https://sharan-bot-kp71.onrender.com/command/delete",
{
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify({
channel: channel,
command: command
})
})

loadCommands()

}


// =====================
// START PAGE
// =====================

openPage("leaderboard")

setInterval(loadLeaderboard, 3000)
setInterval(loadCommands, 3000)

loadLeaderboard()
loadCommands()