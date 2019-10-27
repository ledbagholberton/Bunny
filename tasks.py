"""
This is the tasks module and supports all the REST actions for the
tasks data
"""

from flask import make_response, abort
from config import db
from models import User, Task, TaskSchema


def read_all():
    """
    This function responds to a request for /api/people/notes
    with the complete list of notes, sorted by note timestamp

    :return:                json list of all notes for all people
    """
    # Query the database for all the notes
    tasks = Task.query.order_by(db.desc(Task.timestamp)).all()

    # Serialize the list of notes from our data
    task_schema = TaskSchema(many=True, exclude=["user.notes"])
    data = task_schema.dump(tasks).data
    return data


def read_one(user_id, task_id):
    """
    This function responds to a request for
    /api/people/{person_id}/notes/{note_id}
    with one matching note for the associated person

    :param person_id:       Id of person the note is related to
    :param note_id:         Id of the note
    :return:                json string of note contents
    """
    # Query the database for the note
    task = (
        Task.query.join(User, User.user_id == Task.user_id)
        .filter(User.user_id == user_id)
        .filter(Task.task_id == task_id)
        .one_or_none()
    )

    # Was a note found?
    if task is not None:
        task_schema = TaskSchema()
        data = task_schema.dump(task).data
        return data

    # Otherwise, nope, didn't find that note
    else:
        abort(404, f"Note not found for Id: {task_id}")


def create(user_id, task):
    """
    This function creates a new note related to the passed in person id.

    :param person_id:       Id of the person the note is related to
    :param note:            The JSON containing the note data
    :return:                201 on success
    """
    # get the parent person
    user = User.query.filter(User.user_id == user_id).one_or_none()

    # Was a person found?
    if user is None:
        abort(404, f"User not found for Id: {user_id}")

    # Create a note schema instance
    schema = TaskSchema()
    new_task = schema.load(task, session=db.session).data

    # Add the note to the person and database
    user.tasks.append(new_task)
    db.session.commit()

    # Serialize and return the newly created note in the response
    data = schema.dump(new_task).data

    return data, 201


def update(user_id, task_id, task):
    """
    This function updates an existing note related to the passed in
    person id.

    :param person_id:       Id of the person the note is related to
    :param note_id:         Id of the note to update
    :param content:            The JSON containing the note data
    :return:                200 on success
    """
    update_task = (
        Task.query.filter(User.user_id == user_id)
        .filter(Task.task_id == task_id)
        .one_or_none()
    )

    # Did we find an existing note?
    if update_task is not None:

        # turn the passed in note into a db object
        schema = TaskSchema()
        update = schema.load(task, session=db.session).data

        # Set the id's to the note we want to update
        update.user_id = update_task.person_id
        update.task_id = update_task.task_id

        # merge the new object into the old and commit it to the db
        db.session.merge(update)
        db.session.commit()

        # return updated note in the response
        data = schema.dump(update_task).data

        return data, 200

    # Otherwise, nope, didn't find that note
    else:
        abort(404, f"Task not found for Id: {task_id}")


def delete(user_id, task_id):
    """
    This function deletes a note from the note structure

    :param person_id:   Id of the person the note is related to
    :param note_id:     Id of the note to delete
    :return:            200 on successful delete, 404 if not found
    """
    # Get the note requested
    task = (
        Task.query.filter(User.user_id == user_id)
        .filter(Task.task_id == task_id)
        .one_or_none()
    )

    # did we find a note?
    if task is not Task:
        db.session.delete(task)
        db.session.commit()
        return make_response(
            "Task {task_id} deleted".format(task_id=task_id), 200
        )

    # Otherwise, nope, didn't find that note
    else:
        abort(404, f"Task not found for Id: {task_id}")
