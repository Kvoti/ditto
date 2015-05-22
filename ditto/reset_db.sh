mysqladmin -uroot drop ditto
mysqladmin -uroot create ditto
#echo 'source /usr/local/lib/mongooseim/lib/ejabberd-2.1.8+mim-1.5.0/priv/mysql.sql' | python manage.py dbshell
python manage.py migrate
python manage.py runscript setup_test_data
DJANGO_TENANT=di python manage.py migrate
DJANGO_TENANT=di python manage.py runscript setup_test_data
DJANGO_TENANT=di python manage.py runscript setup_chat_data
