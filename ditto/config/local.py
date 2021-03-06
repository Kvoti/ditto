# -*- coding: utf-8 -*-
'''
Local Configurations

- Runs in Debug mode
- Uses console backend for emails
- Use Django Debug Toolbar
'''
import os

from configurations import values
from .common import Common, BASE_DIR


class Local(Common):

    # DEBUG
    DEBUG = values.BooleanValue(True)
    TEMPLATE_DEBUG = DEBUG
    # END DEBUG
    
    # INSTALLED_APPS
    INSTALLED_APPS = Common.INSTALLED_APPS
    # END INSTALLED_APPS

    # Mail settings
    EMAIL_HOST = 'localhost'
    EMAIL_PORT = 1025
    EMAIL_BACKEND = values.Value('django.core.mail.backends.console.EmailBackend')
    # End mail settings

    INTERNAL_IPS = ('127.0.0.1', '10.0.2.2',)

    DATABASES = Common.DATABASES.value
    DATABASES['chat'] = {
        'NAME': 'chat',
        'ENGINE': 'django.db.backends.mysql',
        'USER': 'root',
    }
    
    # django-debug-toolbar
    # MIDDLEWARE_CLASSES = Common.MIDDLEWARE_CLASSES + ('debug_toolbar.middleware.DebugToolbarMiddleware',)
    # INSTALLED_APPS += ('debug_toolbar', 'django_nose')

    # DEBUG_TOOLBAR_CONFIG = {
    #     'DISABLE_PANELS': [
    #         'debug_toolbar.panels.redirects.RedirectsPanel',
    #     ],
    #     'SHOW_TEMPLATE_CONTEXT': True,
    # }
    # end django-debug-toolbar

    # Your local stuff: Below this line define 3rd party libary settings
    TEST_RUNNER = 'django_nose.NoseTestSuiteRunner'

    # FIXME control log level with env var
    # LOGGING = Common.LOGGING
    # LOGGING['formatters'] = {
    #     'verbose': {
    #         'format': '%(asctime)s %(levelname)s %(module)s %(message)s',
    #     }
    # }
    # LOGGING['handlers']['console'] = {
    #     'level': 'DEBUG',
    #     'class': 'logging.StreamHandler',
    #     'formatter': 'verbose',
    # }
    # LOGGING['root'] = {
    #     'level': 'DEBUG',
    #     'handlers': ['console'],
    # }

    WEBPACK_LOADER = {
        'BUNDLE_DIR_NAME': 'bundles/',
        'STATS_FILE': os.path.join(BASE_DIR, '../webpack-stats.json'),
    }
