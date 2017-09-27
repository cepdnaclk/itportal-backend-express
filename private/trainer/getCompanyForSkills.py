import pandas as pd 
import numpy as np 

import sys, json

# reading data
data_frame = pd.read_csv('private/trainer/data.csv',  names=['Name', 'GPA', 'Company', 'Skills'], index_col=1);
data_frame['GPA'] = data_frame['GPA'].astype(float)

def filterNone(x):

	x = str(x)
	if x == None:
		return False
	if x == '':
		return False
	if x == 'nan':
		return False
	return True

def formatAndSplit(x):
	t_string = str(x).strip().split('^^^')

	for i, txt in enumerate(t_string):
		t_string[i] = txt.strip()

	x = filter(filterNone, t_string)
	return x

def read_in():
	lines = sys.stdin.readlines()
	return json.loads(lines[0])

# Fix the skills, strip and split
data_frame['Skills'] = data_frame['Skills'].apply(formatAndSplit);

# groupby company
data_frame_companywise_gpa = pd.DataFrame(data_frame.groupby(['Company'])['GPA'].mean())
data_frame_companywise_gpa['GPA'].astype(float)
data_frame_companywise_gpa['Skills'] = data_frame.groupby(['Company'])['Skills'].aggregate('sum')

the_list = data_frame_companywise_gpa['Skills'].tolist()

skills_set = []

for items in the_list:
	s = set()
	for item in items:
		s.add(item)
	skills_set.append(list(s))
    # s.add((item))

data_frame_companywise_gpa['Skills'] = skills_set


skills = []
skills_count_map = {}

def mapSkills(values):
	global skills, skills_count_map

	for skill_set in values:
		for skill in skill_set:
			# print skill
			if(skill in skills_count_map):
				skills_count_map[skill] += 1
			else:
				skills_count_map[skill] = 1

			skills.append(skill)

mapSkills(data_frame['Skills'].values)

# print 'skills', len(skills)

data_frame_skill_count = pd.DataFrame.from_dict(skills_count_map, orient='index')
data_frame_skill_count = data_frame_skill_count.sort_values(0, ascending=False)
data_frame_skill_count = data_frame_skill_count.rename(columns={0: "Count"})

# data_frame_skill_count.plot(kind='bar')

X = data_frame_companywise_gpa['GPA'].values.reshape(-1,1)
y = data_frame_companywise_gpa.index.astype(str).values


from sklearn.feature_extraction.text import CountVectorizer
count_vect = CountVectorizer(min_df=0.1)

string_iterable = []
for item in skills_set:
	string_iterable.append(' '.join(item))

# print string_iterable
X_train_counts = count_vect.fit_transform(string_iterable)

from sklearn.feature_extraction.text import TfidfTransformer
tf_transformer = TfidfTransformer(use_idf=False).fit(X_train_counts)
X_train_tf = tf_transformer.transform(X_train_counts)

tfidf_transformer = TfidfTransformer()
X_train_tfidf = tfidf_transformer.fit_transform(X_train_counts)
X_train_tfidf.shape

from sklearn.naive_bayes import MultinomialNB
# print y

clf = MultinomialNB().fit(X_train_tfidf, y)

# X_test = [
# 	'Java C MySQL',
# 	'Java C MySQL Arduino Verilog',
# 	'Arduino Java C Github HTML Javascript',
# 	'NodeJS Express JavaScript',
# 	'.NET JavaScript C#',
# 	'SSIS SSRS',
# 	'C Git Java'
# 	'Verilog Arduino TCP/IP Cuda C Python',
# ]

X_test  = read_in()
X_new_counts = count_vect.transform(X_test)
X_new_tfidf = tfidf_transformer.transform(X_new_counts)



predicted = clf.predict(X_new_tfidf)

# Matched companies for Skill sets
output = ''
for doc, category in zip(X_test, predicted):
	output +=  ('%r => %s' % (doc, category)) + '\n'
		
print output