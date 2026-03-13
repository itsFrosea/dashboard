let selectedCommand = null

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
// CONTEXT MENU
// =====================

function showContextMenu(e, command){

e.preventDefault()

selectedCommand = command.trim()

const menu = document.getElementById("contextMenu")

menu.style.display = "block"

menu.style.left = e.pageX + "px"
menu.style.top = e.pageY + "px"

}


// close context menu when clicking anywhere
document.addEventListener("click", ()=>{

const menu = document.getElementById("contextMenu")

if(menu){
menu.style.display = "none"
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

<button class="menuBtn" onclick="toggleMenu(this)">
⋮
</button>

<div class="cmdPopup">
<button onclick="deleteCommand('${cmd.command.replace(/'/g,"")}')">
🗑 Delete
</button>
</div>

</div>
`

// RIGHT CLICK MENU
row.oncontextmenu = (e)=> showContextMenu(e, cmd.command)

container.appendChild(row)

})

}catch(err){

console.error("Commands load failed:", err)

}

}

function toggleMenu(btn){

const popup = btn.nextElementSibling

document.querySelectorAll(".cmdPopup").forEach(p=>{
if(p !== popup){
p.style.display = "none"
}
})

popup.style.display =
popup.style.display === "block" ? "none" : "block"

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

// if called from context menu
if(!command){
command = selectedCommand
}

if(!command) return

await fetch(
"https://sharan-bot-kp71.onrender.com/command/delete",
{
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify({
channel: channel,
command: command.trim()
})
}
)

selectedCommand = null

loadCommands()

}

// =====================
// CONTEXT MENU DELETE
// =====================

const deleteBtn = document.getElementById("deleteCommandBtn")

if(deleteBtn){
deleteBtn.onclick = deleteCommand
}

async function saveMedals(){

const params = new URLSearchParams(window.location.search)
const channel = params.get("channel")

const enabled =
document.getElementById("medalsEnabled").checked

await fetch(
"https://sharan-bot-kp71.onrender.com/medals/set",
{
method:"POST",
headers:{ "Content-Type":"application/json" },

body: JSON.stringify({
channel: channel,
enabled: enabled
})
}
)

alert("Medal settings saved")

}

async function loadSettings(){

const params = new URLSearchParams(window.location.search)
const channel = params.get("channel")

if(!channel) return

try{

const res = await fetch(
`https://sharan-bot-kp71.onrender.com/settings?channel=${channel}`
)

const data = await res.json()

if(data.medals_enabled !== undefined){

document.getElementById("medalsEnabled").checked =
Boolean(data.medals_enabled)

}

}catch(err){

console.error("Settings load failed:", err)

}

}


// =====================
// START PAGE
// =====================

openPage("leaderboard")

setInterval(loadLeaderboard,8000)
setInterval(loadCommands,8000)

loadLeaderboard()
loadCommands()
loadSettings()