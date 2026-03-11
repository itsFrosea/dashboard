

function openPage(id){

document.querySelectorAll(".page").forEach(p=>{
p.classList.remove("active")
})

document.getElementById(id).classList.add("active")

}


// open leaderboard page
openPage("leaderboard")


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


// load leaderboard
loadLeaderboard()