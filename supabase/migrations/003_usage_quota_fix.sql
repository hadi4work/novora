-- Fix daily quota: shared pool across all tools + rollback support

CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_tool TEXT,
  p_daily_limit INTEGER DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_total INTEGER;
  v_date DATE := CURRENT_DATE;
BEGIN
  SELECT COALESCE(SUM(count), 0) INTO v_total
  FROM usage_tracking
  WHERE user_id = p_user_id AND date = v_date;

  IF p_daily_limit IS NOT NULL AND v_total >= p_daily_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'used', v_total,
      'limit', p_daily_limit
    );
  END IF;

  INSERT INTO usage_tracking (user_id, tool, date, count)
  VALUES (p_user_id, p_tool, v_date, 1)
  ON CONFLICT (user_id, tool, date)
  DO UPDATE SET count = usage_tracking.count + 1;

  v_total := v_total + 1;

  RETURN jsonb_build_object(
    'allowed', true,
    'used', v_total,
    'limit', p_daily_limit
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_usage(
  p_user_id UUID,
  p_tool TEXT
)
RETURNS VOID AS $$
DECLARE
  v_date DATE := CURRENT_DATE;
BEGIN
  UPDATE usage_tracking
  SET count = GREATEST(0, count - 1)
  WHERE user_id = p_user_id AND tool = p_tool AND date = v_date AND count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
