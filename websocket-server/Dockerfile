FROM python:3.10

RUN mkdir /app
ADD . /app
WORKDIR /app

RUN pip install --upgrade cython
RUN pip install --upgrade pip
RUN pip install --upgrade setuptools
RUN pip install cmake==3.22.2

RUN pip install -r requirements.txt
EXPOSE 5000

CMD ["python", "flask-server.py"]