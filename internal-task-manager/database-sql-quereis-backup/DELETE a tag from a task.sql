	
-- DELETE a tag from a task
DELETE 
FROM
	"public"."task_tag" 
WHERE
	task_id = 1 
	AND tag_id =4