with open('/home/ubuntu/works-v2-chat/python/영웅톡발화.csv', 'r', encoding = 'cp949', newline = '') as f: 
    doc1 = ""
    lines = f.readlines()
    doc1_list = []
    for line in lines:
        doc1 += line
        doc1_list.append(line.strip())

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import sys

#코사인 유사도
tfidf_vectorizer = TfidfVectorizer()
def tfidf_cosine_arr(list1, sentence):

    print(sentence)

    arr = [0] * (len(list1)+1)
    cnt = 0
    for line in list1:
        fit_tfidf_vectorizer = tfidf_vectorizer.fit_transform([line.split(",")[5],sentence])
        arr[cnt] = cosine_similarity(fit_tfidf_vectorizer[0],fit_tfidf_vectorizer[1])
        cnt += 1
    arr_sorted = sorted(arr, reverse = True)
    max_cosine = list1[arr.index(arr_sorted[0])].split(",")[0] #코사인 유사도 최대값
    second_max_cosine = list1[arr.index(arr_sorted[1])].split(",")[0] #코사인 유사도 두번째로 큰 값 
    
    if max(arr) < 0.01 :
        print(sentence)
        print("유사한 카테고리가 존재하지 않습니다.") 
        return -1

    if max_cosine == second_max_cosine and arr_sorted[0] == arr_sorted[1]: #유사도가 같아서 첫번째 두번째 카테고리가 동일한 것처럼 나올때 == 코사인 유사도가 같을때 다른 카테고리인 경우 2개까지 출력하는 코드
        arr[arr.index(arr_sorted[0])] = 0 #첫번째 나오는 유사도를 리스트에서 삭제 (0으로 대체)
        second_max_cosine = list1[arr.index(arr_sorted[0])].split(",")[0]
        return int(max_cosine), int(second_max_cosine)
    
    else: 
        return int(max_cosine)

sentence = ""
for arg in sys.argv[1:]:
    sentence += str(arg)
    sentence +=" "


if __name__ =="__main__":
    print(tfidf_cosine_arr(doc1_list,sentence))
