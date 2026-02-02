-- -- insert after a focus task (title)
-- INSERT INTO "public"."task" ( title, parent_id, status_id, due, "position", priority_id, creator_id, project_id )  
-- SELECT
-- 'title9',
-- parent_id,
-- status_id,
-- due,
-- "position" + 1 AS "position",
-- priority_id,
-- 1,
-- project_id 
-- FROM
-- 	task 
-- WHERE
-- 	"id" = 1
-- 	RETURNING *

BEGIN TRANSACTION;
INSERT INTO task_tag ( task_id, tag_id ) SELECT
9,
tag_id 
FROM
	task_tag 
WHERE
	task_id = 1;
INSERT INTO task_assignee ( task_id, user_id ) SELECT
9,
user_id 
FROM
	task_assignee 
WHERE
	task_id = 1;
INSERT INTO task_member ( task_id, user_id ) SELECT
9,
user_id 
FROM
	task_member 
WHERE
task_id = 1;
COMMIT;