import psycopg2
from psycopg2 import pool
import psycopg2.extras
import psycopg2.extensions
from typing import Union, List, Dict, Any, Tuple
import logging
from os.path import join
from os import system
from os import environ as env
from time import time


class DataError(Exception):
    pass


class Database:

    @staticmethod
    def createDatabaseBackup():
        """ Create (save) backup of current version of the database.
            Saved file names are in format sport_db_backup{timestamp_in_ms}.bak
        """
        DB_HOST = env.get("DB_HOST")
        DB_NAME = env.get("DB_NAME")
        DB_USER = env.get("DB_USER")
        DB_PASS = env.get("DB_PASS")
        system(f'pg_dump "host={DB_HOST} port=5432 dbname={DB_NAME} user={DB_USER} password={DB_PASS}" > '
               f'db/backups/sport_db_backup{int(round(time() * 1000))}.bak')

    def __init__(self, dbPool: psycopg2.pool.ThreadedConnectionPool):
        """ Initialize DB pool and DB logger. """

        self.dbPool = dbPool

        LOG_PATH = "logs"
        LOG_FILE = "db"
        name = join(LOG_PATH, LOG_FILE)

        formatter = logging.Formatter('%(asctime)s %(levelname)-8s %(message)s')

        handler = logging.FileHandler(name + ".log", mode='a')
        handler.setFormatter(formatter)

        logger = logging.getLogger(name)
        logger.setLevel(logging.DEBUG)
        logger.addHandler(handler)

        self.logger = logger

    def _getConnection(self) -> psycopg2.extensions.connection:
        """ Establish and return connection from DB pool.

            Returns:
                psycopg2.extensions.connection: DB connection from DB pool
        """
        dbConn = self.dbPool.getconn()
        return dbConn

    def _releaseConnection(self, dbConnection: psycopg2.extensions.connection):
        """ Releases connection.

        Args:
            dbConnection (psycopg2.extensions.connection): database connection
        """

        self.dbPool.putconn(dbConnection)

    def getSecretary(self, email: str) -> Union[None, dict]:
        """ Use in secretary login process.

        Args:
            email (str): entered admin email

        Returns:
            Union[None, dict]: dict of record in DB which email is same as entered email
        """

        sql = "select * from users where email=%s and type='secretary'"
        result = None
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql, (email,))
                    result = cursor.fetchone()
            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return result

    def getAdmin(self, email: str) -> Union[None, dict]:
        """ Use in admin login process.

        Args:
            email (str): entered admin email

        Returns:
            Union[None, dict]: dict of record in DB which email is same as entered email
        """

        sql = "select * from users where email=%s and type='admin'"
        result = None
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql, (email,))
                    result = cursor.fetchone()
            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return result

    def getAllCountries(self) -> List[Dict[str, Any]]:
        """  Returns all active countries from table countries.

        Returns:
            List[Dict[str, Any]]: list of dicts , each dict contains keys name, code
        """

        sql = "select code, name from country where is_active = true"
        countries = []
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql)
                    tmp = cursor.fetchone()
                    while tmp:
                        countries.append({"name": tmp[1], "code": tmp[0]})
                        tmp = cursor.fetchone()
            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            # print(result)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return countries

    def getAllSports(self) -> List[Dict[str, Any]]:
        """ Returns all sports from table sports.

        Returns:
            List[Dict[str, Any]]:  list of dicts , each dict contains keys title, code
        """

        sql = "select code, title from sport"
        sports = []
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql)
                    tmp = cursor.fetchone()
                    while tmp:
                        sports.append({"title": tmp[1], "code": tmp[0]})
                        tmp = cursor.fetchone()
            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return sports

    def getInactiveCountries(self) -> Dict[str, List[Dict[str, Any]]]:

        """ Get all inactive countries from table countries.

            Returns:
                dict:  dict with one key = countries, its value is
                list of dicts , each dict contains keys name, code
        """

        sql = "select code, name from country where is_active = false"
        result = {"countries": []}
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql)
                    tmp = cursor.fetchone()
                    while tmp:
                        result["countries"].append({"name": tmp[1], "code": tmp[0]})
                        tmp = cursor.fetchone()
            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            # print(result)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return result

    def getBranchesWithSports(self) -> List[Dict[str, Any]]:

        """  Returns non combi branches from table branch with sport they belong to.

        Returns:
            list:  list of dicts , each dict contains keys sportCode, sportTitle, branchCode, branchTitle.
        """

        sql = "select s.code, s.title, b.code, b.title from sport s join branch b on b.sport_id = s.id"
        results = []
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql)
                    tmp = cursor.fetchone()
                    while tmp:
                        results.append(
                            {"sportCode": tmp[0], "sportTitle": tmp[1], "branchCode": tmp[2], "branchTitle": tmp[3]})
                        tmp = cursor.fetchone()
            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return results

    def getFundingData(self, country_code: str) -> Dict[str, List[Dict[str, Any]]]:
        """ Returns funding data from table funding for selected country.

        Args:
            country_code (str): selected country code

        Returns: Dict[str, List[Dict[str, Any]]]: list of dicts , each dict contains keys branch_id,
        absolute_funding, currency.

        """

        sql = "select b.title, f.absolute_funding, f.currency from funding f cross join country c " \
              "join branch b on c.code = %(country_code)s and f.country_id = c.id and b.id = f.branch_id"
        result = {"funding": []}
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql, {"country_code": country_code})
                    tmp = cursor.fetchone()
                    while tmp:
                        result["funding"].append({"branch_id": tmp[0], "absolute_funding": tmp[1], "currency": tmp[2]})
                        tmp = cursor.fetchone()
            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            # print(result)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return result

    def getFundingDistinctCurrencies(self) -> List[str]:
        """
            Get list of currencies used in funding data in table funding.

            Returns:
                list: list of strings = currency names.
        """

        sql = " select distinct currency from funding where currency != '' "
        results = []
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                    cursor.execute(sql)
                    results = cursor.fetchall()
            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return results

    def getSuccessBySport(self, sport_code: str) -> Dict[str, List[Dict[str, Any]]]:
        """ Return success records from table success for selected sport.

        Args:
            sport_code (str): code of selected sport

        Returns:
            dict: dict with one key = success, its value is list of dicts, each dict contains
            keys country_name, points, order
        """

        sql = "select c.name, suc.points, suc.orders from success suc cross join sport sp " \
              "join country c on suc.sport_id = sp.id and sp.code = %(sport_code)s " \
              "and suc.country_id = c.id order by suc.orders;"
        result = {"success": []}
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql, {"sport_code": sport_code})
                    tmp = cursor.fetchone()
                    while tmp:
                        result["success"].append({"country_name": tmp[0], "points": tmp[1], "order": tmp[2]})
                        tmp = cursor.fetchone()
            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            # print(result)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return result

    def getSuccessByCountry(self, country_code: str) -> Dict[str, List[Dict[str, Any]]]:
        """ Return success records from table success for selected country.

        Args:
            country_code (str): code of selected country

        Returns:
            dict: dict with one key = success, its value is list of dicts, each dict contains
            keys sport_name, points, order
        """

        sql = "select sp.title, suc.points, suc.orders from success suc cross join sport sp " \
              "join country c on suc.sport_id = sp.id and c.code = %(country_code)s " \
              "and suc.country_id = c.id order by suc.orders;"
        result = {"success": []}
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql, {"country_code": country_code})
                    tmp = cursor.fetchone()
                    while tmp:
                        result["success"].append({"sport_name": tmp[0], "points": tmp[1], "order": tmp[2]})
                        tmp = cursor.fetchone()
            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            # print(result)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return result

    def getInterconnectnessData(self, type_id: int, country_code: str) -> Dict[str, List[Dict[str, Any]]]:
        """ Returns data from table interconnectness for specified country.

                Args:
                    type_id (int): type of intesconnectness, 1 = economic, 2 = non economic
                    country_code (str): code of country

                Returns:
                    dict: dict with one key interconnectness which value is list of dicts with keyscountry, value, type
        """

        sql = "select c2.code, c2.name, i.value, it.title  from interconnectness i join country c1 " \
              "on country_one_id = c1.id join country c2 on country_two_id = c2.id join interconnectness_type it " \
              "on i.type_id = it.id where i.type_id = %(type_id)s and c1.code = %(country_code)s "
        result = {"interconnectness": []}
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql, {"type_id": type_id, "country_code": country_code})
                    tmp = cursor.fetchone()
                    while tmp:
                        result["interconnectness"].append(
                            {"code": tmp[0], "country": tmp[1], "value": tmp[2], "type": tmp[3]})
                        tmp = cursor.fetchone()
            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            # print(result)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return result

    # inputs to DB

    def addSport(self, code: str, title: str) -> bool:
        """ Adding a new sport to DB.

            Args:
                code (str): code of new sport
                title (str): title of new sport

            Returns:
                bool: true/false whether sport was successfully added
        """
        sql_check = "select * from sport where code = %(code)s"
        sql = "insert into sport(code, title) values (%(code)s, %(title)s);"
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql_check, {"code": code})
                    tmp = cursor.fetchone()
                    if tmp is not None:  # sport code already exists
                        self._releaseConnection(dbConn)
                        raise DataError(
                            "unable to insert, sport with entered code already exists, please select another code")
                    cursor.execute(sql, {"code": code, "title": title})
                    dbConn.commit()
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return True
        except (psycopg2.DatabaseError, DataError) as error:
            # print(error)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            self.logger.error(error)
            return False

    def addBranch(self, data: Dict[str, Any]) -> bool:
        """ Adding a new branch to DB.

            Args:
                data (dict): dict with keys sportCode, branchCode, branchTitle to describe new branch

            Returns:
                bool: true/false whether branch was successfully added
        """
        if "sportCode" not in data:
            raise DataError("sport code missing in data")

        if "branchCode" not in data:
            raise DataError("branch code not in data")

        if "branchTitle" not in data:
            raise DataError("branch title not in data")

        sql_sport = "select id from sport where code = %(sport_code)s"
        sql_check = "select s.id, b.title from sport s join branch b on s.id = b.sport_id " \
                    "and s.code = %(sport_code)s and b.code = %(branch_code)s"
        sql = "insert into branch(code, title, is_combined, sport_id) " \
              "values ( %(code)s, %(title)s, %(is_combined)s, %(sport_id)s )"
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql_sport, {"sport_code": data["sportCode"]})
                    tmp = cursor.fetchone()
                    if tmp is None:
                        self._releaseConnection(dbConn)

                        raise DataError(
                            f"unable to insert, sport with entered code doesnt exist, please select another code")
                    sport_id = tmp[0]

                    cursor.execute(sql_check, {"sport_code": data['sportCode'], "branch_code": data['branchCode']})
                    tmp = cursor.fetchone()
                    if tmp is not None:  # branch code already exists
                        self._releaseConnection(dbConn)
                        raise DataError(
                            f"unable to insert, branch with entered code already exists - {tmp[1]}, "
                            f"please select another code")

                    cursor.execute(sql,
                                   {"code": data['branchCode'], "title": data['branchTitle'], "is_combined": 'false',
                                    "sport_id": sport_id})
                    dbConn.commit()
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return True
        except (psycopg2.DatabaseError, DataError) as error:
            # print(error)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            self.logger.error(error)
            return False

    def addCombiBranch(self, data: Dict[str, Any]) -> bool:
        """ Adding a new combi branch to DB.

        Args:
            data (dict): dict with items branchCode -> int , branchTitle -> str, countryCode -> str, subBranches -> list
            subbranches value is list of dicts with keys sportCode, branchCode, coefficient which describe subbranch


        Returns:
            bool: true/false whether combi branch was successfully added

        """

        if "branchCode" not in data:
            raise DataError("branch code missing in data")

        if "branchTitle" not in data:
            raise DataError("branch title missing in data")

        if "countryCode" not in data:
            raise DataError("country code missing in data")

        if "subBranches" not in data:
            raise DataError("subBranches data missing")

        if not isinstance(data["subBranches"], list):
            raise DataError("invalid subBranches data structure")

        suma = 0
        try:
            for i in data["subBranches"]:
                suma += i["coefficient"]
            if suma != 1:
                raise DataError("coefficients sum is not 1")
        except KeyError:
            try:
                raise DataError("invalid subbranch data structure")
            except DataError as e:
                self.logger.error(e)
        except DataError as e:
            self.logger.error(e)

        sql_check_unique = "select * from branch where code = %(branch_code)s"
        sql_country_exists = "select id from country where code = %(country_code)s"
        sql_sub_exists = "select b.id from branch b join sport s on s.id = b.sport_id " \
                         "and s.code =  %(sport_code)s and b.code = %(branch_code)s"

        sql_insert = "insert into branch(code, title, is_combined, country_id) " \
                     "values (%(code)s, %(title)s, %(is_combined)s, %(country_id)s ) returning id"
        sql_connect = "insert into combi_branch(combi_branch_id, subbranch_id, coefficient) " \
                      "values (%(combi_branch_id)s, %(subbranch_id)s, %(coefficient)s )"

        inserting_data = []

        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:

                    cursor.execute(sql_check_unique, {"branch_code": data['branchCode']})
                    tmp = cursor.fetchone()
                    if tmp is not None:  # branch code already exists
                        self._releaseConnection(dbConn)
                        raise DataError("branch with entered code already exists")

                    cursor.execute(sql_country_exists, {"country_code": data["countryCode"]})
                    tmp = cursor.fetchone()
                    if tmp is None:
                        self._releaseConnection(dbConn)
                        raise DataError("country with entered code does not exist")
                    country_id = tmp[0]

                    for sub in data["subBranches"]:
                        try:
                            cursor.execute(sql_sub_exists,
                                           {"sport_code": sub["sportCode"], "branch_code": sub["branchCode"]})
                        except KeyError:
                            self._releaseConnection(dbConn)
                            raise DataError("invalid subBranches data structure")
                        tmp = cursor.fetchone()
                        if tmp is None:
                            self._releaseConnection(dbConn)
                            raise DataError("subBranches does not exist")
                        else:
                            inserting_data.append((tmp[0], sub["coefficient"]))

                    cursor.execute(sql_insert,
                                   {"code": data["branchCode"], "title": data["branchTitle"], "is_combined": True,
                                    "country_id": country_id})
                    tmp = cursor.fetchone()
                    newBranchId = tmp[0]

                    for item in inserting_data:
                        cursor.execute(sql_connect, {"combi_branch_id": newBranchId, "subbranch_id": item[0],
                                                     "coefficient": item[1]})

                    dbConn.commit()

            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return True
        except (psycopg2.DatabaseError, DataError) as error:
            # print(error)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            self.logger.error(error)
            return False

    def addCountry(self, data: Dict[str, Any]) -> bool:
        """ Activating inactive or adding a new country to DB.

        Args:
            data (dict): dict with keys name, translation, code which describe country

        Returns:
            bool: true/false whether combi country was successfully added / activated
        """

        if "name" not in data:
            raise DataError("country name missing in data")

        if "translation" not in data:
            raise DataError("translation to slovak missing in data")

        if "code" not in data:
            raise DataError("country code missing in data")

        sql_check = "select name, is_active from country where code=%(code)s"
        sql_activate = "update country set is_active = true where code = %(code)s"
        sql_add = "insert into country(name, is_active, translation, code) " \
                  "values ( %(name)s, %(is_active)s, %(translation)s, %(code)s )"

        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:

                    cursor.execute(sql_check, {"code": data['code']})
                    tmp = cursor.fetchone()
                    if tmp is None:  # adding completely new country

                        cursor.execute(sql_add,
                                       {"name": data["name"], "is_active": True, "translation": data["translation"],
                                        "code": data["code"]})
                        dbConn.commit()

                    else:  # activating country

                        if tmp[1] is True or tmp[0] != data["name"]:  # country already active
                            self._releaseConnection(dbConn)
                            raise DataError(
                                f"country with entered code already exists - {tmp[0]}, please select another code")

                        cursor.execute(sql_activate, {"code": data["code"]})
                        dbConn.commit()

            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return True
        except (psycopg2.DatabaseError, DataError) as error:
            # print(error)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            self.logger.error(error)
            return False

    def updateSport(self, data: Dict[str, Any]) -> bool:
        """ Updating sport code or title or both.

        Args:
            data (dict): dict with keys oldCode, newCode newTitle which describe sport and changes

        Returns:
            bool: true/false whether sport was successfully updated
        """

        if "oldCode" not in data:
            raise DataError("sport data do not contain old code")
        if "newCode" not in data:
            raise DataError("sport data do not contain new code")
        if "newTitle" not in data:
            raise DataError("sport data do not contain new title")

        sql_check = "select id from sport where code = %(old_code)s"
        sql = "update sport set code=%(new_code)s, title= %(new_title)s where id= %(id)s"
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql_check, {"old_code": data['oldCode']})
                    tmp = cursor.fetchone()
                    if tmp is None:  # sport doesnt exist
                        self._releaseConnection(dbConn)
                        raise DataError("unable to update sport, sport with entered code doesnt exist")
                    cursor.execute(sql, {"new_code": data['newCode'], "new_title": data['newTitle'], "id": tmp[0]})
                dbConn.commit()
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return True
        except (psycopg2.DatabaseError, DataError) as error:
            # print(error)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            self.logger.error(error)
            return False


    def importFundingData(self, country_id: id, branch_id: id, amount: float, currency: str):
        """Adds 1 fund into database.

                   Args:
                       country_id: id representation of country
                       branch_id: id representation of branch
                       amount: how much money was funded
                       currency: ISO 4217 of fund currency

                   Returns:
                       bool: true/false whether importing was successfull
        """
        sql_del = "delete from funding where country_id=%(country_id)s and branch_id=%(branch_id)s"

        sql = "insert into funding(country_id, branch_id, absolute_funding, currency) " \
              "values (%(country_id)s, %(branch_id)s, %(amount)s, %(currency)s)"

        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql_del, {"country_id": country_id, "branch_id": branch_id})
                    cursor.execute(sql, {"country_id": country_id, "branch_id": branch_id, "amount": amount,
                                         "currency": currency})
                dbConn.commit()
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return True
        except psycopg2.DatabaseError as error:
            # print(error)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            self.logger.error(error)
            return False


    def deleteBGS(self):
        """deletes BGS table, restarts serial identity

                   Args:

                   Returns:
                       bool: true/false whether deleting was successfull
           """
        sql = "TRUNCATE BGS RESTART IDENTITY "

        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql)
                dbConn.commit()
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return True
        except psycopg2.DatabaseError as error:
            # print(error)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            self.logger.error(error)
            return False

    def importBGSdata(self, sport_id: id, value: int):
        """add BGS record into database
                   Args:
                        sport_id: id representation of sport
                        value: int value of BGS
                   Returns:
                        bool: true/false whether import was successfull
        """
        sql = "insert into BGS(sport_id, value) " \
                "values (%(sport_id)s, %(value)s)"

        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql, {"sport_id": sport_id,  "value": value})
                dbConn.commit()
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return True
        except psycopg2.DatabaseError as error:
            # print(error)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            self.logger.error(error)
            return False



    def deleteSuccesTables(self):
        """deletes all tables that are used with success data
                   Args:

                   Returns:
                        bool: true/false whether deleting was successfull
        """
        sql = "TRUNCATE  COUNTRY_BEST_ORDER, TOTAL_COUNTRY_POINTS," \
              " MAX_POINTS_IN_SPORT, NUM_IN_SPORT, success RESTART IDENTITY "

        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql)
                dbConn.commit()
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return True
        except psycopg2.DatabaseError as error:
            # print(error)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            self.logger.error(error)
            return False

    def importSuccessdata(self, sport_id: id, country_id: id, points: float, orders: int):
        """add success record into DB
                   Args:
                        sport_id: id representation of sport
                        country_id: id representation of country
                        points: float, how many points did country get in sport
                        orders: int, in which place did the country ended up
                   Returns:
                        bool: true/false whether importing was successfull
        """
        sql = "insert into success(sport_id, country_id, points, orders) " \
              "values (%(sport_id)s, %(country_id)s, %(points)s, %(orders)s)"

        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql, {"sport_id": sport_id, "country_id": country_id, "points": points,
                                         "orders": orders})
                dbConn.commit()
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return True
        except psycopg2.DatabaseError as error:
            # print(error)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            self.logger.error(error)
            return False

    def importNumberInSports(self, sport_id: id, num_countries: int):
        """add how many sports were ranked in specific sport
                   Args:
                        sport_id: id represenation of sport,
                        num_countries: how many countries are in the success ranking
                   Returns:
                        bool: true/false whether importing was successfull
        """
        sql = "insert into NUM_IN_SPORT(sport_id, num_countries) " \
              "values (%(sport_id)s, %(num_countries)s)"
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql, {"sport_id": sport_id, "num_countries": num_countries})
                dbConn.commit()
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return True
        except psycopg2.DatabaseError as error:
            # print(error)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            self.logger.error(error)
            return False

    def importMaxPointsInSport(self, sport_id: id, points: float):
        """add highest points in specific sport
                         Args:
                              sport_id: id represenation of sport,
                              points: maximum of the points in sport
                         Returns:
                              bool: true/false whether importing was successfull
        """
        sql = "insert into MAX_POINTS_IN_SPORT(sport_id, points) " \
              "values (%(sport_id)s, %(points)s)"
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql, {"sport_id": sport_id, "points": points})
                dbConn.commit()
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return True
        except psycopg2.DatabaseError as error:
            # print(error)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            self.logger.error(error)
            return False

    def importTotalCountryPoints(self, country_id: id, points: float):
        """add sum of points above all sports for specific country
                         Args:
                              country_id: id represenation of country,
                              points: sum of points from all sports
                         Returns:
                              bool: true/false whether importing was successfull
        """
        sql = "insert into TOTAL_COUNTRY_POINTS(country_id, points) " \
              "values (%(country_id)s, %(points)s)"
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql, {"country_id": country_id, "points": points})
                dbConn.commit()
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return True
        except psycopg2.DatabaseError as error:
            # print(error)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            self.logger.error(error)
            return False

    def importCountryBestOrder(self, country_id: id, best: int):
        """add best placement of specific country
                         Args:
                              country_id: id represenation of country,
                              points: best placement of country
                         Returns:
                              bool: true/false whether importing was successfull
        """
        sql = "insert into COUNTRY_BEST_ORDER(country_id, best) " \
              "values (%(country_id)s, %(best)s)"
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql, {"country_id": country_id, "best": best})
                dbConn.commit()
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return True
        except psycopg2.DatabaseError as error:
            # print(error)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            self.logger.error(error)
            return False


    def deleteInterconnectednessTables(self, type_id: id):
        """deletes data from interconnectedness table, with specific type_id
                         Args:
                              type_id: type of interconnectedness ( 1 economic, 2 non-economic )

                         Returns:
                              bool: true/false whether deleting was successfull
        """
        sql_del = "DELETE FROM interconnectness WHERE type_id =%(type_id)s   "

        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql_del, {"type_id": type_id})
                dbConn.commit()
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return True
        except psycopg2.DatabaseError as error:
            # print(error)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            self.logger.error(error)
            return False

    def importInterconnectednessData(self, type_id: id, country_one_id: id, country_two_id: id, value: float):
        """imports interconnectedness record
                              Args:
                                   type_id: type of interconnectedness ( 1 economic, 2 non-economic )
                                   country_one_id: id representation of country
                                   country_two_id: id representation of country ( they can not match )
                                   value: value of interconnectedness between country1 and country2

                              Returns:
                                   bool: true/false whether deleting was successfull
        """
        sql = "insert into interconnectness(type_id, country_one_id, country_two_id, value ) " \
              "values (%(type_id)s, %(country_one_id)s, %(country_two_id)s , %(value)s)"
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql, {"type_id": type_id, "country_one_id": country_one_id,
                                         "country_two_id": country_two_id, "value": value})
                dbConn.commit()
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return True
        except psycopg2.DatabaseError as error:
            #print(error)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            self.logger.error(error)
            return False

    # getters for DB mirroring in data computation modul

    def getBGS(self) -> Dict[str, List[Dict[str, Any]]]:
        """ Get all records from table BGS.

        Returns:
            Dict[str, List[Dict[str, Any]]]: dict with one key BGS,
            which value is list of dicts with keys sport_id, value
        """

        sql = "select sport_id, value from BGS"
        result = {"BGS": []}
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql)
                    tmp = cursor.fetchone()
                    while tmp:
                        result["BGS"].append({"sport_id": tmp[0], "value": tmp[1]})
                        tmp = cursor.fetchone()
            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            # print(result)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)

            result = result["BGS"]
            final_result = {}

            for record in result:
                final_result[record["sport_id"]] = record["value"]

            return final_result

    def getOrder(self) -> Dict[int, Dict[int, int]]:
        """ Get order of each country in each sport from table success .

        Returns:
            Dict[int, Dict[int, int]]:  dict with keys = country ids, its value is dict
            with items sport id -> order
        """

        sql = "select country_id, sport_id, orders from success"
        result = {"order": []}
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql)
                    tmp = cursor.fetchone()
                    while tmp:
                        country_id, sport_id, order = tmp
                        result["order"].append({"country_id": country_id, "sport_id": sport_id, "order": order})
                        tmp = cursor.fetchone()

            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            # print(result)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            final_result = {}

            for record in result["order"]:

                country_id, sport_id, order = record["country_id"], record["sport_id"], record["order"]

                if record["country_id"] not in final_result:
                    final_result[country_id] = {}

                final_result[country_id][sport_id] = order

            return final_result

    def getPoints(self) -> Dict[id, Dict[id, float]]:
        """ Get points of each country in each sport from table success .

        Returns:
             Dict[id, Dict[id, float]]:  dict with keys = country ids, its value is dict
            with items sport id -> points
        """

        sql = "select country_id, sport_id, points from success"
        result = {"points": []}
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql)
                    tmp = cursor.fetchone()
                    while tmp:
                        country_id, sport_id, points = tmp
                        result["points"].append({"country_id": country_id, "sport_id": sport_id, "points": points})
                        tmp = cursor.fetchone()

            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            # print(result)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            final_result = {}

            for record in result["points"]:

                country_id, sport_id, points = record["country_id"], record["sport_id"], record["points"]

                if record["country_id"] not in final_result:
                    final_result[country_id] = {}

                final_result[country_id][sport_id] = points

            return final_result

    def getMaxPoints(self) -> Dict[id, float]:
        """ Get maximum points for each country in any sport from table MAX_POINTS_IN_SPORT.

        Returns:
            Dict[id,float]:  dict with keys = sport ids, its value is max points
        """

        sql = "select sport_id, points from MAX_POINTS_IN_SPORT"
        result = {"points": []}
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql)
                    tmp = cursor.fetchone()
                    while tmp:
                        sport_id, points = tmp
                        result["points"].append({"sport_id": sport_id, "points": points})
                        tmp = cursor.fetchone()

            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            # print(result)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            final_result = {}

            for record in result["points"]:
                sport_id, points = record["sport_id"], record["points"]

                final_result[sport_id] = points

            return final_result

    def getNumCountriesInSport(self) -> Dict[id, int]:
        """ Getter for table NUM_IN_SPORT which contains number of countries ranked in a sport.

        Returns:
            Dict[id, int]: dict sport id -> number of countries
        """

        sql = "select sport_id, num_countries from NUM_IN_SPORT"
        result = {"num": []}
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql)
                    tmp = cursor.fetchone()
                    while tmp:
                        sport_id, num = tmp
                        result["num"].append({"sport_id": sport_id, "num": num})
                        tmp = cursor.fetchone()

            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            # print(result)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            final_result = {}

            for record in result["num"]:
                sport_id, num = record["sport_id"], record["num"]

                final_result[sport_id] = num

            return final_result

    def getTotalCountryPoints(self) -> Dict[id, float]:
        """ Get sum of points in all sport in a country.

        Returns:
            Dict[id, float]: dict of country id -> sum of points
        """
        sql = "select country_id, points from TOTAL_COUNTRY_POINTS"
        result = {"sum": []}
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql)
                    tmp = cursor.fetchone()
                    while tmp:
                        country_id, suma = tmp
                        result["sum"].append({"country_id": country_id, "sum": suma})
                        tmp = cursor.fetchone()

            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            # print(result)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            final_result = {}

            for record in result["sum"]:
                country_id, suma = record["country_id"], record["sum"]

                final_result[country_id] = suma

            return final_result

    def getMinOrder(self) -> Dict[id, float]:
        """Get minimum = best order of country in any sport.

        Returns:
            Dict[id, float]: dict of country id -> order
        """

        sql = "select country_id, best from COUNTRY_BEST_ORDER "
        result = {"order": []}
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql)
                    tmp = cursor.fetchone()
                    while tmp:
                        country_id, order = tmp
                        result["order"].append({"country_id": country_id, "order": order})
                        tmp = cursor.fetchone()

            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            # print(result)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            final_result = {}

            for record in result["order"]:
                country_id, order = record["country_id"], record["order"]

                final_result[country_id] = order

            return final_result

    def getEconIntercon(self) -> Dict[id, Dict[id, float]]:
        """ Returns all economic interconnectness records from table interconnectness.

        Returns:
            Dict[id, Dict[id, float]]: dict of country id -> dict of country id -> econ interconnectness
        """
        sql = "select country_one_id, country_two_id, value from interconnectness where type_id = 1"
        result = {"inter": []}
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql)
                    tmp = cursor.fetchone()
                    while tmp:
                        country_one_id, country_two_id, value = tmp
                        result["inter"].append(
                            {"country_one_id": country_one_id, "country_two_id": country_two_id, "value": value})
                        tmp = cursor.fetchone()

            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            # print(result)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            final_result = {}

            for record in result["inter"]:
                country_one_id, country_two_id, value = record["country_one_id"], record["country_two_id"], record[
                    "value"]

                if country_one_id not in final_result:
                    final_result[country_one_id] = {}

                final_result[country_one_id][country_two_id] = value

            return final_result

    def getNonEconIntercon(self) -> Dict[id, Dict[id, float]]:
        """ Returns all non economic interconnectness records from table interconnectness.

        Returns:
            Dict[id, Dict[id, float]]: dict of country id -> dict of country id -> non econ interconnectness
        """
        sql = "select country_one_id, country_two_id, value from interconnectness where type_id = 2"
        result = {"inter": []}
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql)
                    tmp = cursor.fetchone()
                    while tmp:
                        country_one_id, country_two_id, value = tmp
                        result["inter"].append(
                            {"country_one_id": country_one_id, "country_two_id": country_two_id, "value": value})
                        tmp = cursor.fetchone()

            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            # print(result)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            final_result = {}

            for record in result["inter"]:
                country_one_id, country_two_id, value = record["country_one_id"], record["country_two_id"], record[
                    "value"]

                if country_one_id not in final_result:
                    final_result[country_one_id] = {}

                final_result[country_one_id][country_two_id] = value

            return final_result

    def getNonCombiBranchFunding(self) -> Dict[id, Dict[id, Dict[id, float]]]:
        """ Get all funding records for NONcombi branches from table funding.

        Returns:
            Dict[id, Dict[id, Dict[id, float]]]: dict of country id -> dict of sport id ->
            dict of branch id -> total non combi branch funding
        """
        sql = "select f.country_id, sport_id, branch_id, sum(absolute_funding)  from funding f join branch b  " \
              "on b.id = f.branch_id  and is_combined = false group by f.country_id, sport_id, branch_id"
        result = {"funding": []}
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql)
                    tmp = cursor.fetchone()
                    while tmp:
                        country_id, sport_id, branch_id, suma = tmp
                        result["funding"].append(
                            {"country_id": country_id, "sport_id": sport_id, "branch_id": branch_id, "sum": suma})
                        tmp = cursor.fetchone()

            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            # print(result)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            final_result = {}

            for record in result["funding"]:
                country_id, sport_id, branch_id, suma = record["country_id"], record["sport_id"], record["branch_id"], \
                                                        record["sum"]

                if country_id not in final_result:
                    final_result[country_id] = {}

                if sport_id not in final_result[country_id]:
                    final_result[country_id][sport_id] = {}

                final_result[country_id][sport_id][branch_id] = suma

            return final_result

    def getActiveCountryIds(self) -> List[Dict[str, Any]]:
        """ Returns active country data.

        Returns:
            List[Dict[str, Any]]: list of dicts, each dict contain keyd id, name = description of country.
        """
        sql = "select id, name from country where is_active = true"
        result = {"countries": []}
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql)
                    tmp = cursor.fetchone()
                    while tmp:
                        result["countries"].append({"id": tmp[0], "name": tmp[1]})
                        tmp = cursor.fetchone()
            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            # print(result)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return result["countries"]


    def getActiveCountryTranslations(self) -> list:
        """ Returns active country data with translations.

              Returns:
                  List[Dict[str, Any]]: list of dicts, each dict contain keyd id, translation = translation of country
              """
        sql = "select id, translation from country where is_active = true"
        result = {"countries": []}
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql)
                    tmp = cursor.fetchone()
                    while tmp:
                        result["countries"].append({"id": tmp[0], "translation": tmp[1]})
                        tmp = cursor.fetchone()
            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            # print(result)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return result["countries"]

    def getSportIds(self) -> List[Dict[str, Any]]:
        """ Returns sports data from table sport.

        Returns:
            List[Dict[str, Any]]: list of dicts, each dict contain keys id, title = description of sport.
        """
        sql = "select id, title from sport"
        result = {"sports": []}
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql)
                    tmp = cursor.fetchone()
                    while tmp:
                        result["sports"].append({"id": tmp[0], "title": tmp[1]})
                        tmp = cursor.fetchone()
            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            # print(result)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return result["sports"]

    def getCombiFunding(self) -> Dict[id, Dict[id, Dict[id, float]]]:

        """ Get all funding records for combi branches from table funding.

        Returns:
            Dict[id, Dict[id, Dict[id, float]]]: dict of country id -> subbranch id -> combi branch id -> funding
        """

        sql = "select b.country_id,  cb.subbranch_id, cb.combi_branch_id, absolute_funding * coefficient as fund " \
              "from branch b join combi_branch cb on b.id = cb.combi_branch_id " \
              "join funding f on f.country_id = b.country_id and f.branch_id = cb.combi_branch_id"

        result = {"funding": []}
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql)
                    tmp = cursor.fetchone()
                    while tmp:
                        result["funding"].append(
                            {"country_id": tmp[0], "subbranch_id": tmp[1], "combi_branch_id": tmp[2], "fund": tmp[3]})
                        tmp = cursor.fetchone()
            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            # print(result)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)

            final_result = {}

            for record in result["funding"]:

                country_id, subbranch_id, combi_branch_id, fund = record["country_id"], record["subbranch_id"], record[
                    "combi_branch_id"], record["fund"]

                if country_id not in final_result:
                    final_result[country_id] = {}

                if subbranch_id not in final_result[country_id]:
                    final_result[country_id][subbranch_id] = {}

                if combi_branch_id in final_result[country_id][subbranch_id]:
                    final_result[country_id][subbranch_id][combi_branch_id] += fund
                else:
                    final_result[country_id][subbranch_id][combi_branch_id] = fund

            return final_result

    def getNonCombiBranchIds(self) -> List[Dict[str, id]]:

        """ Returns all ids of non combi branches in table branch.

        Returns:
            Dict[str, id]: list of dicts with key 'id' and value combi branch id
        """

        sql = "select id from branch where is_combined = false"
        result = {"branches": []}
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql)
                    tmp = cursor.fetchone()
                    while tmp:
                        result["branches"].append({"id": tmp[0]})
                        tmp = cursor.fetchone()
            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            # print(result)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return result["branches"]

    def getTotalBranchFunding(self) -> Dict[id, Dict[id, float]]:
        """Returns total branch fnding = sum of direct funding and funding from combi branches.

        Returns:
            Dict[id, Dict[id, float]]: dict of country id -> dict of branch id -> total funding
        """

        sql = """select country_id, branch_id, sum(absolute_funding) from

            ((
                select f.country_id, branch_id, absolute_funding
                from funding f join branch b  
                on b.id = f.branch_id  and is_combined = false	
            )
            union
            (
                select b.country_id, cb.subbranch_id as branch_id, absolute_funding * coefficient as absolute_funding 
                from branch b join combi_branch cb on b.id = cb.combi_branch_id
                join funding f on f.country_id = b.country_id and f.branch_id = cb.combi_branch_id
                
            )) as x
            
            group by country_id, branch_id
            order by country_id, branch_id
            """
        result = {"funding": []}
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql)
                    tmp = cursor.fetchone()
                    while tmp:
                        result["funding"].append(
                            {"country_id": tmp[0], "branch_id": tmp[1], "absolute_funding": tmp[2]})
                        tmp = cursor.fetchone()
            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            # print(result)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)

            final_result = {}

            for record in result["funding"]:
                country_id, branch_id, absolute_funding = record["country_id"], record["branch_id"], record[
                    "absolute_funding"]

                if country_id not in final_result:
                    final_result[country_id] = {}

                final_result[country_id][branch_id] = absolute_funding

            return final_result

    def getNonCombiWithSportBranchIds(self) -> Dict[id, List[id]]:
        """ Get non combi branch ids with sport it belongs to.

        Returns:
            Dict[id, List[id]]: dict of sport id -> list of branch ids in this sport
        """
        sql = "select id, sport_id from branch where is_combined = false"
        result = {"branches": []}
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql)
                    tmp = cursor.fetchone()
                    while tmp:
                        result["branches"].append({"id": tmp[0], "sport_id": tmp[1]})
                        tmp = cursor.fetchone()
            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            # print(result)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)

            final_result = {}
            for record in result["branches"]:
                sport_id, id = record["sport_id"], record["id"]
                if sport_id not in final_result:
                    final_result[sport_id] = []
                final_result[sport_id].append(id)
            return final_result

    def getAllSportInfo(self) -> Dict[Any, Tuple[Any, Any]]:
        """ Get records from table sport.

        Returns:
            Dict[Any, Tuple[Any, Any]]: dict of sport id -> (sport code, sport title)
        """
        sql = "select id, code, title from sport"
        result = {"sports": []}
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql)
                    tmp = cursor.fetchone()
                    while tmp:
                        result["sports"].append({"id": tmp[0], "code": tmp[1], "title": tmp[2]})
                        tmp = cursor.fetchone()
            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            if "dbConn" in locals():
                self._releaseConnection(dbConn)

            final_result = {}
            for record in result["sports"]:
                id, code, title = record["id"], record["code"], record["title"]
                final_result[id] = (code, title)
            return final_result

    def checkCodeTitle(self, sport_code: int, branch_code: int, sport_title: str, branch_title: str) -> bool:
        """ Check if branch and sport with sport code and branch code and titles exist and belongs together.

        Args:
            sport_code (int): selected sport code
            branch_code (int): selected branch code
            sport_title (str): selected sport title
            branch_title (str): selected branch title

        Returns:
            bool: true/false whether branch belongs to sport
        """
        sql = "select * from sport s join branch b on s.id = b.sport_id and s.code = %(sport_code)s " \
              "and b.code = %(branch_code)s and s.title = %(sport_title)s and b.title = %(branch_title)s "
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql,
                                   {"sport_code": sport_code, "branch_code": branch_code, "sport_title": sport_title,
                                    "branch_title": branch_title})
                    tmp = cursor.fetchone()
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return tmp is not None
        except psycopg2.DatabaseError as error:
            # print(error)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            self.logger.error(error)
            return False

    def findSportByCode(self, sport_code: int) -> str:
        """Returns title of sport by entered code.

        Args:
            sport_code (int): selected sport code

        Returns:
            str: sport title
        """

        sql = "select title from sport where code = %(sport_code)s"
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql, {"sport_code": sport_code})
                    tmp = cursor.fetchone()
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return tmp[0] if tmp is not None else None
        except psycopg2.DatabaseError as error:
            # print(error)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            self.logger.error(error)
            return ""

    def findBranchByCode(self, sport_code: int, branch_code: int) -> str:
        """Returns branch title of branch defined by entered sport and branch code.

        Args:
            sport_code (int): selected sport code
            branch_code (int): selected branch code

        Returns:
            str: branch title
        """

        sql = "select b.title from branch b join sport s on s.id = b.sport_id " \
              "and s.code = %(sport_code)s and b.code = %(branch_code)s"
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql, {"sport_code": sport_code, "branch_code": branch_code})
                    tmp = cursor.fetchone()
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return tmp[0] if tmp is not None else None
        except psycopg2.DatabaseError as error:
            # print(error)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            self.logger.error(error)
            return ""

    def getSportBranches(self, sport_code: int) -> List[Dict[str, Any]]:
        """Returns all branches which belongs to entered sport.

        Args:
            sport_code (int): selected sport code

        Returns:
            List[Dict[str, Any]]: list of dicts , each dict contains keys code, title.
        """

        sql = "select b.code, b.title from branch b join sport s " \
              "on b.sport_id = s.id and s.code = %(code)s"
        result = {"branches": []}
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql, {"code": sport_code})
                    tmp = cursor.fetchone()
                    while tmp:
                        result["branches"].append({"code": tmp[0], "title": tmp[1]})
                        tmp = cursor.fetchone()
            # self._releaseConnection(dbConn)

        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)

        finally:
            # print(result)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return result["branches"]

    def showCombiBranches(self) -> List[Dict[str, Any]]:
        """Returns data about combi branches from table combi_branch.

        Returns:
            List[Dict[str, Any]]: list of dicts , each dict contains keys countryCode, countryName,
            combiCode, combiTitle, subCode, subTitle, coefficient
        """

        sql = "select c.code, c.name, b.code, b.title, b2.code, b2.title, coefficient " \
              "from combi_branch cb join branch b on combi_branch_id = b.id " \
              "join branch b2 on subbranch_id = b2.id " \
              "join country c on b.country_id = c.id"
        results = []
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql)
                    tmp = cursor.fetchone()
                    while tmp:
                        results.append(
                            {"countryCode": tmp[0], "countryName": tmp[1], "combiCode": tmp[2], "combiTitle": tmp[3],
                             "subCode": tmp[4], "subTitle": tmp[5], "coefficient": tmp[6]})
                        tmp = cursor.fetchone()
            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            # print(result)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return results

    def checkCombi(self, branch_code: int, country_code: str) -> Tuple[int, str]:
        """ Check existance of combi branch. If exists, returns code, title else -1 and empty.

        Args:
            branch_code ([type]): selected branch code
            country_code ([type]): selected country code

        Returns:
             Tuple[int, str]: (branch code, country code)
        """

        sql = "select b.code, b.title from branch b join country c " \
              "on c.id = b.country_id and c.code = %(country_code)s and is_combined and b.code = %(branch_code)s "
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql, {"branch_code": branch_code, "country_code": country_code})
                    tmp = cursor.fetchone()
                    if tmp is None:
                        if "dbConn" in locals():
                            self._releaseConnection(dbConn)
                        return -1, ""
                    else:
                        if "dbConn" in locals():
                            self._releaseConnection(dbConn)
                        return tmp[0], tmp[1]

        except psycopg2.DatabaseError as error:
            # print(error)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            self.logger.error(error)

    def suggestNewSportCode(self) -> int:
        """ Returns suggestion for sport code.

        Returns:
            int: suggestion for sport code
        """

        sql = "select max(code)+1 from sport"
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql)
                    tmp = cursor.fetchone()
                    if "dbConn" in locals():
                        self._releaseConnection(dbConn)
                    return tmp[0] if tmp[0] is not None else 1
        except psycopg2.DatabaseError as error:
            # print(error)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            self.logger.error(error)

    def countryCodeToID(self, country_code: str) -> id:
        """ Convert country code to country id.

        Args:
            country_code (str):  selected country code

        Returns:
            id: id of the country with selected code, if not exist then -1
        """

        sql = "select id from country where code=%(country_code)s"
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql, {"country_code": country_code})
                    tmp = cursor.fetchone()
                    if tmp is None:
                        if "dbConn" in locals():
                            self._releaseConnection(dbConn)
                        return -1
                    else:
                        if "dbConn" in locals():
                            self._releaseConnection(dbConn)
                        return tmp[0]

        except psycopg2.DatabaseError as error:
            # print(error)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            self.logger.error(error)

    def suggestNewBranchCode(self, sport_code: int) -> int:
        """ Returns suggestion for branch code in entered sport.

        Args:
            sport_code (int): selected sport code

        Returns:
            int: suggestion for branch code under selected sport
        """

        sql = "select max(b.code)+1 from branch b " \
              "join sport s on s.id = b.sport_id and s.code = %(sport_code)s"
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql, {"sport_code": sport_code})
                    tmp = cursor.fetchone()
                    if "dbConn" in locals():
                        self._releaseConnection(dbConn)
                    return tmp[0] if tmp[0] is not None else 1
        except psycopg2.DatabaseError as error:
            # print(error)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            self.logger.error(error)

    def branchCodeToId(self, sport_code: int, branch_code: int) -> id:
        """ Convert branch code to id.
            Branch is defined by branch code and sport code it belongs to.


        Args:
            sport_code (int): selected sport code
            branch_code (int): selected branch code

        Returns:
            id: return branch id
        """

        sql = "select b.id from branch b join sport s on s.id = b.sport_id and " \
              " b.code = %(branch_code)s and s.code =  %(sport_code)s "

        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql, {"branch_code": branch_code, "sport_code": sport_code})
                    tmp = cursor.fetchone()
                    if tmp is None:
                        if "dbConn" in locals():
                            self._releaseConnection(dbConn)
                        return -1
                    else:
                        if "dbConn" in locals():
                            self._releaseConnection(dbConn)
                        return tmp[0]
        except psycopg2.DatabaseError as error:
            # print(error)
            #print(dbConn)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            self.logger.error(error)

    def suggestNewCombiBranchCode(self) -> int:
        """ Returns suggestion for combi branch code.

        Returns:
            int: suggestion for new combi branch code
        """
        sql = "select max(b.code)+1 from branch b where is_combined"
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql)
                    tmp = cursor.fetchone()
                    if "dbConn" in locals():
                        self._releaseConnection(dbConn)
                    return tmp[0] if tmp[0] is not None else 10000
        except psycopg2.DatabaseError as error:
            # print(error)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            self.logger.error(error)

    def getSportsWithExisitingBranch(self) -> List[Dict[str, Any]]:
        """ Returns sports from table sport which have at least one branch.
            
        Returns:
            List[Dict[str, Any]]: list of dicts , each dict contains keys title, code.

        """
        sql = "select s.code, s.title from sport s " \
              " where exists(select * from branch where sport_id = s.id) "

        sports = []
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql)
                    tmp = cursor.fetchone()
                    while tmp:
                        sports.append({"title": tmp[1], "code": tmp[0]})
                        tmp = cursor.fetchone()
            # self._releaseConnection(dbConn)
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return sports

    def combiBranchCodeToId(self, branch_code: int) -> id:
        """ Convert combi branch code to id.

        Args:
            branch_code (int): selected branch code

        Returns:
            id: return id of combi branch
        """

        sql = "select b.id from branch b where is_combined and code = %(code)s"

        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql, {"code": branch_code})
                    tmp = cursor.fetchone()
                    if tmp is None:
                        if "dbConn" in locals():
                            self._releaseConnection(dbConn)
                        return -1
                    else:
                        if "dbConn" in locals():
                            self._releaseConnection(dbConn)
                        return tmp[0]
        except psycopg2.DatabaseError as error:
            # print(error)
            #print(dbConn)
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            self.logger.error(error)

    def getInterconnTypes(self) -> Dict[str, list]:
        """ Returns interconnectness types from table interconnectness_type.

        Returns:
            Dict[str, list]: list of dicts , each dict contains keys title, code.
        """

        sql = "select code, title from interconnectness_type"
        results = {"interconnectnesstype": []}
        try:
            with self._getConnection() as dbConn:
                with dbConn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                    cursor.execute(sql)
                    tmp = cursor.fetchone()
                    while tmp:
                        results["interconnectnesstype"].append({"code": tmp[0], "title": tmp[1]})
                        tmp = cursor.fetchone()
        except psycopg2.DatabaseError as error:
            # print(error)
            self.logger.error(error)
        finally:
            if "dbConn" in locals():
                self._releaseConnection(dbConn)
            return results
