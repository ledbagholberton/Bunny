#!/usr/bin/python3
import os
from datetime import datetime
from config import db
from models import User, Task

# Data to initialize database with
USERS = [
    {
        "name": "Pedro Ramirez",
        "tasks": [
            ("Hacer almuerzo", "to_do",  "2019-01-06 22:17:54"),
            ("Hacer cama", "done",  "2019-01-05 22:17:54"),
            ("Barrer", "to_do",  "2019-03-08 22:17:54"),
        ],
    },
    {
        "name": "Juan Perez",
        "tasks": [
            ("Hacer Desayuno", "to_do",  "2019-03-06 22:17:54"),
            ("Hacer cocina", "done",  "2019-04-06 22:17:54"),
            ("Hacer cama", "done",  "2019-05-06 22:17:54"),
        ],
    },
    {
        "name": "Camilo Granda",
        "tasks": [
            ("Hacer Desayuno", "to_do",  "2019-02-06 22:17:54"),
            ("Hacer cocina", "done",  "2019-11-06 22:17:54"),
        ],
    },
]

# Delete database file if it exists currently
if os.path.exists("users.db"):
    os.remove("users.db")

# Create the database
db.create_all()

# iterate over the USERS structure and populate the database
for user in USERS:
    u = User(name=user.get("name"))

    # Add the tasks for the user
    for task in user.get("tasks"):
        description, state, timestamp = task
        u.tasks.append(
            Task(
                description=description,
                state=state,
                timestamp=datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S"),
            )
        )
    db.session.add(u)

db.session.commit()
