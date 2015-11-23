import requests
from bs4 import BeautifulSoup

r = requests.get("http://125.219.72.110:9090/fillout")

soup = BeautifulSoup(r.text)