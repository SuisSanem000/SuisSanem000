-- List remained members for a task: maybe client base 
SELECT
	* 
FROM
	"user" 
WHERE
	NOT EXISTS ( SELECT * FROM task_member WHERE ( task_member."task_id" = 1 ) AND ( task_member."user_id" = "user"."id" ) )