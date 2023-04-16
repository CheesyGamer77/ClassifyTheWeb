import requests

# read domains
domains = set()
with open("./all-phishing-domains.txt", "r", encoding="utf-8") as file:
    for line in file.readlines():
        domains.add(line.strip())

# bulk submit classification
response = requests.put("https://472.cheesygamer77.pw/api/sites", json={
    "domains": list(domains),
    "category": 0
})

if response.ok:
    print("Bulk submission successful")
else:
    response.raise_for_status()
