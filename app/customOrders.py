

# scripts to help create the necessary folders for the custom order builder feature

import os
import shutil

app_dir = os.path.dirname(__file__)
custom_order_directory_path = os.path.join(app_dir, 'static','custom_order_design')



def build():
    custom_order_directory = os.mkdir(custom_order_directory_path)

    return print('created', custom_order_directory_path)


def get_design():
    '''BUILD a json string of the current design structure'''
    design_tree = []

    categories = os.listdir(custom_order_directory_path)
    for category in categories:
        category_obj = {}
        category_obj['category'] = category
        category_path = os.path.join(custom_order_directory_path, category)

        options = os.listdir(category_path)
        category_obj['options'] = options

        for option in options:
            hr_photo = os.listdir(os.path.join(category_path, option, 'HighRes'))
            lr_photo = os.listdir(os.path.join(category_path, option, 'LowRes'))
            if hr_photo:
                photos_dict = {
                    'hr_photo': hr_photo[0],
                    'lr_photo': lr_photo[0]
                }
                
                category_obj[option] = photos_dict
        
        design_tree.append(category_obj)

    return design_tree

def process_request(request_dict):
    contents = request_dict['contents']

    if contents == 'new_category':
        create_new_category(request_dict['category'])
        return

    if contents == 'new_option':
        create_new_option(request_dict['category'], request_dict['option'])
        return

    if contents == 'delete_category':
        delete_category(request_dict['category'])
        return

    if contents == 'delete_option':
        delete_option(request_dict['category'], request_dict['option'])
        return

    if contents == 'edit_category':
        edit_category(request_dict['old_name'], request_dict['new_name'])
        return


def create_new_category(category_name):
    new_category_path = os.path.join(custom_order_directory_path, category_name)
    new_category_dir = os.mkdir(new_category_path)

    return print('created', new_category_path)

def delete_category(category_name):
    category_path = os.path.join(custom_order_directory_path, category_name)
    shutil.rmtree(category_path)

    return print('removed', category_path)


def create_new_option(category_name, option_name):
    new_option_path = os.path.join(custom_order_directory_path, category_name , option_name)
    new_option_dir = os.mkdir(new_option_path)

    lr_dir_path = os.path.join(new_option_path, 'LowRes')
    lr_dir = os.mkdir(lr_dir_path)
    hr_dir_path = os.path.join(new_option_path, 'HighRes')
    hr_dir = os.mkdir(hr_dir_path)

    return print('created', new_option_path)

def delete_option(category_name, option_name):
    option_path = os.path.join(custom_order_directory_path, category_name, option_name)
    shutil.rmtree(option_path)

    return print('removed', option_path)

def get_option_path(category_name, option_name):

    option_path = os.path.join(custom_order_directory_path, category_name, option_name)

    return option_path

def get_photo_hr_path(category_name, option_name, photo_name):
    photo_path = os.path.join(custom_order_directory_path, category_name, option_name , 'HighRes' , photo_name)

    return photo_path

def get_photo_lr_path(category_name, option_name, photo_name):
    photo_path = os.path.join(custom_order_directory_path, category_name, option_name , 'LowRes' , photo_name)

    return photo_path

def get_photo_hr_src(category_name, option_name, photo_name):

    ''' photo path from static forward '''
    hr_photo_src_path = os.path.join('static', 'custom_order_design', category_name, option_name, 'HighRes', photo_name)

    return hr_photo_src_path

def edit_category(old_category_name, new_category_name):
    category_path = os.path.join(custom_order_directory_path, old_category_name)

    new_category_path = os.path.join(custom_order_directory_path, new_category_name)

    os.rename(category_path, new_category_path)

    print('renamed', new_category_path)

    return