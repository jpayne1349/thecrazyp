
# used to create low resolution copies of photos uploaded by owner

import os
from PIL import Image

# find this file
app_dir = os.path.dirname(__file__)

# static directories that do not change location
high_res_dir = os.path.join(app_dir, 'static/carousel_photos/HighRes')
low_res_dir = os.path.join(app_dir, 'static/carousel_photos/LowRes')
carousel_dir = os.path.join(app_dir, 'static/carousel_photos')
inventory_dir = os.path.join(app_dir, 'static/product_inventory')

# for each high res, look for an already made low res...
def process_carousel():
    # photos list must be taken at function call
    high_res_photos_list = os.listdir(high_res_dir)
    low_res_photos_list = os.listdir(low_res_dir)

    for hr_filename in high_res_photos_list:
        for lr_filename in low_res_photos_list:
            if(hr_filename == lr_filename):
                # found one already processed...
                return
        # if it makes it through, processing is required
        photo_filepath = os.path.join(high_res_dir, hr_filename)
        high_res_photo = Image.open(photo_filepath)
        high_res_photo.resize((538, 404), Image.ANTIALIAS)
        lr_photo_filepath = os.path.join(low_res_dir, hr_filename)
        high_res_photo.save(lr_photo_filepath,optimize=True, quality=5)


def move_files():
    for file in files(carousel_dir):
        if(file == '.DS_Store'):
            continue
        current_file_path = os.path.join(carousel_dir, file)
        new_file_path = os.path.join(carousel_dir, 'HighRes',file)
        os.rename(current_file_path, new_file_path)

    return

def files(path):
    for file in os.listdir(path):
        if os.path.isfile(os.path.join(path, file)):
            yield file


def setup_and_process_inventory():
    product_folders = os.listdir(inventory_dir)
    # .DS_Store will be in here as always
    for folder in product_folders:
        if(folder == '.DS_Store'):
            continue
        new_hr_folder_path = os.path.join(inventory_dir, folder, 'HighRes')
        new_lr_folder_path = os.path.join(inventory_dir, folder, 'LowRes')
        new_hr_folder = os.mkdir(new_hr_folder_path)
        new_lr_folder = os.mkdir(new_lr_folder_path)

        this_product_folder_path = os.path.join(inventory_dir, folder)
        for file in files(this_product_folder_path):
            if(file == '.DS_Store'):
                continue
            current_file_path = os.path.join(this_product_folder_path, file)
            new_file_path = os.path.join(this_product_folder_path, 'HighRes', file)
            os.rename(current_file_path, new_file_path)
            high_res_photo = Image.open(new_file_path)
            high_res_photo.resize((538, 404), Image.ANTIALIAS)
            lr_photo_filepath = os.path.join(this_product_folder_path, 'LowRes', file)
            high_res_photo.save(lr_photo_filepath, optimize=True, quality=5)



if __name__ == '__main__':
    setup_and_process_inventory()
