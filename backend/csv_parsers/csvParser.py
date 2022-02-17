import csv
from typing import *
from settings import DB

EXPECTED_LEN = 5


class RecordError(Exception):
    ...


class FundingRecord:

    def __init__(self, country_id: id, branch_id: id, amount: float, currency: str):
        self.country_id = country_id
        self.branch_id = branch_id
        self.amount = amount
        self.currency = currency

    def save(self):
        DB.importFundingData(self.country_id, self.branch_id, self.amount, self.currency)

    def __repr__(self) -> str:
        return repr(f"{self.country_id} {self.branch_id} {self.amount} {self.currency}")


class csvParser:

    def __init__(self):
        self.result = []

    def findFailures(self, csvFile: List[str], changes: Dict[str, Dict[str, Any]], country_code: str, currency: str):

        reader = csv.reader(csvFile, delimiter=',', quotechar='"')
        parsed_csv = list(reader)

        records = []
        suggestions = {}
        counter = 0

        for r in parsed_csv:

            row = r

            counter += 1

            if str(counter) in changes:  # changes from user
                row[0] = changes[str(counter) ]["sportCode"]
                row[1] = changes[str(counter) ]["branchCode"]
                row[2] = changes[str(counter) ]["sportTitle"]
                row[3] = changes[str(counter) ]["branchTitle"]

            if len(row) < EXPECTED_LEN:
                # type 2 -> row too short
                suggestions[counter] = {"sportCode": (row[0] if len(row) > 0 else -1),
                                        "oldBranchCode": (row[1] if len(row) > 1 else -1),
                                        "oldSportTitle": (row[2] if len(row) > 2 else ""),
                                        "oldBranchTitle": (row[3] if len(row) > 3 else ""),
                                        "newBranchCode": -1,
                                        "newSportTitle": "",
                                        "newBranchTitle": "",
                                        "type": 2
                                        }
                continue

            if row[0] == "" and row[2] == "":  # combi funding
                sport_code, branch_code, sport_title, branch_title, amount = row[0:EXPECTED_LEN]

                try:
                    branch_code = int(branch_code)
                except ValueError:
                    # branch code is not a number
                    suggestions[counter] = {"sportCode": sport_code,
                                            "oldBranchCode": branch_code,
                                            "oldSportTitle": sport_title,
                                            "oldBranchTitle": branch_title,
                                            "newBranchCode": branch_code,
                                            "newSportTitle": "",
                                            "newBranchTitle": "",
                                            "type": 6
                                            }
                    continue

                try:
                    amount = float(amount.replace(",", "."))
                except ValueError:
                    # amount is not a number
                    suggestions[counter] = {"sportCode": sport_code,
                                            "oldBranchCode": branch_code,
                                            "oldSportTitle": sport_title,
                                            "oldBranchTitle": branch_title,
                                            "newBranchCode": branch_code,
                                            "newSportTitle": "",
                                            "newBranchTitle": "",
                                            "type": 7
                                            }
                    continue

                code, title = DB.checkCombi(branch_code, country_code)
                if code != branch_code:
                    # neplatny branch code alebo country
                    suggestions[counter] = {"sportCode": sport_code,
                                            "oldBranchCode": branch_code,
                                            "oldSportTitle": sport_title,
                                            "oldBranchTitle": branch_title,
                                            "newBranchCode": branch_code,
                                            "newSportTitle": sport_title,
                                            "newBranchTitle": title,
                                            "type": 8
                                            }
                    continue
                if title != branch_title:
                    suggestions[counter] = {"sportCode": sport_code,
                                            "oldBranchCode": branch_code,
                                            "oldSportTitle": sport_title,
                                            "oldBranchTitle": branch_title,
                                            "newBranchCode": branch_code,
                                            "newSportTitle": sport_title,
                                            "newBranchTitle": title,
                                            "type": 1
                                            }
                    continue

                records.append(
                    FundingRecord(DB.countryCodeToID(country_code), DB.combiBranchCodeToId(branch_code), amount,
                                  currency))

            else:  # non combi funding

                sport_code, branch_code, sport_title, branch_title, amount = row[0:EXPECTED_LEN]

                try:
                    sport_code = int(sport_code)
                except ValueError:
                    # sport code is not a number
                    suggestions[counter] = {"sportCode": sport_code,
                                            "oldBranchCode": branch_code,
                                            "oldSportTitle": sport_title,
                                            "oldBranchTitle": branch_title,
                                            "newBranchCode": -1,
                                            "newSportTitle": "",
                                            "newBranchTitle": "",
                                            "type": 5
                                            }
                    continue

                try:
                    branch_code = int(branch_code)
                except ValueError:
                    # branch code is not a number
                    suggestions[counter] = {"sportCode": sport_code,
                                            "oldBranchCode": branch_code,
                                            "oldSportTitle": sport_title,
                                            "oldBranchTitle": branch_title,
                                            "newSportTitle": "",
                                            "newBranchTitle": "",
                                            "newBranchCode": -1,
                                            "type": 6
                                            }
                    continue

                try:
                    amount = float(amount.replace(",", "."))
                except ValueError:
                    # amount is not a number
                    suggestions[counter] = {"sportCode": sport_code,
                                            "oldBranchCode": branch_code,
                                            "oldSportTitle": sport_title,
                                            "oldBranchTitle": branch_title,
                                            "newSportTitle": "",
                                            "newBranchTitle": "",
                                            "type": 7
                                            }
                    continue

                if not self.check(sport_code, branch_code, sport_title, branch_title):
                    # inconsistence in code and title

                    new_sport_title = DB.findSportByCode(sport_code)
                    if new_sport_title is None:
                        suggestions[counter] = {"sportCode": sport_code,
                                                "oldBranchCode": branch_code,
                                                "oldSportTitle": sport_title,
                                                "oldBranchTitle": branch_title,
                                                "newBranchCode": -1,
                                                "newSportTitle": "",
                                                "newBranchTitle": "",
                                                "type": 3
                                                }
                        continue

                    new_branch_title = DB.findBranchByCode(sport_code, branch_code)
                    if new_branch_title is None:
                        # type 4 -> branch with this code does not exist in sport with sport_code
                        # find all branches and choose one with min levenstein distance
                        new_branch_title, new_branch_code = self.find_closest_branch(branch_title, sport_code)
                        suggestions[counter] = {"sportCode": sport_code,
                                                "oldBranchCode": branch_code,
                                                "oldSportTitle": sport_title,
                                                "oldBranchTitle": branch_title,
                                                "newBranchCode": new_branch_code,
                                                "newSportTitle": new_sport_title,
                                                "newBranchTitle": new_branch_title,
                                                "type": 4
                                                }
                        continue

                    # type 1 -> sugestions for new titles
                    suggestions[counter] = {"sportCode": sport_code,
                                            "oldBranchCode": branch_code,
                                            "oldSportTitle": sport_title,
                                            "oldBranchTitle": branch_title,
                                            "newBranchCode": branch_code,
                                            "newSportTitle": new_sport_title,
                                            "newBranchTitle": new_branch_title,
                                            "type": 1
                                            }
                    continue

                else:
                    records.append(
                        FundingRecord(DB.countryCodeToID(country_code), DB.branchCodeToId(sport_code, branch_code),
                                      amount, currency))

        self.result = records
        # print(suggestions, self.result, sep="\n\n\n")
        return suggestions

    def saveResults(self):

        for r in self.result:
            r.save()

    def check(self, sport_code, branch_code, sport_title, branch_title):
        return DB.checkCodeTitle(sport_code, branch_code, sport_title, branch_title)

    def levenstein(self, s, t, costs=(2, 1, 0.5)):
        rows = len(s) + 1
        cols = len(t) + 1
        deletes, inserts, substitutes = costs

        dist = [[0 for _ in range(cols)] for __ in range(rows)]

        # source prefixes can be transformed into empty strings
        # by deletions:
        for row in range(1, rows):
            dist[row][0] = row * deletes

        # target prefixes can be created from an empty source string
        # by inserting the characters
        for col in range(1, cols):
            dist[0][col] = col * inserts

        for col in range(1, cols):
            for row in range(1, rows):
                if s[row - 1].lower() == t[col - 1].lower():
                    cost = 0
                else:
                    cost = substitutes
                dist[row][col] = min(dist[row - 1][col] + deletes,
                                     dist[row][col - 1] + inserts,
                                     dist[row - 1][col - 1] + cost)  # substitution

        return dist[rows - 1][cols - 1]

    def find_closest_branch(self, branch_title, sport_code):
        neighs = DB.getSportBranches(sport_code)

        min_diff = len(branch_title) * 10
        new_title, new_code = "", -1

        for n in neighs:
            act_diff = self.levenstein(branch_title, n["title"])
            if act_diff < min_diff:
                new_title, new_code = n["title"], n["code"]
                min_diff = act_diff

        return new_title, new_code


# example of usage
# parsed = csvParser.parse('data.csv', [])
# print(*parsed, sep="\n")
c = csvParser()
# print(c.result)
# print(c.find_closest_branch("sput", 3))
