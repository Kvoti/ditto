import os
import smtplib
from email.mime.text import MIMEText

from fabric.api import env, cd, run, shell_env, sudo, hosts, execute
from fabric.colors import green

env.hosts = ['134.213.147.235']
env.user = 'root'
#env.key_filename = '~/.ssh/id_rsa'
env.forward_agent = True


def deploy():
    with cd('/srv/venv/ditto'):
        run('git fetch')
        changes = run('git log ..origin/master --oneline --no-color --reverse > /tmp/log; cat /tmp/log')
        run('git merge origin/master')
        with cd('ditto'), shell_env(DJANGO_CONFIGURATION='Production'):
            sudo(' ../../bin/python manage.py collectstatic --noinput',
                 user="pydev")
    sudo('/srv/venv/bin/pip install -U -r /srv/venv/ditto/requirements/production.txt')
    run('apachectl graceful')
    for line in changes.splitlines():
        print green(line)
    execute(email, changes)
    

def builddb():
    with cd('/srv/venv/ditto/ditto'):
        with shell_env(DJANGO_CONFIGURATION='Production'):
            sudo("echo 'drop database app_data;create database app_data' | ../../bin/python manage.py dbshell",
                 user="pydev")
            sudo("echo 'source /usr/lib/mongooseim//lib/ejabberd-2.1.8+mim-1.5.0/priv/mysql.sql' | ../../bin/python manage.py dbshell",
                 user="pydev")
            # Set up data for main site
            sudo(' ../../bin/python manage.py migrate',
                 user="pydev")
            sudo(' ../../bin/python manage.py runscript setup_test_data',
                 user="pydev")
    # Set up data for example network for digital impacts
    newnetwork('di')
    # Restart chat so anything cached by the chat server is forgotten
    sudo('mongooseimctl restart')


def newnetwork(name):
    # TODO this needs to create the Tenant record in the main 'database'
    with cd('/srv/venv/ditto/ditto'):
        with shell_env(DJANGO_CONFIGURATION='Production', DJANGO_TENANT=name):
            sudo(' ../../bin/python manage.py migrate',
                 user="pydev")
            sudo(' ../../bin/python manage.py runscript setup_test_data',
                 user="pydev")
            sudo(' ../../bin/python manage.py runscript setup_chat_data',
                 user="pydev")


@hosts('localhost')
def email(body):
    fromaddr = 'mark@digital-impacts.com'
    toaddrs = ['sarah@digital-impacts.com', 'mark@digital-impacts.com']

    msg = MIMEText(body)
    msg['Subject'] = '[DITTO] deployment'
    msg['From'] = fromaddr
    msg['To'] = ','.join(toaddrs)

    username = 'mark@digital-impacts.com'
    password = os.environ['FAB_EMAIL_PASS']
    server = smtplib.SMTP('smtp.gmail.com:587')
    server.starttls()
    server.login(username, password)
    server.sendmail(fromaddr, toaddrs, msg.as_string())
    server.quit()
