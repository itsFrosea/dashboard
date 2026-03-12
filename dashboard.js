// =====================
// PAGE SWITCHING
// =====================

function openPage(id){

document.querySelectorAll(".page").forEach(p=>{
p.classList.remove("active")
})

document.getElementById(id).classList.add("active")

}


// =====================
// COMMAND MENU
// =====================

function toggleMenu(btn){

const menu = btn.nextElementSibling

document.querySelectorAll(".cmdDropdown").forEach(m=>{
if(m !== menu){
m.style.display = "none"
}
})

menu.style.display =
menu.style.display === "block" ? "none" : "block"

}


// close dropdown when clicking outside
document.addEventListener("click", e => {

if(!e.target.closest(".cmdMenu")){

document.querySelectorAll(".cmdDropdown").forEach(m=>{
m.style.display = "none"
})

}

})


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
<button onclick="toggleMenu(this)">⋮</button>

<div class="cmdDropdown">
<button onclick="deleteCommand('${cmd.command.trim()}')">Delete</button>
</div>
</div>
`

container.appendChild(row)

})

}catch(err){

console.error("Commands load failed:", err)

}

}


// =====================
// ADD COMMAND
// =====================

async function addCommand(){

const params = new URLSearchParams(window.location.search)
const channel = params.get("channel")

const command = document.getElementById("commandName").value
const response = document.getElementById("commandResponse").value

if(!command || !response){
alert("Command and response required")
return
}

await fetch(
"https://sharan-bot-kp71.onrender.com/command/add",
{
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify({
channel: channel,
command: command.trim(),
response: response
})
}
)

document.getElementById("commandName").value=""
document.getElementById("commandResponse").value=""

setTimeout(loadCommands,1500)

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
}
)

setTimeout(loadCommands,1000)

}


// =====================
// START PAGE
// =====================

openPage("leaderboard")

setInterval(loadLeaderboard,8000)
setInterval(loadCommands,8000)

loadLeaderboard()
loadCommands()