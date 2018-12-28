# Make file for basic scripts


install-server:
	( \
		pip install virtualenv; \
		virtualenv venv; \
		source venv/bin/activate; \
		pip install -r requirements.txt; \
		cd server/; \
		python app.py db init; \
		python app.py db migrate; \
		python app.py db upgrade; \
	)

run-server:
	( \
		source ./venv/bin/activate; \
		python server/app.py runserver; \
	)