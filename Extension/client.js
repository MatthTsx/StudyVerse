const haxRegex = /^[0-9a-fA-F]+$/

function sendDocs () {
    const url = document.location.pathname.slice(1)
    if(haxRegex.test(url)) return sendRoom()
}

function sendRoom(){
    try {
        chrome.runtime.sendMessage({
            data: {
                type: "Room content",
                people: document.querySelectorAll('div[data-descriptor="room-members-sidebar"] img[alt="user avatar"]').length | 0,
                timeLeft: document.querySelector('span.absolute.opacity-5 + span').textContent,
                isInBreak: document.querySelector('div.bg-green-500').textContent.includes("Break time"),
                RoomName: document.querySelector("title").textContent.split("|")[0],
                url: window.location.href
            }
        })
    } catch (error) {}
}



setInterval(sendDocs, 2500)