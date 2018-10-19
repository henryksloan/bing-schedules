import urllib.request
from bs4 import BeautifulSoup
import pandas as pd
import re

# The current class term, e.g. Fall 2018
term_in = "201890";

# Returns a url linking to a list of all classes of a given subject in term term_in
def subj_courses_url(sel_subj, sel_crse=""):
    return "https://ssb.cc.binghamton.edu/banner/bwckschd.p_get_crse_unsec?term_in=" + term_in + "&sel_subj=dummy&sel_day=dummy&sel_schd=dummy&sel_insm=dummy&sel_camp=dummy&sel_levl=dummy&sel_sess=dummy&sel_instr=dummy&sel_ptrm=dummy&sel_attr=dummy&sc_sel_attr=dummy&sel_subj=" + sel_subj + "&sel_crse=" + str(sel_crse) + "&sel_title=&sel_schd=%25&sel_insm=%25&sel_from_cred=&sel_to_cred=&sel_levl=%25&sel_ptrm=%25&sel_attr=%25&sc_sel_attr=%25&begin_hh=0&begin_mi=0&begin_ap=a&end_hh=0&end_mi=0&end_ap=a"

def fetch_data(soup):
    data = []
    classes = soup.select("tbody")[2]

    for i in range(0, len(classes.findChildren(recursive=False)) - 1, 2):
        course = classes.findChildren(recursive=False)[i].text
        course = course.replace('\n', ' ').replace('\r', '')
        course_split = course.split(" - ")
        section = course_split[-1].strip()
        course = course_split[0].strip()

        code_split = course_split[-2].strip().split()
        subj_code = code_split[0]
        crse_code = code_split[1]

        try:
            for n in range(len(classes.findChildren(recursive=False)[i+1].findChildren("tr")) - 1):
                info = classes.findChildren(recursive=False)[i+1].findChildren("tr")[n + 1].findChildren(recursive=False)
                time = info[1].text.strip()
                days = info[2].text.strip()
                schedule_type = info[5].text.strip()
                data.append([subj_code, crse_code, course, section, schedule_type, days, time])
        except:
            continue

    return data

# From this URL, we get a list of all subject codes, e.g. CS or MATH
subj_url = "https://ssb.cc.binghamton.edu/banner/bwckgens.p_proc_term_date?p_calling_proc=bwckschd.p_disp_dyn_sched&p_term=" + term_in;
with urllib.request.urlopen(subj_url) as response:
    subj_html = response.read()
subj_parsed = BeautifulSoup(subj_html, "html5lib")

# Read all options for subject codes into a list
codes = [code['value'] for code in subj_parsed.select("[name=sel_subj]")[1].find_all("option")]
codes.remove("%") # Remove dummy at beginning of list
print(codes)

headers = ['subject', 'code', 'course', 'section', 'type', 'days', 'time']
data = []
j = 1
for code in codes:
    course_url = subj_courses_url(code)

    with urllib.request.urlopen(course_url) as response:
        print("[%d/%d] %s returned %d" % (j, len(codes), code, response.getcode()))
        course_html = response.read()

    course_parsed = BeautifulSoup(course_html, "html5lib")
    if course_parsed.findAll(text=re.compile('All results could not be displayed')) != []:
        print('All results could not be displayed')
        for level in range(1, 10):
            print('Searching %s level %d' % (code, level))
            new_url = subj_courses_url(code, level)
            with urllib.request.urlopen(new_url) as response:
                print("[%d/%d] %s returned %d" % (j, len(codes), code, response.getcode()))
                new_html = response.read()
            new_parsed = BeautifulSoup(new_html, "html5lib")
            data += fetch_data(new_parsed)
    else:
        data += fetch_data(course_parsed)
    j = j+1

df = pd.DataFrame(data, columns=headers)
print(df)
df.to_csv("../data/courses.csv", index=False)
