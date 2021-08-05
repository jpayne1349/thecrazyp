
from flask import Flask
from flask_migrate import Migrate
from flask_login import LoginManager, current_user
from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()
migrate = Migrate()

login_manager = LoginManager()

def create_app():
    """Initialize the core application."""
    app = Flask(__name__, instance_relative_config=False)

    app.config.from_object('config.DevelopmentConfig') # grabbing the development config class out of config.py
    # our config file will be located elsewhere

    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)

    login_manager.login_view = 'owner_blueprint.owner_login'


    @app.context_processor
    def logged_in_check():
        def owner():
            if current_user.is_authenticated:
                return True
            else:
                return False
        return dict(owner=owner)

    with app.app_context():

        from .main_blueprint import main # giving the app access to this folder and this file
        from .owner_blueprint import owner 


        app.register_blueprint(main.main_blueprint)  # registering the blueprint inside that file
        app.register_blueprint(owner.owner_blueprint)  


        from . import models  # USED WHEN DB IS NEEDED

        return app




