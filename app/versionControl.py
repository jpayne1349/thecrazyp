


# goal of this module is to run a file search and change the static files appended version numbers automatically...

# vers 0.1 of the versionControl.. just search all the templates, and prompt the user to input a new version number, then set all

import re
import os
from bs4 import BeautifulSoup # this is beautifulSoup for easy file manip of html
import codecs

regex_for_v = "\?v=(\d+)"

# currently share folder with 'templates' directory

def updateVersion():

    user_input_version_number = input('What version number?')

    new_version = '?v=' + user_input_version_number

    templates_dir = os.path.join(os.path.dirname(__file__), 'templates')
    
    templates_file_list = os.listdir(templates_dir)

    for template in templates_file_list:
        templ_filepath = os.path.join(templates_dir, template)
        html_file = open(templ_filepath, 'r')
        
        file_text = html_file.read()

        new_file_text = re.sub(regex_for_v, new_version, file_text)

        if not new_file_text:
            new_file_text = file_text

        edited_file = open(templ_filepath, 'w')
        edited_file.write(new_file_text)
        edited_file.close()

        break





        # with open(templ_filepath) as current_file:
        #     print(current_file)

            # soup = BeautifulSoup(current_file, 'html.parser')
            
            # link = soup.link
            # if link:
            #     print('OLD', link['href'])
            #     # check here for a version in this href
            #     old_href = link['href']
            #     new_href = re.sub(regex_for_v, str(new_version), old_href)
            #     if new_href: 
            #         print('NEW',new_href)
            #         soup.link['href'] = new_href

            # script = soup.script
            # if script:
            #     print('OLD', script['src'])
            #     old_src = script['src']
            #     new_src = re.sub(regex_for_v, str(new_version), old_src)
            #     if new_src:
            #         print('NEW', new_src)
            #         soup.script['src'] = new_src
        
        # with open(templ_filepath, "w") as new_file:
        #     new_file.write(str(soup))
            
    
    return 

if __name__ == '__main__':
    updateVersion()