CREATE 
	OR REPLACE PROCEDURE "public"."create_trigger_for_tables" ( ) AS $BODY$ DECLARE
	T TEXT;
BEGIN
	FOR T IN SELECT TABLE_NAME 
	FROM
		information_schema.COLUMNS 
	WHERE
		COLUMN_NAME = 'updated_at'
		LOOP
		EXECUTE format ( 'CREATE OR REPLACE TRIGGER trigger_updated_timestamp
			BEFORE INSERT OR UPDATE ON %I
		FOR EACH ROW EXECUTE PROCEDURE updated_timestamp()', T, T );
	
END loop;
FOR T IN SELECT TABLE_NAME 
FROM
	information_schema.COLUMNS 
WHERE
	COLUMN_NAME = 'created_at'
	LOOP
	EXECUTE format ( 'CREATE OR REPLACE TRIGGER trigger_created_timestamp
		BEFORE INSERT ON %I
	FOR EACH ROW EXECUTE PROCEDURE created_timestamp()', T, T );

END loop;

END $BODY$ LANGUAGE plpgsql;