-- DELETE a member from a task
DELETE 
FROM
	"public"."task_member" 
WHERE
	task_id = 1 
	AND user_id = 1