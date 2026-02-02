SELECT
	* 
FROM
	task
	LEFT JOIN task_tag AS tg1 ON task."id" = tg1.task_id
	LEFT JOIN task_tag AS tg2 ON task."id" = tg2.task_id 
WHERE
	tg1.tag_id = 1 AND tg2.tag_id = 5 
	