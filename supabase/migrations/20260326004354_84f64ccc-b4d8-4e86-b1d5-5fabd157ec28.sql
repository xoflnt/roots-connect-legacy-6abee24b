
CREATE OR REPLACE FUNCTION public.validate_notification_type()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.type NOT IN ('approval','rejection','broadcast','new_member','info') THEN
    RAISE EXCEPTION 'Invalid notification type: %', NEW.type;
  END IF;
  RETURN NEW;
END;
$$;
