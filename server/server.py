from flask import Flask, request
from PostData import Main_Post

app = Flask(__name__)

pst = Main_Post()

@app.route('/data', methods=['POST'])
def handle_data():
    global pst
    pst.data = request.get_json()
    return "Data received successfully", 200

if __name__ == '__main__':
    app.run(port=4727)
