CREATE 
	OR REPLACE FUNCTION "public"."created_timestamp" ( ) RETURNS "pg_catalog"."trigger" AS $BODY$ BEGIN
		NEW.created_at = now( );
	RETURN NEW;
	
END;
$BODY$ LANGUAGE plpgsql VOLATILE COST 100;