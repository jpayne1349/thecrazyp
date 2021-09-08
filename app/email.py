from flask import current_app, copy_current_request_context
from flask.templating import render_template
from flask_mail import Message
from app import mail
from app.models import User
from threading import Thread

smtp_email = 'southtexassoftwarellc@gmail.com'


# gather owner emails, and send them the special order.
def email_special_order(order_dict):

    all_users = User.query.all()
    user_email_list = []
    for user in all_users:
        user_email_list.append(user.email)

    # just send the data for testing. styling can be done later.
    new_msg = Message('New Special Order - TheCrazyP.com', sender=smtp_email, recipients=current_app.config['ADMINS'])
    
    new_msg.html = render_template('test_email.html', dict=order_dict)

    @copy_current_request_context
    def send_async_email(msg):
        mail.send(msg)

    new_thread = Thread(target=send_async_email, args=(new_msg,))
    new_thread.start()

