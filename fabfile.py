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
    run('apachectl graceful')


def builddb():
    with cd('/srv/venv/mysite/mysite'):
        with shell_env(DJANGO_CONFIGURATION='Production'):
            sudo("echo 'drop database app_data;create database app_data' | ../../bin/python manage.py dbshell",
                 user="pydev")
            sudo(' ../../bin/python manage.py migrate',
                 user="pydev")
            sudo(' ../../bin/python manage.py runscript setup_test_data',
                 user="pydev")
