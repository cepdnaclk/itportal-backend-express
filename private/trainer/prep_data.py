import matplotlib.pyplot as plt 
import pandas as pd 
import numpy as np 


# using SVC for GPA
from sklearn.svm import SVC

pd.set_option('display.mpl_style', 'default') # Make the graphs a bit prettier

# reading data
data_frame = pd.read_csv('data.csv',  names=['Name', 'GPA', 'Company', 'Skills'], index_col=1);
data_frame['GPA'] = data_frame['GPA'].astype(float)

# data_frame['GPA'].sort_values().plot(kind='bar')
# plt.figure()


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

# Fix the skills, strip and split
data_frame['Skills'] = data_frame['Skills'].apply(formatAndSplit);

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

print skills_set

data_frame_companywise_gpa['Skills'] = skills_set

# print 'Company wise GPA mean'
print data_frame_companywise_gpa

# data_frame_companywise_gpa.plot(kind='bar')


skills = []
skills_count_map = {}

X = data_frame_companywise_gpa['GPA'].values.reshape(-1,1)
y = data_frame_companywise_gpa.index.astype(str).values

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

print '\n\n\n'
with pd.option_context('display.max_rows', None, 'display.max_columns', 3):
	print data_frame_skill_count[:]
print '\n\n\n'

# data_frame_skill_count.plot(kind='bar')

X = data_frame_companywise_gpa['GPA'].values.reshape(-1,1)
y = data_frame_companywise_gpa.index.astype(str).values

clf = SVC()
clf.fit(X, y)

print '\nPredictions according to GPA'
print 'GPA: 1.7', clf.predict(1.7)
print 'GPA: 2.2', clf.predict(2.2)
print 'GPA: 2.9', clf.predict(2.9)
print 'GPA: 3.4', clf.predict(3.4)
print 'GPA: 3.7', clf.predict(3.7)
print 'GPA: 3.9', clf.predict(3.9)
print '\n\n\n'
# clf2 = SVC()
# X = np.asarray(skills_set[:][:2])
# print type(X)
# clf2.fit(X, y)
# 
# print 'Skills: Java', clf.predict(['Java', 'C'])
# print 'Skills: JavaScript', clf.predict(['JavaScript'])
# print 'Skills: CSS', clf.predict(['CSS'])

from sklearn.feature_extraction.text import CountVectorizer
count_vect = CountVectorizer(min_df=0.1)

string_iterable = []
for item in skills_set:
	string_iterable.append(' '.join(item))

# print string_iterable
X_train_counts = count_vect.fit_transform(string_iterable)
print X_train_counts.shape

from sklearn.feature_extraction.text import TfidfTransformer
tf_transformer = TfidfTransformer(use_idf=False).fit(X_train_counts)
X_train_tf = tf_transformer.transform(X_train_counts)
print X_train_tf.shape

tfidf_transformer = TfidfTransformer()
X_train_tfidf = tfidf_transformer.fit_transform(X_train_counts)
X_train_tfidf.shape

from sklearn.naive_bayes import MultinomialNB
# print y

clf = MultinomialNB().fit(X_train_tfidf, y)


X_test = [
	'Java C MySQL',
	'Java C MySQL Arduino Verilog',
	'Arduino Java C Github HTML Javascript',
	'NodeJS Express JavaScript',
	'.NET JavaScript C#',
	'SSIS SSRS',
	'C Git Java'
	'Verilog Arduino TCP/IP Cuda C Python',
]
X_new_counts = count_vect.transform(X_test)
X_new_tfidf = tfidf_transformer.transform(X_new_counts)


# from sklearn.decomposition import PCA
# from sklearn.pipeline import Pipeline

# pipeline = Pipeline([
#     ('vect', CountVectorizer()),
#     ('tfidf', TfidfTransformer()),
# ])        
# X_piped = pipeline.fit_transform(string_iterable).todense()

# pca = PCA(n_components=2).fit(X_piped)
# data2D = pca.transform(X_piped)
# plt.scatter(data2D[:,0], data2D[:,1])

# pd.DataFrame(X_piped).plot(kind='bar')

print X_new_tfidf


predicted = clf.predict(X_new_tfidf)

print '\n\nMatched companies for Skill sets'
for doc, category in zip(X_test, predicted):
	print('%r => %s' % (doc, category))

print '\n\n'

# from sklearn import cluster
# X_test_cluster = skills_set
# print skills_set
# y_test_cluster = y

# k_means = cluster.KMeans(n_clusters=3)
# k_means.fit(X_test_cluster)

# print k_means.labels_[::10]

from sklearn.cluster import KMeans
import numpy as np
X = X_new_tfidf
kmeans = KMeans(n_clusters=3, random_state=0).fit(X)
print kmeans.labels_
print kmeans.predict( [[0.,0.,0.,0.6,0.49311877,0.,0.,0., 0.,0.,0.,0.,0.45592097,0.45592097, 0.,0.,0.,0.34130417,0.47393827,0.,0., 0.,0.,0.,0.,0.,0.,0., 0.,0.,0.,0.,0.,0.,0., 0.,0.,0.,0.,0.,0.]])
# print kmeans.cluster_centers_

# plt.show()


