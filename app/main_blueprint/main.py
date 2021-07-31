
from flask import Blueprint, render_template, flash

from flask import current_app as app

import os, json

from app.models import Carousel

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

@main_blueprint.route('/inventory_items', methods=['POST'])
def inventory_items():
    # maybe need seperate folders for each item
    # to provide multiple photos

    static = 'static'
    photos = 'inventory_photos'

    blueprint_dir = os.path.dirname(__file__)
    app_dir = os.path.dirname(blueprint_dir)
    
    inventory_dir = os.path.join(app_dir, static, photos)
    
    list_of_products = os.listdir(inventory_dir)

    photos_list = json.dumps(list_of_products)

    return photos_list