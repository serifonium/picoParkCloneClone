
function startGame() {
    document.getElementById("c").style.display = ""
    document.getElementById("menu").style.display = "none"
    if (!mainGame.matter.running) {
        startMainGame()
    }

}
function hideGame() {
    document.getElementById("menu").style.display = ""
    document.getElementById("c").style.display = "none"

}

function setRoomCode(c) {
    document.getElementById("roomCode").textContent = c
}

function addPlayerToMenu(name) {
    document.getElementById("memberlist").appendChild(createElementFromHTML(`<div>${name}<br></div>`))
}