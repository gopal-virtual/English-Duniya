#!/usr/bin/env bash
node curateCouchDb.js
rm www/data/lessons.db
pouchdb-dump http://127.0.0.1:5984/lessons > www/data/lessons.db
