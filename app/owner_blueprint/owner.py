

from flask import Blueprint, render_template, flash, redirect, url_for, request
from flask import current_app as app
import os, json, shutil
from app.models import Product, User, Carousel
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
        # dev_key to be pulled here from environment variable
        # no new accounts to be created without dev key
        # compare keys = 
        # os.environ.get('OWNER_REGISTER_KEY')
        key = register_form.dev_key.data
        print(key)
        print(os.environ.get('OWNER_REGISTER_KEY'))
        if key != os.environ.get('OWNER_REGISTER_KEY'):
            flash('Development Key Incorrect')
            return redirect(url_for('owner_blueprint.owner_register'))

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

    # check for duplicate filename
    saved_files = Carousel.query.all()
    for db_filename in saved_files:
        if file.filename == db_filename.filename:
            print('filenames the same!', file.filename)
            # split filename at '.'
            split_name = file.filename.split('.')
            new_filename = split_name[0] + '(' + str(len(saved_files)) + ')'
            file.filename = new_filename + '.' + split_name[1]
            print('new filename = ', file.filename)

    if file and allowed_file(file.filename):
        # TODO: check if filename already exists in database
        # if taking photo from phone camera, filenames will duplicate
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['CAROUSEL_FOLDER'], filename))

        # create database entry to track id
        new_carousel = Carousel(filename = filename)
        db.session.add(new_carousel)
        db.session.commit()

        resp_dict = {'response': 'fulfilled'} 
        resp_dict = json.dumps(resp_dict)
        return resp_dict

    # failure response
    resp_dict = {'response': 'rejected'} 
    resp_dict = json.dumps(resp_dict)
    return resp_dict, 404


@owner_blueprint.route('/remove_carousel_photo', methods=['POST'])
@login_required
def remove_carousel_photo():
    file_dict = request.json
    filename = file_dict["filename"]

    #lookup file and rm
    static = 'static'
    photos = 'carousel_photos'

    blueprint_dir = os.path.dirname(__file__)
    app_dir = os.path.dirname(blueprint_dir)
    photos_dir = os.path.join(app_dir, static, photos)
    
    photo_to_remove = os.path.join(photos_dir, filename)
    os.remove(photo_to_remove)

    # remove from database to track id.
    photo_in_db = Carousel.query.filter_by(filename = filename).first()
    db.session.delete(photo_in_db)
    db.session.commit()

    resp_dict = {'response': 'fulfilled'} 
    resp_dict = json.dumps(resp_dict)
    return resp_dict


@owner_blueprint.route('/new_product_photo', methods=['POST'])
@login_required
def new_product_photo():

    file = request.files['add_product_photo_input']
    product_id = request.form['product_id']

    if file.filename == '':
        # need to add flash section to this html file
        flash('No selected file')
        return 'rejected', 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        product_folder = os.path.join(app.config['INVENTORY_FOLDER'] ,product_id)
        file.save(os.path.join(product_folder, filename))


        resp_dict = {'response': 'fulfilled'} 
        resp_dict = json.dumps(resp_dict)
        return resp_dict

    # failure response
    resp_dict = {'response': 'rejected'} 
    resp_dict = json.dumps(resp_dict)
    return resp_dict, 503

@owner_blueprint.route('/remove_product_photo', methods=['POST'])
@login_required
def remove_product_photo():

    product_id = request.form['product_id']
    photo_filename = request.form['photo_filename']
    # catch file not found errors?
    try:
        product_folder = os.path.join(app.config['INVENTORY_FOLDER'] , product_id)
        photo_to_remove = os.path.join(product_folder, photo_filename)
        os.remove(photo_to_remove)
    except:
        return 'file not found', 404

    resp_dict = {'response': 'fulfilled'} 
    resp_dict = json.dumps(resp_dict)
    return resp_dict


@owner_blueprint.route('/edit_product', methods=['POST'])
@login_required
def edit_product():

    product_dict = request.json

    stored_product = Product.query.filter_by(id = product_dict['id']).first()

    stored_product.id = product_dict['id']
    stored_product.description = product_dict['description']
    stored_product.details = product_dict['details']
    stored_product.price = product_dict['price']
    stored_product.status = product_dict['status']

    db.session.add(stored_product)
    db.session.commit()
    

    return 'fulfilled', 200

@owner_blueprint.route('/new_product', methods=['POST'])
@login_required
def new_product():

    product_dict = request.json

    new_product = Product(description = product_dict['description'], details = product_dict['details'],
        price = product_dict['price'], status = product_dict['status'])


    db.session.add(new_product)
    db.session.commit()
    
    new_product_id = new_product.id

    new_folder = os.path.join(app.config['INVENTORY_FOLDER'] , str(new_product_id))
    os.mkdir(new_folder)
    
    
    return 'fulfilled', 200


@owner_blueprint.route('/delete_product', methods=['POST'])
@login_required
def delete_product():

    product_dict = request.json

    product = Product.query.filter_by(id = product_dict['id']).first()

    db.session.delete(product)
    db.session.commit()

    product_folder = os.path.join(app.config['INVENTORY_FOLDER'] , product_dict['id'])

    shutil.rmtree(product_folder)


    return 'fulfilled', 200