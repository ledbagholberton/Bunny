#!/usr/bin/python3
from flask import render_template
import config

connex_app = config.connex_app
connex_app.add_api("swagger.yml")

@connex_app.route("/")
def home():
    return render_template("home.html")

@connex_app.route("/users")
@connex_app.route("/users/<int:user_id>")
def users(user_id=""):
    return render_template("users.html", user_id=user_id)

@connex_app.route("/user/<int:user_id>")
@connex_app.route("/user/<int:user_id>/notes")
@connex_app.route("/user/<int:user_id>/notes/<int:note_id>")
def notes(user_id, note_id=""):
    return render_template("notes.html", user_id=user_id, note_id=note_id)

if __name__ == "__main__":
    connex_app.run(debug=True)
