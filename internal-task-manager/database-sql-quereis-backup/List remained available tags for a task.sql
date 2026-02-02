-- List remained tags for a task
SELECT
	* 
FROM
	tag 
WHERE
	NOT EXISTS ( SELECT * FROM task_tag 
	WHERE ( task_tag."task_id" = 1 ) AND ( task_tag."tag_id" = tag."id" ) )