class Study{
    time
    tabId
    Status = "idle"
    RoomData = {
        people: 0,
        timeLeft: "00:00",
        isInBreak: true,
        RoomName: "",
        url: ""
    }
    constructor(tabId){
        this.tabId = tabId
        this.time = Date.now()
    }

    setRoom(variable, change){
        this.RoomData[variable] = change
    }
}

const Running_Tabs = []
let ActualTab

chrome.tabs.onUpdated.addListener(async (changeInfo, w, e) => {
    const {hostname, pathname} = checkURL(e.url)
    if(hostname != "studyverse.live") return
    const exist = await getExist(changeInfo)
    const [{id}] = await chrome.tabs.query({active: true})
    if(exist.tabId == id) ActualTab = exist.tabId

    if(pathname == "/home") exist.Status = "home"
    else if(pathname == "/stats") exist.Status = "stats"
    else if(pathname.includes("messages")) exist.Status = "messages"
    else if(pathname.includes("rooms")) exist.Status = "see rooms"
    else exist.Status = "Room"
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
    const exist = Running_Tabs.find(t => t.tabId == tabId)
    if(exist){
        const index = Running_Tabs.indexOf(exist)
        Running_Tabs.splice(index, 1)
        if(exist.tabId == ActualTab) ActualTab = Running_Tabs.length > 0 ? Running_Tabs[0].tabId : null
    }
});

chrome.tabs.onActivated.addListener(async () => {
    const All = await CheckAll()
    if(!All) return
    ActualTab = await getExist(All.t.id, All.t.title).then(d => d.tabId)
 });

async function getExist(tabId){
    const index = Running_Tabs.find(i => i.tabId == tabId)
    if(!index) {
        const tb = new Study(tabId, false)
        Running_Tabs.push(tb)
        return tb
    }
    return index
}

async function CheckAll(){
    const [t] = await chrome.tabs.query({active: true})
    const Url = checkURL(t.url)
    if("studyverse.live" != Url.hostname) return undefined
    return {Url, t}
}

function checkURL(url){
    try {
        const {hostname, pathname} = new URL(url)
        return {hostname, pathname}
    } catch (error) {
        return {hostname: null, pathname: null}
    }
}

chrome.runtime.onMessage.addListener(async (request, sender) => {
    const {id} = sender.tab
    const tab = await getExist(id)
    if(request.data.type == "Room content"){
        tab.setRoom("RoomName", request.data.RoomName)
        tab.setRoom("timeLeft", request.data.timeLeft)
        tab.setRoom("people", request.data.people)
        tab.setRoom("isInBreak", request.data.isInBreak)
        tab.setRoom("url", request.data.url)
        tab.Status = "Room"
    }
})

let isLastPostNull = false

setInterval(() => {
    if(Running_Tabs.length == 0 && isLastPostNull) return
    fetch("http://localhost:4727/data", {
        method: "POST",
        body: JSON.stringify(ActualTab != null? {...Running_Tabs.find(t => t.tabId == ActualTab),"PostTime":Date.now()} : "nao"),
        headers:{'Content-type':'application/json'},
    }).catch(err => console.log(err))
    if(ActualTab == null) isLastPostNull = true
    else isLastPostNull = false
}, 2500)