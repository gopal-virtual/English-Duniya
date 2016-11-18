#!/usr/bin/env bash
#node curateCouchDb.js
rm www/data/lessons.db
pouchdb-dump http://ed-couch.zaya.in/lessonsdb > www/data/lessons.db
