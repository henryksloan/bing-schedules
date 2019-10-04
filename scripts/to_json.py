import json
import pickle

with open('../data/objs.pkl', 'rb') as f:
    by_subject, by_code, by_section = pickle.load(f)

with open('../data/data.json', 'w') as outfile:
    json.dump(by_section, outfile)
