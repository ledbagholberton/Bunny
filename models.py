from datetime import datetime
from config import db, ma
from marshmallow import fields


class User(db.Model):
    __tablename__ = "user"
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(32))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    tasks = db.relationship(
        "Task",
        backref="user",
        cascade="all, delete, delete-orphan",
        single_parent=True,
        order_by="desc(Task.timestamp)",
    )

class Task(db.Model):
    __tablename__ = "task"
    task_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.user_id"))
    description = db.Column(db.String, nullable=False)
    state = db.Column(db.String, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class UserSchema(ma.ModelSchema):
    def __init__(self, **kwargs):
        super().__init__(strict=True, **kwargs)
    class Meta:
        model = User
        sqla_session = db.session
    tasks = fields.Nested("UserTaskSchema", default=[], many=True)


class UserTaskSchema(ma.ModelSchema):
    """
    This class exists to get around a recursion issue
    """

    def __init__(self, **kwargs):
        super().__init__(strict=True, **kwargs)

    task_id = fields.Int()
    user_id = fields.Int()
    description = fields.Str()
    state = fields.Str()
    timestamp = fields.Str()


class TaskSchema(ma.ModelSchema):
    def __init__(self, **kwargs):
        super().__init__(strict=True, **kwargs)

    class Meta:
        model = Task
        sqla_session = db.session
    user = fields.Nested("TaskUserSchema", default=None)


class TaskUserSchema(ma.ModelSchema):
    """
    This class exists to get around a recursion issue
    """

    def __init__(self, **kwargs):
        super().__init__(strict=True, **kwargs)

    user_id = fields.Int()
    name = fields.Str()
    timestamp = fields.Str()
