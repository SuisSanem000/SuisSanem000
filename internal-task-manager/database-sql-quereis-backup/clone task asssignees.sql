INSERT INTO task_assignee ( task_id, user_id ) SELECT
7,
user_id 
FROM
	task_assignee 
WHERE
	task_id = 1