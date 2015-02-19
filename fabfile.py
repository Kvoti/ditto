from fabric.api import env, cd, run, shell_env, sudo

env.hosts = ['134.213.147.235']
env.user = 'root'
env.key_filename = '~/.ssh/id_di'
env.forward_agent = True


def deploy():
    with cd('/srv/venv/mysite'):
        run('git pull')
        with cd('mysite'), shell_env(DJANGO_CONFIGURATION='Production'):
            sudo(' ../../bin/python manage.py collectstatic --noinput',
                 user="pydev")
    sudo('/srv/venv/bin/pip install -U -r /srv/venv/mysite/requirements/production.txt')
    run('apachectl graceful')


def builddb():
    with cd('/srv/venv/mysite/mysite'):
        with shell_env(DJANGO_CONFIGURATION='Production'):
            sudo("echo 'drop database app_data;create database app_data' | ../../bin/python manage.py dbshell",
                 user="pydev")
            # Set up data for main site
            sudo(' ../../bin/python manage.py migrate',
                 user="pydev")
            sudo(' ../../bin/python manage.py runscript setup_test_data',
                 user="pydev")
    # Set up data for example network for digital impacts
    newnetwork('di')

    
def newnetwork(name):
    # TODO this needs to create the Tenant record in the main 'database'
    with cd('/srv/venv/mysite/mysite'):
        with shell_env(DJANGO_CONFIGURATION='Production', DJANGO_TENANT=name):
            sudo(' ../../bin/python manage.py migrate',
                 user="pydev")
            sudo(' ../../bin/python manage.py runscript setup_test_data',
                 user="pydev")
