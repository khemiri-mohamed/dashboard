from django.conf import settings
import pymysql, traceback
import psycopg2

def create_db():

    db_engine = settings.DATABASES['default']['ENGINE']
    if 'sqlite3' not in db_engine.lower():

        db_name = settings.DATABASES['default']['NAME']
        db_user = settings.DATABASES['default']['USER']
        db_pass = settings.DATABASES['default']['PASSWORD']
        db_host = settings.DATABASES['default']['HOST']
        db_port = settings.DATABASES['default']['PORT']

        if 'mysql' in db_engine.lower():
            try:
                conn = pymysql.connect(host=db_host, user=db_user, passwd=db_pass)
                cursor = conn.cursor()
                sql = f'CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;'
                conn.ping(reconnect=True)
                cursor.execute(sql)
                cursor.close()

                with conn.cursor() as cursor:
                    cursor.execute("SET GLOBAL max_connections = 100000")

                # print("Database created successfully........")
            except:
                traceback.format_exc()

        elif 'postgresql' in db_engine.lower():
            try:
                connection = psycopg2.connect(
                    database="postgres", user=db_user, password=db_pass, host=db_host, port=db_port
                )
                connection.autocommit = True
                cursor = connection.cursor()
                cursor.execute(f'CREATE database {db_name}')
                connection.close()
                # print("Database created successfully........")
            except:
                ""

        # else:
        #     print("database engine does not recognize !!!")

