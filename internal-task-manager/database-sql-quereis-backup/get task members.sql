SELECT
	"user"."id",
	"user"."email",
	"user"."username",
	"user"."name" 
FROM
	"user"
	INNER JOIN task_member ON "user"."id" = task_member.user_id 
WHERE
	task_member.task_id = 1