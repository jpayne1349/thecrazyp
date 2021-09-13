
from flask import Blueprint, render_template, flash, request
from flask import current_app as app
import os, json
from app import db
from app.models import Carousel, Product, SpecialOrder, ProductRequest
from app.email import email_special_order, email_product_order


main_blueprint = Blueprint('main_blueprint', __name__) 


@main_blueprint.route('/')
def homepage():
    return render_template('homepage.html')

@main_blueprint.route('/carousel_photos', methods=['POST'])
def carousel_photos():

    static = 'static'
    photos = 'carousel_photos'

    blueprint_dir = os.path.dirname(__file__)
    app_dir = os.path.dirname(blueprint_dir)
    
    photos_dir = os.path.join(app_dir, static, photos)
    
    list_of_photos = os.listdir(photos_dir)
    
    carousel_objects = Carousel.query.all()

    # dict key is the id..
    filename_dict = {}
    for carousel_object in carousel_objects:
        filename_dict[carousel_object.id] = (carousel_object.filename)

    photos_list = json.dumps(filename_dict)

    return photos_list

@main_blueprint.route('/inventory')
def inventory():
    return render_template('inventory.html')

@main_blueprint.route('/load_inventory', methods=['POST'])
def load_inventory():

    # maybe need seperate folders for each item
    # to provide multiple photos

    static = 'static'
    photos = 'product_inventory'

    blueprint_dir = os.path.dirname(__file__)
    app_dir = os.path.dirname(blueprint_dir)
    
    inventory_dir = os.path.join(app_dir, static, photos)
    
    # folder labeled by id
    # storage of all other info done in database
    product_photos_folders = os.listdir(inventory_dir)

    product_list = []

    db_products = Product.query.all()
    for product in db_products:
        product_object = {}
        product_object['id'] = product.id
        product_object['description'] = product.description
        product_object['details'] = product.details
        product_object['price'] = product.price
        product_object['status'] = product.status

        # look for folder
        for photo_folder in product_photos_folders:
            if(photo_folder == '.DS_Store'):
                continue
            if int(photo_folder) == product.id:
                folder_path = os.path.join(inventory_dir, photo_folder)
                photos_list = os.listdir(folder_path)   
                product_object['photos_list'] = photos_list

        product_list.append(product_object)

    json_data = json.dumps(product_list)

    return json_data

@main_blueprint.route('/special_order')
def special_order():
    
    return render_template('special_order.html')

@main_blueprint.route('/special_order_formObject', methods=['POST'])
def order_form():
    form_dict = request.json

    new_special_order = SpecialOrder(style=form_dict['style'], color=form_dict['color'], band=form_dict['band'], notes=form_dict['notes'], contact=form_dict['contact'])
    # save to db
    db.session.add(new_special_order)
    db.session.commit()

    # send email to owner with flask-mail
    email_special_order(form_dict)

    #TODO: add in a tracker for the email failing or succeeding?
    
    return 'order sent'

@main_blueprint.route('/thank_you')
def thank_you():

    return render_template('thank_you.html')

@main_blueprint.route('/inventoryProductRequest', methods=['POST'])
def product_request():

    info_dict = request.json

    # create a new db productRequest
    new_req = ProductRequest(product_id = info_dict['id'], contact_info = info_dict['contact_info'], date_created = info_dict['date_created'])
    db.session.add(new_req)
    db.session.commit()

    id = info_dict['id']
    # set product status as pending
    product = Product.query.filter_by(id = id).first()
    print(product)
    product.status = 1
    db.session.add(product)
    db.session.commit()

    # send email out to owner
    email_product_order(product, info_dict['contact_info'])



# TODO: write the emailing portion of the inventory request.
# TODO: the inventory items are pulling all of the db info into their elements.
# TODO: add scrolling effect to the inventory items page as well?