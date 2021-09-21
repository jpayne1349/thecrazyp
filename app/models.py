# USED FOR DATABASE MODELS

from . import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from app import login_manager
import datetime

class Carousel(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    filename = db.Column(db.String(50), index=True)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    description = db.Column(db.String(50), index=True)
    details = db.Column(db.String(240), index=True)
    price = db.Column(db.Integer, index=True)

    # could represent available, pending, sold etc.
    # 0 - avail, 1 - pending , 2 - sold
    status = db.Column(db.Integer, index=True)

# new class for Special Order
class SpecialOrder(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    style = db.Column(db.String(24), index=True)
    color = db.Column(db.String(24), index=True)
    band = db.Column(db.String(24), index=True)
    notes = db.Column(db.String(24), index=True)
    contact = db.Column(db.String(24), index=True)
    # 0 = processing, 1 = fulfilled, 2 = canceled
    order_status = db.Column(db.Integer, index=True)

class ProductRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    product_id = db.Column(db.Integer, index=True)
    contact_info = db.Column(db.String(48), index=True)
    date_created = db.Column(db.String(24), index=True)
    # 0 = processing, 1 = fulfilled, 2 = canceled
    order_status = db.Column(db.Integer, index=True)

# TODO: do these orders need a status? that the owner configures..
# processing, fulfilled, canceled

@login_manager.user_loader
def load_user(id):
    return User.query.get(int(id))

class User(UserMixin, db.Model):

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(32))
    username = db.Column(db.String(64), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    date_created = db.Column(db.DateTime())

    def set_date(self):
        self.date_created = datetime.datetime.now()

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username} >'