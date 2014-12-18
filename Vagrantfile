$setup = <<SCRIPT
    DEBIAN_FRONTEND=noninteractive apt-get update
SCRIPT

$dependencies = <<SCRIPT
    DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server libmysqlclient-dev
    DEBIAN_FRONTEND=noninteractive apt-get install -y python-dev libjpeg-dev zlib1g-dev
    DEBIAN_FRONTEND=noninteractive apt-get install -y python-virtualenv virtualenvwrapper
    pip install -q -r /vagrant/requirements/local.txt
SCRIPT

$db = <<SCRIPT
    mysql -e "CREATE DATABASE IF NOT EXISTS mysite"
    mysql -e "GRANT ALL on  mysite.* to 'vagrant'@'localhost'"
    cd /vagrant/mysite && python manage.py migrate
SCRIPT

$app = <<SCRIPT
echo "cd /vagrant/mysite && python manage.py runserver 0.0.0.0:8000" > /usr/local/bin/runapp
chmod a+x /usr/local/bin/runapp
SCRIPT

Vagrant.configure('2') do |config|

    config.vm.box = 'precise64'
    config.vm.box_url = "http://files.vagrantup.com/" + config.vm.box + ".box"

    config.ssh.forward_agent = true
    # Forward the dev server port
    config.vm.network :forwarded_port, host: 8000, guest: 8000

    config.vm.provision "shell", inline: $setup
    config.vm.provision "shell", inline: $dependencies
    config.vm.provision "shell", inline: $db
    config.vm.provision "shell", inline: $app
end
