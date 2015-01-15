mysqladmin drop mysite
mysqladmin create mysite
python manage.py migrate
python manage.py runscript setup_test_data
