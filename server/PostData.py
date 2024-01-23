import threading as th
from time import sleep
from pypresence import Presence
import re

class Main_Post:
    client_id = "1198360119117873252"
    RPC = Presence(client_id)
    connected = False
    data = "nao"
    lastTime = 0
    counting_to_time = 2
    def send(self):
        while True:
            if self.data != "nao" and self.data["PostTime"] != self.lastTime:
                try:
                    print (self.data)
                    self.counting_to_time -= 1
                    if self.counting_to_time <= 0:
                        self.counting_to_time = 2
                        self.lastTime = self.data["PostTime"]

                    if not self.connected:
                        self.RPC.connect()
                        self.connected = True
                    if self.data["Status"] == 'Room':
                        small_text = "Focusing"
                        small_image= "focus"

                        if self.data["RoomData"]["isInBreak"]:
                            small_text = "in a Break"
                            small_image= "break"
                        
                        small_text += " for " + str(self.getMins()) + " mins"
                        self.RPC.update(
                            state="Studying in a Room",
                            details= "In " + self.remove_Time() + "! with " + str(self.data["RoomData"]["people"]) + " students",
                            large_image="icon2",
                            small_image=small_image,
                            start= self.data["time"],
                            buttons=[
                                {"label": "Study with me", "url": self.data["RoomData"]["url"]}
                            ],
                            small_text=small_text
                        )
                    elif self.data["Status"] == "home":
                        self.RPC.update(
                            state="In home page",
                            large_image="icon2",
                            start= self.data["time"]
                        )
                    elif self.data["Status"] == "messages":
                        self.RPC.update(
                            state="viewing DMs",
                            large_image="icon2",
                            start= self.data["time"]
                        )
                    elif self.data["Status"] == "see rooms":
                        self.RPC.update(
                            state="searching rooms",
                            large_image="icon2",
                            start= self.data["time"]
                        )
                    elif self.data["Status"] == "stats":
                        self.RPC.update(
                            state="viewing user's status",
                            large_image="icon2",
                            start= self.data["time"]
                        )
                except: pass
            elif self.connected:
                self.RPC.close()
                self.connected = False
            sleep(5)

    def __init__(self) -> None:
        th.Thread(target=self.send).start()
        pass

    def remove_Time(self):
        pattern = re.compile(r'\(\d+\d+:\d+\d+\)')
        return re.sub(pattern, '',self.data["RoomData"]["RoomName"])[:-1]
    
    def getMins(self):
        return int(self.data["RoomData"]["timeLeft"][0]) * 10 + int(self.data["RoomData"]["timeLeft"][1]) + 1