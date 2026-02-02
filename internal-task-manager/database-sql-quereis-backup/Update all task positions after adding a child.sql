UPDATE "public"."task" 
SET "position" = "position" + 1 
WHERE
	( "parent_id" = 0 ) 
	AND ( "position" >= 1 ) AND ("id"<>3371); 