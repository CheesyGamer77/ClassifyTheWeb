txt_sources = [
    "./phishtank_domains.txt",
    "./scam-links devspen.txt"
]

domains = set()
for path in txt_sources:
    with open(path, "r", encoding="utf-8") as file:
        for line in file.readlines():
            line = line.strip()
            domains.add(line)

# sort alphabetically
domains = sorted(list(domains))
print(f"Found {len(domains)} total phishing domains")
with open("./all-phishing-domains.txt", "w+", encoding="utf-8") as file:
    file.writelines([f"{domain}\n" for domain in domains])
