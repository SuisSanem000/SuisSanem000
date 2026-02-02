UPDATE "public"."task" 
SET "title" = 'b',
"parent_id" = 1,
"status_id" = 1,
"due" = '2023-03-16',
"position" = 1,
"priority_id" = 1,
"creator_id" = 1,
"project_id" = 1 
WHERE
	"id" = 7