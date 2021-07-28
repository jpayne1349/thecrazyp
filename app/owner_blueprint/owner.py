

from flask import Blueprint, render_template, flash, redirect, url_for, request
from flask import current_app as app
import os, json
from app.models import Product, User
from app.forms import LoginForm, RegisterForm
from app import db
from werkzeug.utils import secure_filename
from config import allowed_file
from flask_login import current_user, login_user, logout_user, login_required

owner_blueprint = Blueprint('owner_blueprint', __name__) 


@owner_blueprint.route('/owner_login', methods=['GET','POST'])
def owner_login():
    if current_user.is_authenticated:
        return redirect(url_for('owner_blueprint.owner_homepage', username = current_user.username))

    login_form = LoginForm()

    if login_form.validate_on_submit():
        user = User.query.filter_by(username=login_form.username.data).first()
        if user is None or not user.check_password(login_form.password.data):
            flash('Incorrect username or password')
            return redirect(url_for('owner_blueprint.owner_login'))
        login_user(user)
        return redirect(url_for('owner_blueprint.owner_homepage', username= current_user.username))

    if request.method == 'POST':
        return redirect(url_for('owner_blueprint.owner_homepage', username= current_user.username))

    return render_template('owner_login.html', form=login_form)

@owner_blueprint.route('/owner_register/', methods=['GET','POST'])
def owner_register():
    # insert form for registration here.
    register_form = RegisterForm()

    if register_form.validate_on_submit():
        # grab the info from the form
        email = register_form.email.data
        username = register_form.username.data
        password = register_form.password.data

        # check username for duplicate here.
        match_check = User.query.filter_by(username=register_form.username.data).first()
        if match_check is None:
            # create new User
            new_user = User(email=email, username=username)
            new_user.set_date()
            new_user.set_password(password)

            db.session.add(new_user)
            db.session.commit()

            print(email, username, new_user.password_hash, new_user.date_created)

        else:
            # clear form and flash message
            flash('Username taken')
            return redirect(url_for('owner_blueprint.owner_register'))
    
        return redirect(url_for('owner_blueprint.owner_login'))

    return render_template('owner_register.html', form=register_form) # also pass in form object once created


@owner_blueprint.route('/<username>/homepage')
@login_required
def owner_homepage(username): # pass in a argument in url_for, has to accept it here.

    print(username)

    return render_template('owner_homepage.html', username = username)


@owner_blueprint.route('/<username>/owner_logout/')
@login_required
def owner_logout(username):
    logout_user()
    return redirect(url_for('owner_blueprint.owner_login'))


@owner_blueprint.route('/new_carousel_photo', methods=['POST'])
@login_required
def new_carousel_photo():
    print(request.files)
    file = request.files['carousel_file_input']
    
    if file.filename == '':
        # need to add flash section to this html file
        flash('No selected file')
        return redirect(request.url)
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['CAROUSEL_FOLDER'], filename))
        return '{response:"fulfilled"}'

    # failure response
    return '{response:"rejected"}'

