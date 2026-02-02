INSERT INTO task_tag ( task_id, tag_id ) SELECT
7,
tag_id 
FROM
	task_tag 
WHERE
	task_id = 1