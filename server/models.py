from db import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    uuid = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(256), index=True, unique=True)
    posts = db.relationship('Post', backref='author')
    password_hash = db.Column(db.String(128))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return '<User %r>' % self.username
class Post(db.Model):
    __tablename__ = 'posts'
    uuid = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(256), index=True)
    body = db.Column(db.Text)
    author_id = db.Column(db.Integer, db.ForeignKey('users.uuid'))
    def __repr__(self):
        return '<Post %r>' % self.title