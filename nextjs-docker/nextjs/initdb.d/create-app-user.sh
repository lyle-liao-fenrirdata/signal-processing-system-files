#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE USER user;
	CREATE DATABASE signal_processing_system;
	GRANT ALL PRIVILEGES ON DATABASE signal_processing_system TO user;
EOSQL