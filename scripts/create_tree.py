import pandas as pd
import pickle

try:
    data = pd.read_csv("../data/courses.csv")
except(FileNotFoundError):
    exit(1)

data = data.fillna('')

# e.g. by_subject['CS']
by_subject = dict((a, data[data['subject'] == a].drop(['subject'], axis=1)) for a in data['subject'].unique())

# e.g. by_code['CS']['120']
by_code = dict((b, dict((a, by_subject[b][by_subject[b]['code'] == a].drop('code', axis=1)) for a in by_subject[b]['code'].unique())) for b in by_subject.keys())

# e.g. by_code['CS']['120']['A 0']
by_section = dict((subj, dict((code, dict((sect, by_code[subj][code][by_code[subj][code]['section'] == sect].drop('section', axis=1).to_dict(orient='list')) for sect in by_code[subj][code]['section'].unique())) for code in by_code[subj].keys())) for subj in by_subject.keys())

with open('../data/objs.pkl', 'wb') as f:
    pickle.dump([by_subject, by_code, by_section], f)

