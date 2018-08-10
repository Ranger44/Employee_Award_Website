#!/bin/bash

#Get email address for most recently added award recipient
email=$(mysql -u cs467-group1 -pE3NTBHHRrK8gxUbA -h classmysql.engr.oregonstate.edu cs467-group1 -se "
SELECT E.email FROM bsg_employee E 
	JOIN bsg_award_employee AE on AE.idemployee = E.id
WHERE AE.id=(SELECT max(AE.id) FROM bsg_award_employee AE)");

#Query all fields for most recent recipient; put in CSV format
allInfo=$( mysql -u cs467-group1 -pE3NTBHHRrK8gxUbA -h classmysql.engr.oregonstate.edu cs467-group1 -B -e "
SELECT E.firstname, E.lastname, E.email, A.title FROM bsg_employee E
	INNER JOIN bsg_award_employee AE on AE.idemployee = E.id
	INNER JOIN award A on A.id = AE.idaward
WHERE AE.id=(SELECT max(AE.id) FROM bsg_award_employee AE);" | sed -e 's/\t/,/g;s/\s\+/\n/g')

fname=$(mysql -u cs467-group1 -pE3NTBHHRrK8gxUbA -h classmysql.engr.oregonstate.edu cs467-group1 -se "
SELECT E.firstname FROM bsg_employee E
	INNER JOIN bsg_award_employee AE on AE.idemployee = E.id
WHERE AE.id=(SELECT max(AE.id) FROM bsg_award_employee AE)");

#Query saved in .csv file
echo "$allInfo" > data.csv

#Use data from data.csv to create pdf from certificate.tex
$(pdflatex certificate.tex)

#Send award recipient an email with certificate as PDF
echo "Congratuations, $fname! Your certificate is attached." | mutt -a 'certificate.pdf' -s 'Your Certificate' -e 'my_hdr From:LYNX@noreply.com' -e 'set realname=LYNX' -- $email 

#Clean up non-essential files
$(rm -rf certificate.pdf certificate.aux certificate.log data.csv)
