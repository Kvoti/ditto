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
