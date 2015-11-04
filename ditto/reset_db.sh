mysqladmin -uroot drop ditto
mysqladmin -uroot create ditto
mysqladmin -uroot drop chat
mysqladmin -uroot create chat
echo 'source /usr/local/lib/mongooseim/lib/ejabberd-2.1.8+mim-1.5.0/priv/mysql.sql' | mysql -uroot chat
MAILGUN_USERNAME=x MAILGUN_PASSWORD=x python manage.py migrate
MAILGUN_USERNAME=x MAILGUN_PASSWORD=x python manage.py runscript setup_test_data
#DJANGO_TENANT=di python manage.py runscript setup_chat_data
sudo mongooseimctl stop
sudo rm -rf /usr/local/lib/mongooseim/MMnesia.mongooseim\@localhost/
sudo mongooseimctl start
