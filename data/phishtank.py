import json
import re

with open("./phishtank_urls.txt", "w", encoding="utf-8") as txt:
    with open("./phishtank.json", "r+", encoding="utf-8") as raw:
        data = json.load(raw)

    out = ""
    for phish in data:
        out += f"{phish['url']}\n"
    out = out.strip()
    txt.write(out)

DOMAIN_REGEX = re.compile(r"(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]", re.RegexFlag.IGNORECASE)

with open("./phishtank_domains.txt", "w+", encoding="utf-8") as txtd:
    with open("./phishtank_urls.txt", "r", encoding="utf-8") as txtu:
        lines = txtu.readlines()
        urlCount = len(lines)
        exclusionCount = 0

        domains = set()
        for line in lines:
            line = line.strip()

            match = DOMAIN_REGEX.search(line)
            if match is None:
                print(f"Found a non-matching line: {line}")
                continue

            domain = match.group()

            # remove any "www." subdomains
            if domain.startswith("www."):
                domain = domain[4:]

            # exclude some domains
            exclusions = [
                "drive.google.com",  # google
                "sites.google.com",  # google
                "docs.google.com",  # google
                "accounts.google.com",  # google
                "storage.cloud.google.com"  # google
                "s3.amazonaws.com",  # amazon aws
                "bit.ly",  # url shortener. TODO: We could technically extract these
                "bing.com"  # bing
            ]

            if domain in exclusions:
                exclusionCount += 1
                continue

            print(f"{line} -> {domain}")
            domains.add(domain)

    print(f"Filtered {urlCount} urls down to {len(domains)} unique domains. Excluded: {exclusionCount}. Duplicates: {urlCount - len(domains) - exclusionCount} ")

    # sort alphabetically
    domains = sorted(list(domains))
    txtd.writelines([f"{domain}\n" for domain in domains])

