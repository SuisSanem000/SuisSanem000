CREATE 
	OR REPLACE FUNCTION "public"."updated_timestamp" ( ) RETURNS "pg_catalog"."trigger" AS $BODY$ BEGIN
		NEW.updated_at = now( );
	RETURN NEW;
	
END;
$BODY$ LANGUAGE plpgsql VOLATILE COST 100;