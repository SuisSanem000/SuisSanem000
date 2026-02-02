SELECT tbl.*, EXISTS(SELECT "id" FROM task WHERE parent_id = tbl."id") as has_child FROM (
SELECT
	task."id",
	task.title,
	task.due_date,
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
	INNER JOIN task_member ON task."id" = task_member.task_id
	LEFT JOIN status ON task.status_id = status."id"
	LEFT JOIN project ON task.project_id = project."id"
	LEFT JOIN priority ON task.priority_id = priority."id" 
WHERE
	task_member.user_id = 1 
ORDER BY
	parent_id,
	"position") AS tbl;