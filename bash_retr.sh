#!/bin/bash

#Get email address for most recently added award recipient
email=$(mysql -u cs467-group1 -pE3NTBHHRrK8gxUbA -h classmysql.engr.oregonstate.edu cs467-group1 -se "
SELECT email FROM account_award 
WHERE id=(SELECT max(id) FROM account_award)");

name=$(mysql -u cs467-group1 -pE3NTBHHRrK8gxUbA -h classmysql.engr.oregonstate.edu cs467-group1 -se "
SELECT name, id, time FROM account_award AA
WHERE AA.id=(SELECT max(AA.id) FROM account_award AA)");

signature=$( mysql -u cs467-group1 -pE3NTBHHRrK8gxUbA -h classmysql.engr.oregonstate.edu cs467-group1 -se "
SELECT UA.signature FROM user_account UA
	INNER JOIN account_award AA on AA.account_id = UA.id 
WHERE AA.id=(SELECT max(AA.id) FROM account_award AA);");

signature="public/css/signatures/5/$signature"

IFS=' ' read fname lname award_id award_date award_time <<< $name

$( mysql -u cs467-group1 -pE3NTBHHRrK8gxUbA -h classmysql.engr.oregonstate.edu cs467-group1 -e "
INSERT INTO parsed_create_info (award_id, firstname, lastname, award_date, sigpath) VALUES ('$award_id', '$fname', '$lname', '$award_date', '$signature')");

allInfo=$( mysql -u cs467-group1 -pE3NTBHHRrK8gxUbA -h classmysql.engr.oregonstate.edu cs467-group1 -B -e "
SELECT P.firstname, P.lastname, email, A.title, P.sigpath, P.award_date AS date FROM account_award AA
	INNER JOIN award A on A.id = AA.award_id
	INNER JOIN parsed_create_info P on P.award_id = AA.id
WHERE AA.id=(SELECT max(AA.id) FROM account_award AA);" | sed -e 's/\t/,/g;s/\s\+/\n/g');

echo "$allInfo" > data.csv

signature=$( mysql -u cs467-group1 -pE3NTBHHRrK8gxUbA -h classmysql.engr.oregonstate.edu cs467-group1 -B -e "
SELECT sigpath FROM parsed_create_info
WHERE award_id=(SELECT max(award_id) FROM parsed_create_info)");

#Use data from data.csv to create pdf from certificate.tex
$(pdflatex certificate.tex)

#Send award recipient an email with certificate as PDF
echo "Congratuations, $fname! Your certificate is attached." | mutt -a 'certificate.pdf' -s 'Your Certificate' -e 'my_hdr From:LYNX@noreply.com' -e 'set realname=LYNX' -- $email 
#Clean up non-essential files
$(rm -rf certificate.pdf certificate.aux certificate.log data.csv)
