INSERT INTO task_member ( task_id, user_id ) SELECT
7,
user_id 
FROM
	task_member 
WHERE
	task_id = 1