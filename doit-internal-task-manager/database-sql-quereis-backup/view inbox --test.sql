SELECT
	tbl.*,
	EXISTS ( SELECT "id" FROM task WHERE parent_id = tbl."id" ) AS has_child 
FROM
	(
	SELECT
		task."id",
		task.title,
		task.due,
		task."position",
		status."name" AS status,
		project."name" AS project,
		priority."name" AS priority,
		status.background_color AS status_bg_color,
		status.text_color AS status_color,
		priority.background_color AS priority_bg_color,
		priority.text_color AS priority_color
	FROM
		task
		INNER JOIN task_assignee ON task."id" = task_assignee.task_id
		LEFT JOIN status ON task.status_id = status."id"
		LEFT JOIN project ON task.project_id = project."id"
		LEFT JOIN priority ON task.priority_id = priority."id" 
	WHERE
		( task_assignee.user_id = 2 ) 
		AND ( task_assignee."checked" = 'f' ) 
	ORDER BY
		parent_id ASC,
	"position" ASC 
	) AS tbl;