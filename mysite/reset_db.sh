mysqladmin drop mysite
mysqladmin create mysite
python manage.py migrate
python manage.py runscript setup_test_data
DJANGO_TENANT=di python manage.py migrate
DJANGO_TENANT=di python manage.py runscript setup_test_data
