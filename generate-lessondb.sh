#!/usr/bin/env bash
#node curateCouchDb.js
rm www/data/lessons.db
pouchdb-dump http://52.187.70.243:5984/lessonsdb > www/data/lessons.db
