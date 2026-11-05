import os

from flask import Flask, render_template

app = Flask(__name__)


@app.context_processor
def inject_contact_email():
    return {"booking_email": os.environ.get("EMAIL_RECIPIENT", "sujataguravkammar@gmail.com")}



@app.route("/")
def home():
    return render_template("index.html")


@app.route("/explore")
def explore():
    return render_template("explore.html")


@app.route("/learn")
def learn():
    return render_template("learn.html")


@app.route("/landing")
def landing():
    return render_template("landing.html")



if __name__ == "__main__":
    app.run(debug=True)
