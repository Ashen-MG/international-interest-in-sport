from typing import List, Dict, Any

from settings import DB


class CompError(Exception):
    ...


class Computations:

    def __init__(self):
        """ Set constants PV, initialize DB mirroring. """

        self.PV1 = 0.5
        self.PV2 = 0.16
        self.PV3 = 0.34
        self.PV4 = 2

        # small db mirroring model will be initialize here
        #  local info from db which are frequently used in computations are stored in lists, maps
        self.BGS_data = DB.getBGS()
        self.order_data = DB.getOrder()
        self.points_data = DB.getPoints()
        self.max_points_data = DB.getMaxPoints()
        self.num_countries_in_sport_data = DB.getNumCountriesInSport()
        self.total_country_points_data = DB.getTotalCountryPoints()
        self.min_order_data = DB.getMinOrder()
        self.econ_interconnectness_data = DB.getEconIntercon()
        self.nonecon_interconnectness_data = DB.getNonEconIntercon()
        self.noncombi_funding_data = DB.getNonCombiBranchFunding()
        self.combi_funding = DB.getCombiFunding()

        self.country_data = DB.getActiveCountryIds()
        self.sport_data = DB.getSportIds()
        self.noncombi_branch_data = DB.getNonCombiBranchIds()

        self.noncombi_branch_with_sport_data = DB.getNonCombiWithSportBranchIds()

        # zrkadlenie na urychlenie vypoctov
        self.total_BGS_data = None
        self.total_country_fund_data = {}
        self.total_success_of_country_data = {}

    def allActiveCountryIds(self) -> List[int]:
        """ Function that parse country data from DB mirroring and returns list of active country ids.

        Returns:
            List[int]:
        """

        res = []

        for record in self.country_data:
            res.append(record["id"])

        return res

    def allBranchIds(self) -> List[int]:
        """ Function that parse non combi branch data from DB mirroring and returns list of non combi branch of ids.

        Returns:
            List[int]: list of branch ids
        """

        res = []

        for item in self.noncombi_branch_data:
            res.append(item["id"])

        return res

    def allBranchInSportIds(self, sportN: id) -> List[int]:
        """ Function that parse non combi branch data which belongs to selected sport
        from DB mirroring and returns list of non combi branch of ids.

        Args:
            sportN (id): selected sport id

        Returns:
            List[int]: list of branch ids
        """
        res = []

        try:
            for item in self.noncombi_branch_with_sport_data[sportN]:
                res.append(item)
        except KeyError:
            ...

        return res

    def allSportIds(self) -> List[int]:
        """ Function that parse sport data from DB mirroring and returns list of sport ids.

        Returns:
            List[int]: list of sport ids
        """
        res = []

        for record in self.sport_data:
            res.append(record["id"])

        return res

    def allSportImportance(self, countryK: id) -> Dict[int, float]:
        """ Calutale importance of each sport in selected country.

        Args:
            countryK (id): sleected country id

        Returns:
            Dict[int, float]: dict which keys are sport ids and values are importance numbers.
        """
        res = {}
        for sport in self.allSportIds():
            res[sport] = self.importance(countryK, sport)

        return res

    def importance(self, countryK: id, sportN: id) -> float:
        """ Calculate importtance for selected sport in selected country.

        Args:
            countryK (id): selected country id
            sportN (id): selected sport id

        Returns:
            float: importance of sport in country
        """
        suma = 0
        for countryJ in self.allActiveCountryIds():
            if countryK != countryJ:
                suma += self.sport_importance_in_country(sportN, countryJ) * self.norm_interconnectness(countryK,
                                                                                                        countryJ)

        return self.PV3 * self.norm_BGS(sportN) + (1 - self.PV3) * suma

    def norm_interconnectness(self, countryK: id, countryJ: id) -> float:
        """ Calculate normed interconnectness between selected countries.

        Args:
            countryK (id): country one id
            countryJ (id): country two id

        Raises:
            CompError: countries cant be the same

        Returns:
            float: normed interconnectness between country one and two
        """
        if countryK == countryJ:
            raise CompError("cannot compute norm interconectness for same countries")

        return self.total_interconnectness(countryK, countryJ) * (1 - self.econ_interconnectness(countryK, countryJ))

    def total_interconnectness(self, countryK: id, countryJ: id) -> float:
        """ Calculate total interconnectness between selected countries.

        Args:
            countryK (id): country one id
            countryJ (id): country two id

        Raises:
            CompError: countries cant be the same

        Returns:
            float: total interconnectness between one and two
        """
        if countryK == countryJ:
            raise CompError("cannot compute total interconectness for same countries")

        return (self.econ_interconnectness(countryK, countryJ) + self.nonecon_interconnectness(countryK, countryJ)) / 2

    def econ_interconnectness(self, countryK: id, countryJ: id) -> float:
        """ Returns economic interconnectness between selected countries from DB mirroring.

        Args:
            countryK (id): country one id
            countryJ (id): country two id

        Raises:
            CompError: countries cant be the same

        Returns:
            float: economic interconnectness between one and two
        """
        if countryK == countryJ:
            raise CompError("cannot compute econ interconectness for same countries")

        try:
            return self.econ_interconnectness_data[countryK][countryJ]
        except KeyError:
            return 0

    def nonecon_interconnectness(self, countryK: id, countryJ: id) -> float:
        """ Returns non-economic interconnectness between selected countries from DB mirroring.

                Args:
                    countryK (id): country one id
                    countryJ (id): country two id

                Raises:
                    CompError: countries cant be the same

                Returns:
                    float: non-economic interconnectness between one and two
                """

        if countryK == countryJ:
            raise CompError("cannot compute nonecon interconectness for same countries")

        try:
            return self.nonecon_interconnectness_data[countryK][countryJ]
        except KeyError:
            return 0

    def sport_importance_in_country(self, sportN: id, countryK: id) -> float:
        """ Calculate importance of selected sport in selected country.

        Args:
            sportN (id): selected sport id
            countryK (id): selected country id

        Returns:
            float: importance of sport
        """
        normFun = self.norm_funding(sportN, countryK)
        normSuc = self.norm_success(sportN, countryK)

        if normFun > 0:
            return (self.PV1 * normFun + self.PV2 * normSuc) / (self.PV1 + self.PV2)
        else:
            return normSuc

    def norm_funding(self, sportN: id, countryK: id) -> float:
        """ Calculate normed funding of selected sport in selected country.

        Args:
            sportN (id): selected sport
            countryK (id): selected country

        Returns:
            float: normed funding
        """
        if self.total_country_funding(countryK) == 0:
            return 0

        suma = 0

        for branchB in self.allBranchInSportIds(sportN):
            suma += self.total_branch_funding(countryK, sportN, branchB) / self.total_country_funding(countryK)

        return suma

    def total_branch_funding(self, countryK, sportN, branchB) -> float:
        """ Calculate total branch funding = direct funding + funding from combi branches.

        Args:
            countryK ([type]): selected country id
            sportN ([type]): selected sport id
            branchB ([type]): selected branch id
        Returns:
            float: [description]
        """
        res = self.branch_funding(countryK, sportN, branchB)

        try:
            data = self.combi_funding[countryK][branchB].items()
        except KeyError:
            data = []

        for combi, fund in data:
            res += fund

        return res

    def branch_funding(self, countryK: id, sportN: id, branchB: id) -> float:
        """ Get non combi branch funding from DB mirror.

        Args:
            countryK ([type]): selected country id
            sportN ([type]): selected sport id
            branchB ([type]): selected branch id

        Returns:
            float: non combi branch funding = direct funding
        """
        try:
            return self.noncombi_funding_data[countryK][sportN][branchB]
        except KeyError:
            return 0

    def total_country_funding(self, countryK: id) -> float:
        """ Sum of all fundings in selected country.

        Args:
            countryK (id):selected country id

        Returns:
            float: total funding of country
        """

        if countryK in self.total_country_fund_data:
            return self.total_country_fund_data[countryK]
        else:
            suma = 0

            for sportN in self.allSportIds():
                for branchB in self.allBranchInSportIds(sportN):
                    tmp = self.total_branch_funding(countryK, sportN, branchB)
                    suma += tmp

            self.total_country_fund_data[countryK] = suma
            return suma

    def norm_success(self, sportN: id, countryK: id) -> float:
        """ Calculate normed success of selected sport in selected country.

        Args:
            sportN (id): selected sport
            countryK (id): selected country

        Returns:
            float: normed success
        """
        if self.total_success(countryK) == 0:
            return 0

        return self.success(sportN, countryK) / self.total_success(countryK)

    def total_success(self, countryK: id) -> float:
        """ Calculate sum of successes in each sport in selected country.

        Args:
            countryK (id): selected country

        Returns:
            float: total success
        """
        if countryK in self.total_success_of_country_data:
            return self.total_success_of_country_data[countryK]
        else:
            suma = 0

            for sportN in self.allSportIds():
                suma += self.success(sportN, countryK)

            self.total_success_of_country_data[countryK] = suma
            return suma

    def success(self, sportN: id, countryK: id) -> float:
        """ Calculate success of selected sport in selected country using order, points, total pointsm
        min order, max points.

        Args:
            sportN (id): selected sport id
            countryK (id): selected country id

        Returns:
            float: [description]
        """
        res = 0

        order = self.order(countryK, sportN)
        if order > 0:
            res += (1 / 4) * ((self.num_countries_in_sport(sportN) + 1 - order) / self.num_countries_in_sport(sportN))

        points = self.points(countryK, sportN)
        if points > 0:
            res += (1 / 4) * (points / self.max_points(sportN))

        totalPoints = self.total_points(countryK)
        if totalPoints > 0:
            res += (1 / 4) * ((self.points(countryK, sportN) ** self.PV4) / (totalPoints ** self.PV4))

        if order > 0:
            res += (1 / 4) * (self.min_order(countryK) / order)
        return res

    def order(self, countryK: id, sportN: id) -> float:
        """ Getter for order data from DB mirroring.

        Args:
            countryK (id):  selected country id
            sportN (id): selected sport id

        Returns:
            float: sport order in country
        """
        try:
            return self.order_data[countryK][sportN]
        except KeyError:
            return 0

    def points(self, countryK: id, sportN: id) -> float:
        """ Getter for points data from DB mirroring.

        Args:
            countryK (id):  selected country id
            sportN (id): selected sport id

        Returns:
            float: sport points in country
        """
        try:
            return self.points_data[countryK][sportN]
        except KeyError:
            return 0

    def max_points(self, sportN: id) -> float:
        """ Getter for max points = best score data from DB mirroring.

        Args:
            sportN (id): selected sport id

        Returns:
            float: best score in sport
        """
        try:
            return self.max_points_data[sportN]
        except KeyError:
            return 0

    def num_countries_in_sport(self, sportN: id) -> float:
        """ Getter for number of countries in selected sport scoring table data from DB mirroring.

        Args:
            sportN (id): selected sport id

        Returns:
            float: number of countries in selected sport
        """
        try:
            return self.num_countries_in_sport_data[sportN]
        except KeyError:
            return 0

    def total_points(self, countryK: id) -> float:
        """ Getter for sum of points of selected country in all sports - from DB mirroring.

        Args:
            countryK (id): selected country id

        Returns:
            float: total points of country
        """
        try:
            return self.total_country_points_data[countryK]
        except KeyError:
            return 0

    def min_order(self, countryK: id) -> float:
        """ Getter for min order = best ranking of selected country - data from DB mirroring.

        Args:
            countryK (id):  selected country id

        Returns:
            float: best ranking of selected country
        """
        try:
            return self.min_order_data[countryK]
        except KeyError:
            return 0

    def norm_BGS(self, sportN: id) -> float:
        """ Calculate normed value of BGS for selected sport.

        Args:
            sportN (id): selected sport

        Returns:
            float: normed BGS
        """

        return self.BGS(sportN) / self.total_BGS()

    def total_BGS(self) -> float:
        """ Calculate sum of BGS of all sports.

        Returns:
            float: sum of BGSs
        """

        if self.total_BGS_data is not None:
            return self.total_BGS_data

        else:
            suma = 0

            for sportN in self.allSportIds():
                suma += self.BGS(sportN)
            self.total_BGS_data = suma
            return suma

    def BGS(self, sportN: id) -> float:
        """ Returns biggest global sport number for selected sport - from DB mirror.

        Args:
            sportN (id): selected sport

        Returns:
            float: BGS of sport
        """
        try:
            return self.BGS_data[sportN]
        except KeyError:
            return 0

    def getFinalOrderById(self, countryK: id) -> Dict[int, Dict[str, Any]]:
        """ Create final sport order for selected country id.

        Args:
            countryK (id): selected country id

        Returns:
            Dict[int, Dict[str, Any]]: dict with keys = ranks and values = dicts with keys order, code, title, value.
        """
        sportInfo = DB.getAllSportInfo()

        result = {}

        p = []
        for i, j in c.allSportImportance(countryK).items():
            p.append((-j, i))
        p.sort()

        order = 1
        for value, id in p:
            code, title = sportInfo[id]
            result[order] = {"order": order, "code": code, "title": title, "value": -value}
            order += 1

        return result

    def getFinalOrderByCountryCode(self, countryCode: str) -> Dict[str, List[Dict[str, Any]]]:
        """ Create final sport order for selected country code.

        Args:
            countryCode (str): selected country code

        Returns:
            Dict[str, List[Dict[str, Any]]]: dict with one key = chart, and value = list of dicts with
             keys order, code, title, value.
        """
        result = []
        id = DB.countryCodeToID(countryCode)
        for key in self.getFinalOrderById(id).values():
            result.append(key)
        return {"chart": result}


# print(c.BGS_data)
# print(c.order(77,10)) # returns 3, correct
# print(c.points(77,10)) # returns 13549.68, correct
# print(c.max_points(56)) # returns 5500.2, correct
# print(c.num_countries_in_sport(194)) # returns 160, correct
# print(c.total_points(27)) # returns 19309.310000000005, correct
# print(c.econ_interconnectness(234, 237)) # returns 57109.0345, correct
# print(c.nonecon_interconnectness(160, 199)) # returns 0.0075, correct
# print(c.min_order(55)) # returns 56, correct
# print(c.allActiveCountryIds())
# print(c.allSportIds())

c = Computations()
# print(t - time.time())
# p = []
# for i, j in c.allSportImportance(104).items():
#    p.append((-j, i))
# p.sort()
# for i,j in p:
#    print(j)

# print(c.norm_BGS(2))
# print(t -time.time())

# print(c.norm_BGS(25)) # correct

# print(c.econ_interconnectness(3, 35))
# print(c.nonecon_interconnectness(3, 35))
# print(c.total_interconnectness(3,35))
# print(c.norm_interconnectness(3,35))
# need to change econ in db to norm econ and nonecon to norm nonecon

# print(c.sport_importance_in_country(7,3)) # should be 0.0222

# print(c.norm_success(3,3))
# print(c.order_data[3])
# print(c.num_countries_in_sport(4))

# print(c.success(4,11))

# print(c.nonecon_interconnectness(3,11))

# print(c.total_branch_fundng(46, 47, 103)) # correct china, archery only from combi funding

# print(c.total_branch_fundng(160, 18, 31)) # correct new zeland, curling, sum of branch and combi funding
# print(c.total_country_%(countryCofunding(160)) # fixed
# print(c.allBranchInSportIds(3))


# print(c.getFinalOrderById(204))

# print(c.norm_funding(18,160))

# print(c.sport_importance_in_country(3,160))

#print(c.getFinalOrderByCountryCode('SVK'))
