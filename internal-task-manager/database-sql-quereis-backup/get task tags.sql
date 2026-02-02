SELECT
	tag.* 
FROM
	tag
	INNER JOIN task_tag ON tag."id" = task_tag.tag_id 
WHERE
	task_tag.task_id = 1