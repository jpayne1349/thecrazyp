
from flask import Blueprint, render_template, flash

from flask import current_app as app

import os, json

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

    photos_list = json.dumps(list_of_photos)

    return photos_list