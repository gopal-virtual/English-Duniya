#!/bin/bash
node port.js
rm $PWD/www/data/lessons*
pouchdb-dump http://localhost:5984/lessonsGrade1 > $PWD/www/data/lessonsGrade1.db
pouchdb-dump http://localhost:5984/lessonsGrade2 > $PWD/www/data/lessonsGrade2.db
pouchdb-dump http://localhost:5984/lessonsGrade3 > $PWD/www/data/lessonsGrade3.db
