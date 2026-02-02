-- List remained assignee for a task
SELECT
	* 
FROM
	"user" 
WHERE
	NOT EXISTS ( SELECT * FROM task_assignee
	 WHERE ( task_assignee."task_id" = 1 ) AND ( task_assignee."user_id" = 	"user"."id" ) )