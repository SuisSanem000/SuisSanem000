-- DELETE an assignee from a task
DELETE 
FROM
	"public"."task_assignee" 
WHERE
	task_id = 1 
	AND user_id = 1