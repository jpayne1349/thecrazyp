
from flask import Blueprint, render_template, flash

from flask import current_app as app

import os, json

from app.models import Carousel, Product

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
            if int(photo_folder) == product.id:
                folder_path = os.path.join(inventory_dir, photo_folder)
                photos_list = os.listdir(folder_path)   
                product_object['photos_list'] = photos_list

        product_list.append(product_object)

    json_data = json.dumps(product_list)

    return json_data