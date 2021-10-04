month_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
from flask import Blueprint, render_template, flash, request
from flask import current_app as app
import os, json
from app import db
from app.models import Carousel, Product, SpecialOrder, ProductRequest, SoAvailable
from app.email import email_special_order, email_product_order


# TODO: add a image compression feature to allow quicker load up times
# load the full res images in the background and then swap them out..?
# current max image resolution is 403.5 x 538 , in desktop view.



main_blueprint = Blueprint('main_blueprint', __name__) 


@main_blueprint.route('/')
def homepage():
    track_visitor(request)
    return render_template('homepage.html')

@main_blueprint.route('/carousel_photos', methods=['POST'])
def carousel_photos():
    
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

@main_blueprint.route('/faq')
def faq():
    return render_template('faq.html')

@main_blueprint.route('/load_inventory', methods=['POST'])
def load_inventory():


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
                lr_folder_path = os.path.join(inventory_dir, photo_folder, 'LowRes')
                photos_list = os.listdir(lr_folder_path)
                product_object['photos_list'] = photos_list

        product_list.append(product_object)

    # sort the list of dictionaries based on status value
    product_list.sort(key=returnStatus)
    
    json_data = json.dumps(product_list)

    return json_data

# used in load inventory to sort by product status
def returnStatus(product_object):
    return product_object['status']

@main_blueprint.route('/special_order')
def special_order():

    so_status = SoAvailable.query.all()

    # if SO status has not been set, list above will be empty
    if not so_status:
        return render_template('special_order.html')

    if(so_status[0].status == 'open'):
        return render_template('special_order.html')
    
    # format the stupid date
    new_date = so_status[0].date_string
    date_items_list = new_date.split('-')

    year = date_items_list[0]
    month = date_items_list[1]
    day = date_items_list[2]

    string_month = month_names[int(month) - 1]
    
    new_date_string = string_month + ' ' + day + ', ' + year

    return render_template('closed_special_order.html', date_string=new_date_string)

@main_blueprint.route('/special_order_formObject', methods=['POST'])
def order_form():
    form_dict = request.json

    new_special_order = SpecialOrder(style=form_dict['style'], color=form_dict['color'], band=form_dict['band'], notes=form_dict['notes'], contact=form_dict['contact'], order_status = 0)
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
    new_req = ProductRequest(product_id = info_dict['id'], contact_info = info_dict['contact_info'], date_created = info_dict['date_created'], order_status = 0)
    db.session.add(new_req)
    db.session.commit()

    id = info_dict['id']
    # set product status as pending
    product = Product.query.filter_by(id = id).first()

    if( info_dict['status'] == 0 ):
        product.status = 1
        db.session.add(product)
        db.session.commit()


    # send email out to owner
    email_product_order(product, info_dict['contact_info'], info_dict['status'])


# TODO: add something to the db for this. then add to owner homepage
def track_visitor(request):
    # we could do a db search? that would be pretty time consuming.
    # or we could just do like the date and increment a counter for the day.
    # like site visits
    print("VISITOR IP ", request.remote_addr)

