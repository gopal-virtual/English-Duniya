import json

dq_mapping_JSON = {}
dq_question_JSON = {}

# with open('Diagnosis.json') as json_data:
# with open('Diagnosis28sept.json') as json_data:
# with open('diagnosis29sept.json') as json_data:
# with open('Diagnosis30_sept.json') as json_data:
with open('diagnosis30sept_oldcontent.json') as json_data:
	dq_backend = json.load(json_data)

	for question in dq_backend["objects"][0]["objects"]:
		skill_tag = question["node"]["tag"].lower()
		level = int(question["node"]["type"]["level"])
		q_id = question["node"]["id"]
		
		dq_mapping_JSON.setdefault(skill_tag, {})
		dq_mapping_JSON[skill_tag].setdefault(level, {"microstandard": "", "questions": []})

		if q_id not in dq_mapping_JSON[skill_tag][level]["questions"]:
			dq_mapping_JSON[skill_tag][level]["questions"].append(q_id)
			dq_mapping_JSON[skill_tag][level]["microstandard"] = question["node"]["type"]["microstandard"]
		else:
			print "duplicate -> ", "->", skill_tag, level

		dq_question_JSON[q_id] = question

	# print json.dumps(dq_mapping_JSON, indent=4)
	# print json.dumps(dq_question_JSON)

	with open('diagnosticLitmusMapping.json', 'w') as outfile:
		json.dump([dq_mapping_JSON], outfile, indent=4)
	
	with open('diagnosisQJSON.json', 'w') as outfile:
		json.dump([dq_question_JSON], outfile, indent=4)
