#!/usr/bin/env python
import os
import sys

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config")
    os.environ.setdefault("DJANGO_CONFIGURATION", "Local")

    # TODO not sure of the best way to do this. Sensitive production
    # settings are kept in file outside of version control. wsgi.py
    # and manage.py both need to set env vars so these settings are
    # available but the duplication seems a bit untidy
    # if os.environ["DJANGO_CONFIGURATION"] == "Production":
    #     execfile("production-vars.py")
    
    from configurations.management import execute_from_command_line

    execute_from_command_line(sys.argv)
