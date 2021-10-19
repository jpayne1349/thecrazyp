

from flask import Blueprint, render_template, flash, redirect, url_for, request, abort
from flask import current_app as app
import os, json, shutil

from werkzeug.exceptions import RequestedRangeNotSatisfiable
from app.models import Product, User, Carousel, CustomOrder, ProductRequest, SoAvailable
from app.forms import LoginForm, RegisterForm
from app import db, imageProcessor, customOrders, email
from werkzeug.utils import secure_filename
from config import allowed_file
from flask_login import current_user, login_user, logout_user, login_required


owner_blueprint = Blueprint('owner_blueprint', __name__) 


@owner_blueprint.route('/handle_error', methods=['POST'])
def handle_error():
    ''' receives a json string containing the error message and triggers an email to be sent '''

    error_dict = request.json
    
    email.email_error_report(error_dict)

    return 'error processed'

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

# load in special orders and product requests for viewing
@owner_blueprint.route('/orders', methods=['POST'])
@login_required
def product_requests():

    custom_orders = CustomOrder.query.all()

    custom_orders_list = []
    for order in custom_orders:
        custom_json = json.loads(order.json)

        order_dict = {}
        order_dict['id'] = order.id
        order_dict['notes'] = order.notes
        order_dict['contact'] = order.contact
        order_dict['order_status'] = order.order_status
        
        # add the custom json dict into the new order dict
        order_dict.update(custom_json)

        # append it to the orders list
        custom_orders_list.append(order_dict)


    product_requests = ProductRequest.query.all()

    product_requests_list = []
    for request in product_requests:
        request_dict = {}
        request_dict['id'] = request.id
        request_dict['product_id'] = request.product_id
        request_dict['contact_info'] = request.contact_info
        request_dict['date_created'] = request.date_created
        request_dict['order_status'] = request.order_status

        product_requests_list.append(request_dict)

    # to json, and send. process on front end
    sending_list = [custom_orders_list, product_requests_list]

    json_data = json.dumps(sending_list)
    
    return json_data

@owner_blueprint.route('/<username>/owner_logout/')
@login_required
def owner_logout(username):
    logout_user()
    return redirect(url_for('owner_blueprint.owner_login'))


@owner_blueprint.route('/new_carousel_photo', methods=['POST'])
@login_required
def new_carousel_photo():
    
    file = request.files['carousel_file_input']
    
    if file.filename == '':
        # TODO: need to add flash section to this html file
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

        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['CAROUSEL_FOLDER'], filename))

        # create database entry to track id
        new_carousel = Carousel(filename = filename)
        db.session.add(new_carousel)
        db.session.commit()

        # run image processing function to populate LowRes folder
        imageProcessor.process_carousel()
        
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

    #lookup both HighRes and LowRes copies and remove them from storage
    static = 'static'
    hr_photos = 'carousel_photos/HighRes'
    lr_photos = 'carousel_photos/LowRes'

    blueprint_dir = os.path.dirname(__file__)
    app_dir = os.path.dirname(blueprint_dir)
    hr_photos_dir = os.path.join(app_dir, static, hr_photos)
    lr_photos_dir = os.path.join(app_dir, static, lr_photos)
    
    hr_photo_to_remove = os.path.join(hr_photos_dir, filename)
    lr_photo_to_remove = os.path.join(lr_photos_dir, filename)
    os.remove(hr_photo_to_remove)
    os.remove(lr_photo_to_remove)

    # remove from database
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
        product_folder = os.path.join(app.config['INVENTORY_FOLDER'] ,product_id, 'HighRes')
        # save HighRes image
        file.save(os.path.join(product_folder, filename))
        
        # process this items photos
        imageProcessor.process_inventory(os.path.join(
            app.config['INVENTORY_FOLDER'], product_id))
            
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
        hr_photo_to_remove = os.path.join(product_folder, 'HighRes', photo_filename)
        os.remove(hr_photo_to_remove)
        lr_photo_to_remove = os.path.join(product_folder, 'LowRes', photo_filename)
        os.remove(lr_photo_to_remove)
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

    # make HR and LR folders within
    hr_folder = os.path.join(new_folder, 'HighRes')
    os.mkdir(hr_folder)
    lr_folder = os.path.join(new_folder, 'LowRes')
    os.mkdir(lr_folder)
    

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


@owner_blueprint.route('/delete_special_order', methods=['POST'])
@login_required
def delete_special_order():
    request_dict = request.json

    this_order = CustomOrder.query.filter_by(id=request_dict['id']).first()
    db.session.delete(this_order)
    db.session.commit()

    return 'order deleted'

@owner_blueprint.route('/change_special_order_status', methods=['POST'])
@login_required
def change_special_order_status():

    request_dict = request.json

    id = request_dict['id']
    status = request_dict['status']

    order = CustomOrder.query.filter_by(id=id).first()
    print(order)
    order.order_status = status
    
    db.session.commit()

    return 'order status updated'


@owner_blueprint.route('/change_product_request_status', methods=['POST'])
@login_required
def change_product_request_status():
    request_dict = request.json

    id = request_dict['id']
    status = request_dict['status']

    prod_request = ProductRequest.query.filter_by(id=id).first()
    print(request)
    prod_request.order_status = status
    
    db.session.commit()

    return 'order status updated'

@owner_blueprint.route('/delete_product_request', methods=['POST'])
@login_required
def delete_product_request():
    request_dict = request.json

    this_request = ProductRequest.query.filter_by(id=request_dict['id']).first()
    db.session.delete(this_request)
    db.session.commit()

    return 'order deleted'


@owner_blueprint.route('/special_order_availibility', methods=['POST'])
@login_required
def special_order_availibility():

    status = 0
    date_string = ''

    so_status = SoAvailable.query.all()

    if not so_status:
        obj = {'status': 0, 'date_string': ''}
        js_obj = json.dumps(obj)
        return js_obj


    object_to_send = {'status': so_status[0].status, 'date_string':so_status[0].date_string }
    js_obj = json.dumps(object_to_send)

    return js_obj


@owner_blueprint.route('/update_so_status', methods=['POST'])
@login_required
def update_so_status():

    data = request.json
    new_status = data['status']
    
    so_status = SoAvailable.query.all()

    if not so_status:
        new_so_status = SoAvailable(status=new_status, date_string='')
        db.session.add(new_so_status)
        db.session.commit()
        return 'updated'

    so_status[0].status = new_status
    db.session.commit()

    return 'updated'


@owner_blueprint.route('/update_so_date', methods=['POST'])
@login_required
def update_so_date():

    data = request.json
    new_date = data['date_string']

    so_status = SoAvailable.query.all()

    if not so_status:
        new_so_status = SoAvailable(status=1, date_string=new_date)
        db.session.add(new_so_status)
        db.session.commit()
        return 'updated'

    so_status[0].date_string = new_date
    db.session.commit()

    return 'updated'


@owner_blueprint.route('/custom_order_design', methods=['POST'])
@login_required
def custom_order_design():
    try:
        design_tree = customOrders.get_design()
    except Exception as e:
        customOrders.build()

        try:
            design_tree = customOrders.get_design()
        except:
            return abort(500, description='custom_order_error')

    design_tree = json.dumps(design_tree)

    return design_tree

@owner_blueprint.route('/custom_order_update', methods=['POST'])
@login_required
def custom_order_update():

    data = request.json
    print(data)
    # check the contents, to decide what to do
    customOrders.process_request(data)

    newest_design_tree = customOrders.get_design()

    json_list = json.dumps(newest_design_tree)

    return json_list


@owner_blueprint.route('/custom_order_option_image', methods=['POST'])
@login_required
def custom_order_option_image():
    
    if request.files:
        image_file = request.files['option_image_file']
    resource_data = request.form['resource']

    resource_data = json.loads(resource_data)
    print(resource_data)
    
    contents = resource_data["contents"]
    category_name = resource_data["category"]
    option_name = resource_data["option"]

    if contents == 'new_image':
        if image_file.filename == '':
            # need to add flash section to this html file
            flash('No selected file')
            return 'rejected', 400

        if image_file and allowed_file(image_file.filename):

            filename = secure_filename(image_file.filename)

            # build filepath
            new_hr_photo_filepath = customOrders.get_photo_hr_path(category_name, option_name, filename)
            
            # save HighRes image
            image_file.save(os.path.join(new_hr_photo_filepath))
            
            # process/create LowRes image
            option_file_path = customOrders.get_option_path(category_name, option_name)
            imageProcessor.process_option_image(option_file_path)

            new_hr_src = customOrders.get_photo_hr_src(category_name, option_name, filename)

            resp_dict = {'new_option_image_src': new_hr_src} 
            resp_dict = json.dumps(resp_dict)
            return resp_dict

    if contents == 'delete_image':
        # use info to delete hr and lr photos
        try:
            option_path = customOrders.get_option_path(category_name, option_name)
            hr_path = os.path.join(option_path, 'HighRes')
            lr_path = os.path.join(option_path, 'LowRes')

            hr_photos = os.listdir(hr_path)
            for photo in hr_photos:
                photo_path = os.path.join(hr_path, photo)
                os.remove(photo_path)

            lr_photos = os.listdir(lr_path)
            for photo in lr_photos:
                photo_path = os.path.join(lr_path, photo)
                os.remove(photo_path)

            resp_dict = {'response': 'fulfilled'} 
            resp_dict = json.dumps(resp_dict)
            return resp_dict

        except:

            resp_dict = {'response': 'file not found'} 
            resp_dict = json.dumps(resp_dict)
            return resp_dict, 404

    # failure response
    resp_dict = {'response': 'rejected'} 
    resp_dict = json.dumps(resp_dict)
    return resp_dict, 503


