FROM mongo:4-xenial
COPY mongo-keyfile /etc/mongo/mongo-keyfile

RUN chown mongodb:mongodb /etc/mongo/mongo-keyfile && \
    chmod 400 /etc/mongo/mongo-keyfile
CMD [ "mongod", "--keyFile", "/etc/mongo/mongo-keyfile"]