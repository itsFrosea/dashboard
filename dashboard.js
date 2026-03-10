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


openPage("leaderboard")


async function loadLeaderboard(){

const channel = new URLSearchParams(window.location.search).get("channel")

const res = await fetch(`https://sharan-bot-kp71.onrender.com/leaderboard?channel=${channel}`)

const data = await res.json()

const table = document.querySelector("#leaderboardTable tbody")

table.innerHTML = ""

data.forEach(user=>{

const row = document.createElement("tr")

row.innerHTML = `
<td>${user.username}</td>
<td>${user.points}</td>
`

table.appendChild(row)

})

}

loadLeaderboard()