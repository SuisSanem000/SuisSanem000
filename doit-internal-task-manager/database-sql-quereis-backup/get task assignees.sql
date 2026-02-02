SELECT
	"user"."id",
	"user"."email",
	"user"."username",
	"user"."name" 
FROM
	"user"
	INNER JOIN task_assignee ON "user"."id" = task_assignee.user_id 
WHERE
	task_assignee.task_id = $1