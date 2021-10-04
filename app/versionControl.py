''' Module used to update the versioning of static files.'''

# TODO: procedurally generate these numbers, or add a hook into the git to make this more automated

import re
import os

regex_for_v = "\?v=(\d+)"

def updateVersion():
    '''Doc: loops all template files. reads, modifies, and writes a new version number into all style/script elements'''

    user_input_version_number = input('What version number?')
    new_version = '?v=' + user_input_version_number

    templates_dir = os.path.join(os.path.dirname(__file__), 'templates')
    templates_file_list = os.listdir(templates_dir)

    for template in templates_file_list:
        templ_filepath = os.path.join(templates_dir, template)

        # original file to be read
        html_file = open(templ_filepath, 'r')
        file_text = html_file.read()
        # regex substitution of matches with created new_version
        new_file_text = re.sub(regex_for_v, new_version, file_text)

        # if the file didnt contain a match, just use the original text in the re-write
        if not new_file_text:
            new_file_text = file_text

        # use the substituted text when creating a new file
        edited_file = open(templ_filepath, 'w')
        edited_file.write(new_file_text)
        edited_file.close()
    
    return 


if __name__ == '__main__':
    updateVersion()