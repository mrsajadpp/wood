from flask import Flask, render_template, request

app = Flask(__name__)

# Define the route for the homepage
@app.route('/', methods=['GET'])
def index():
    return render_template('search.html', style='search')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
