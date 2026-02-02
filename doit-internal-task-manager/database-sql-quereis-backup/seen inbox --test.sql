UPDATE "public"."task_assignee" 
SET "checked" = 't' 
FROM
	(
	SELECT
		tbl.task_assignee_id 
	FROM
		(
		SELECT
			"task_assignee"."id" AS task_assignee_id 
		FROM
			task
			INNER JOIN task_assignee ON task."id" = task_assignee.task_id
			LEFT JOIN status ON task.status_id = status."id"
			LEFT JOIN project ON task.project_id = project."id"
			LEFT JOIN priority ON task.priority_id = priority."id" 
		WHERE
			( task_assignee.user_id = 2 ) 
			AND ( task_assignee."checked" = 'f' ) 
		) AS tbl 
	) AS tbl2 
WHERE
	tbl2."task_assignee_id" = "public"."task_assignee"."id"