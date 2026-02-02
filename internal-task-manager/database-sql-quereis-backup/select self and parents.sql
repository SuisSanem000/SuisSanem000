-- Child to the highest parent linearly
WITH RECURSIVE GetALLChild ( "id", title, "parent_id", "position" ) AS (
	SELECT
		"id",
		title,
		"parent_id",
		"position" 
	FROM
		task 
	WHERE
		"id" = 8 UNION ALL
	SELECT
		task."id",
		task.title,
		task."parent_id",
		task."position" 
	FROM
		GetALLChild
		INNER JOIN task ON GetALLChild."id" = task."parent_id" 
	),
	"Result" ( "id", title, "parent_id", "position" ) AS (
	SELECT
		"id",
		title,
		"parent_id",
		"position" 
	FROM
		GetALLChild UNION ALL
	SELECT
		"task"."id",
		"task".title,
		"task"."parent_id",
		"task"."position" 
	FROM
		"task"
		INNER JOIN "Result" ON "Result"."parent_id" = task."id" 
	) SELECT
	* 
FROM
	GetALLChild UNION
SELECT
	* 
FROM
	"Result" 
ORDER BY
	parent_id,
	"position";