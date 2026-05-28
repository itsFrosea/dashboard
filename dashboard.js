console.log("JS LOADED");
let selectedCommand = null;
let editingCommand = null;
let editingTimed = null;

(function initAuth(){

    const params = new URLSearchParams(window.location.search)

    const token = params.get("token")
    const channel = params.get("channel")

    if(token && channel){
        console.log("Saving token:", token)

        localStorage.setItem("twitch_token", token)
        localStorage.setItem("twitch_user", channel)

        // only clean AFTER confirm
        window.history.replaceState({}, document.title, `?channel=${channel}`)
    }

})()
function protectPage(){

    const params = new URLSearchParams(window.location.search)
    const channel = params.get("channel")

    const user = localStorage.getItem("twitch_user")

    if(!user){
        alert("Login required")
        window.location.href = "/"
        return
    }

    if(channel !== user){
        alert("You can only access your own dashboard")
        window.location.href = `/dashboard.html?channel=${user}`
    }
}

function getAuthHeaders(){
    const token = localStorage.getItem("twitch_token")

    if(!token){
        alert("Session expired. Please login again.")
        window.location.href = "/"
        return {}
    }

    return {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"   // ✅ ADD HERE
    }
}

// =====================
// PAGE SWITCHING
// =====================

function openPage(id){

    document.querySelectorAll(".page").forEach(p=>{
        p.classList.remove("active");
    });

    document.getElementById(id).classList.add("active");

    document.querySelectorAll("#sidebar button:not(#toggleSidebar)").forEach(btn=>{
        btn.classList.remove("active");
    });

    const activeBtn = document.querySelector(
        `#sidebar button[onclick="openPage('${id}')"]`
    );

    if(activeBtn){
        activeBtn.classList.add("active");
    }

    if(id === "economy"){
        loadSettings();
    }

    if(id === "timed"){
        loadTimed();
    }
}

// =====================
// CONTEXT MENU
// =====================


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
`https://sharan-bot-kp71.onrender.com/leaderboard?channel=${channel}`,
{
    method: "GET",
    headers: getAuthHeaders(),
    mode: "cors"
}
)

const data = await res.json()

const table = document.querySelector("#leaderboardTable tbody")
table.innerHTML = ""

if(!data || data.length === 0){
table.innerHTML = `<tr><td colspan="3">No data yet</td></tr>`
return
}

data.forEach((user,i)=>{
const row = document.createElement("tr")
row.innerHTML = `
    <td>${i + 1}</td>
    <td>${user.username}</td>
    <td>${user.points}</td>
`;
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

    const params = new URLSearchParams(window.location.search);
    const channel = params.get("channel");

    if(!channel){
        console.log("No channel");
        return;
    }

    try{

        const res = await fetch(
            `https://sharan-bot-kp71.onrender.com/commands?channel=${channel}`,
            {
                method:"GET",
                headers:getAuthHeaders(),
                mode:"cors"
            }
        );

        const data = await res.json();

        const container = document.getElementById("commandsList");
        container.innerHTML = "";

        if(!data || data.length === 0){
            container.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center; color:rgba(255,255,255,0.6);">
                        No commands yet
                    </td>
                </tr>
            `;
            return;
        }

        data.forEach(cmd=>{

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>
                    <span style="
                        color:#d86cff;
                        font-weight:700;
                    ">
                        ${cmd.command}
                    </span>
                </td>

                <td style="
                    max-width:420px;
                    white-space:nowrap;
                    overflow:hidden;
                    text-overflow:ellipsis;
                    color:rgba(255,255,255,0.85);
                ">
                    ${cmd.response}
                </td>

                <td>
                    ${
                        cmd.give_points
                        ? `<span style="
                            padding:8px 12px;
                            border-radius:12px;
                            background:rgba(80,255,150,0.08);
                            border:1px solid rgba(80,255,150,0.16);
                            color:#86ffb5;
                            font-weight:600;
                        ">
                            +${cmd.points_amount}
                        </span>`
                        : `<span style="
                            color:rgba(255,255,255,0.45);
                        ">
                            None
                        </span>`
                    }
                </td>

                <td>
                    <div class="actionButtons">

                        <button class="editBtn"
                        onclick="startEditCommand(
                            '${cmd.command.replace(/'/g,"")}',
                            '${cmd.response.replace(/'/g,"")}'
                        )">
                            Edit
                        </button>

                        <button class="deleteBtn"
                        onclick="deleteCommand(
                            '${cmd.command.replace(/'/g,"")}'
                        )">
                            Delete
                        </button>

                    </div>
                </td>
            `;

            container.appendChild(row);

        });

    }catch(err){
        console.error("Commands load failed:", err);
    }
}

// =====================
// ADD COMMAND
// =====================

async function addCommand(){

    const params = new URLSearchParams(window.location.search)
    const channel = params.get("channel")

    let command = document
        .getElementById("commandName")
        .value
        .trim()

    const response = document
        .getElementById("commandResponse")
        .value
        .trim()

    /* remove extra ! */
    command = command.replace(/^!+/, "")

    /* store properly */
    command = "!" + command

    if(!command || !response){
        alert("Command and response required")
        return
    }

    const url = editingCommand
    ? "https://sharan-bot-kp71.onrender.com/command/update"
    : "https://sharan-bot-kp71.onrender.com/command/add";

    await fetch(url,{
        method:"POST",
        headers:getAuthHeaders(),
        body:JSON.stringify({
            channel:channel,
            command:command,
            response:response,
            old_command:editingCommand,
            give_points:document.getElementById("givePoints").checked ? 1 : 0,
            points_amount:Number(
                document.getElementById("pointsAmount").value || 0
            )
        })
    })

    editingCommand = null

    document.getElementById("commandSubmitBtn").innerText =
    "Add Command"

    document.getElementById("commandName").value = ""
    document.getElementById("commandResponse").value = ""

    loadCommands()
}
// =====================
// DELETE COMMAND
// =====================

async function deleteCommand(command){

const params = new URLSearchParams(window.location.search)
const channel = params.get("channel")

if(!command){
command = selectedCommand
}

if(!command) return

await fetch(
"https://sharan-bot-kp71.onrender.com/command/delete",
{
method:"POST",
headers: getAuthHeaders(),
body: JSON.stringify({
    channel: channel,
    command: command.trim()
})
}
)

selectedCommand = null
loadCommands()
}

const deleteBtn = document.getElementById("deleteCommandBtn")
if(deleteBtn){
deleteBtn.onclick = deleteCommand
}

function startEditCommand(command, response){

    editingCommand = command;

    document.getElementById("commandName").value = command;
    document.getElementById("commandResponse").value = response;

    document.getElementById("commandSubmitBtn").innerText = "Update Command";
}

// =====================
// SETTINGS
// =====================

async function saveMedals(){

const params = new URLSearchParams(window.location.search)
const channel = params.get("channel")

const enabled = document.getElementById("medalsEnabled").checked

await fetch(
"https://sharan-bot-kp71.onrender.com/medals/set",
{
method:"POST",
headers: getAuthHeaders(),
body: JSON.stringify({
channel: channel,
enabled: enabled
})
}
)
}

async function saveEconomy(){

const params = new URLSearchParams(window.location.search)
const channel = params.get("channel")

const currency = document.getElementById("currencyName").value
const ppm = document.getElementById("pointsPerMessage").value
const daily = document.getElementById("dailyReward").value

if(!channel){
alert("No channel found")
return
}

try{

await fetch(
"https://sharan-bot-kp71.onrender.com/economy/save",
{
method:"POST",
headers: getAuthHeaders(),
body: JSON.stringify({
channel: channel,
currency_name: currency,
points_per_message: Number(ppm),
daily_reward: Number(daily)
})
}
)

alert("✅ Economy saved")

}catch(err){
console.error("Economy save failed:", err)
}
}

async function loadSettings(){

const params = new URLSearchParams(window.location.search)
const channel = params.get("channel")

if(!channel) return

try{

const res = await fetch(
`https://sharan-bot-kp71.onrender.com/settings?channel=${channel}`,
{
    method: "GET",
    headers: getAuthHeaders(),
    mode: "cors"
}
)

const data = await res.json()

if(data.medals_enabled !== undefined){
document.getElementById("medalsEnabled").checked =
data.medals_enabled === 1 || data.medals_enabled === true
}

}catch(err){
console.error("Settings load failed:", err)
}
}

// =====================
// TIMED
// =====================

async function addTimed(){

const params = new URLSearchParams(window.location.search)
const channel = params.get("channel")

const message = document.getElementById("timedMessage").value
const interval = document.getElementById("timedInterval").value

if(!message || !interval){
alert("Message and interval required")
return
}

const url = editingTimed
? "https://sharan-bot-kp71.onrender.com/timed/update"
: "https://sharan-bot-kp71.onrender.com/timed/add";

await fetch(url,
{
method:"POST",
headers: getAuthHeaders(),
body: JSON.stringify({
channel: channel,
message: message,
old_message: editingTimed,
interval_minutes: Number(interval)
})
}
)
editingTimed = null;
document.getElementById("timedSubmitBtn").innerText = "Add Timed Message";

alert("✅ Timed message added")

document.getElementById("timedMessage").value = ""
document.getElementById("timedInterval").value = ""

loadTimed()
}

async function loadTimed(){

const params = new URLSearchParams(window.location.search)
const channel = params.get("channel")

if(!channel) return

try{

const res = await fetch(
`https://sharan-bot-kp71.onrender.com/timed/list?channel=${channel}`,
{
    method: "GET",
    headers: getAuthHeaders(),
    mode: "cors"
}
)
const data = await res.json()

const container = document.getElementById("timedList")
if(!container) return

container.innerHTML = ""

if(!data || data.length === 0){
container.innerHTML = "<p>No timed messages yet</p>"
return
}

data.forEach(msg => {

const row = document.createElement("tr")
row.className = "commandRow"

row.innerHTML = `
    <td style="
        color:rgba(255,255,255,0.85);
        max-width:500px;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
    ">
        ${msg.message}
    </td>

    <td>
        <span style="
            padding:8px 12px;
            border-radius:12px;
            background:rgba(216,108,255,0.10);
            border:1px solid rgba(216,108,255,0.18);
            color:#f0b6ff;
            font-weight:600;
        ">
            ${msg.interval_minutes} min
        </span>
    </td>

    <td>
        <div class="actionButtons">

            <button class="editBtn"
            onclick="startEditTimed('${msg.message.replace(/'/g,"")}')">
                Edit
            </button>

            <button class="deleteBtn"
            onclick="deleteTimed('${msg.message.replace(/'/g,"")}')">
                Delete
            </button>

        </div>
    </td>
`

container.appendChild(row)

})

}catch(err){
console.error("Timed load failed:", err)
}
}

async function deleteTimed(message){

const params = new URLSearchParams(window.location.search)
const channel = params.get("channel")

if(!message) return

await fetch(
"https://sharan-bot-kp71.onrender.com/timed/delete",
{
method:"POST",
headers: getAuthHeaders(),
body: JSON.stringify({
channel: channel,
message: message
})
}
)

loadTimed()
}

function startEditTimed(message){

    editingTimed = message;

    document.getElementById("timedMessage").value = message;

    document.getElementById("timedSubmitBtn").innerText = "Update Timed Message";
}

function updatePreview() {
    const user = localStorage.getItem("twitch_user") || "you";
    const input = document.getElementById("commandResponse");

    if (!input) return;

    let text = input.value || "{user} is now lurking!";

    text = text.replace("{user}", user);
    text = text.replace("{target}", "@someone");

    const preview = document.getElementById("cmdPreview");
    if (preview) preview.innerText = text;
}

document.addEventListener("DOMContentLoaded", () => {

    lucide.createIcons();

    const sidebar = document.getElementById("sidebar");
    const toggle = document.getElementById("toggleSidebar");

    if (toggle && sidebar) {
        toggle.addEventListener("click", () => {
            sidebar.classList.toggle("collapsed");
        });
    }

    const respInput = document.getElementById("commandResponse");

    if (respInput) {
        respInput.addEventListener("input", updatePreview);
    }

    updatePreview();
});

// =====================
// START
// =====================

protectPage()
openPage("leaderboard")

setInterval(loadLeaderboard,8000)
setInterval(loadCommands,8000)
setInterval(loadTimed,8000)

loadLeaderboard()
loadCommands()
loadSettings()