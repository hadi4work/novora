-- Ad-reward bonus generations for free plan users

CREATE TABLE ad_reward_grants (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
  last_granted_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, date)
);

ALTER TABLE ad_reward_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ad rewards" ON ad_reward_grants
  FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION get_ad_bonus_count(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COALESCE(count, 0) INTO v_count
  FROM ad_reward_grants
  WHERE user_id = p_user_id AND date = p_date;

  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION grant_ad_reward(
  p_user_id UUID,
  p_max_per_day INTEGER DEFAULT 3,
  p_min_seconds INTEGER DEFAULT 15
)
RETURNS JSONB AS $$
DECLARE
  v_date DATE := CURRENT_DATE;
  v_count INTEGER;
  v_last TIMESTAMPTZ;
BEGIN
  SELECT count, last_granted_at INTO v_count, v_last
  FROM ad_reward_grants
  WHERE user_id = p_user_id AND date = v_date;

  IF v_count IS NOT NULL AND v_count >= p_max_per_day THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'daily_ad_limit_reached',
      'grants_used', v_count,
      'grants_remaining', 0
    );
  END IF;

  IF v_last IS NOT NULL AND v_last > now() - (p_min_seconds || ' seconds')::INTERVAL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'too_soon',
      'grants_used', COALESCE(v_count, 0),
      'grants_remaining', GREATEST(0, p_max_per_day - COALESCE(v_count, 0))
    );
  END IF;

  INSERT INTO ad_reward_grants (user_id, date, count, last_granted_at)
  VALUES (p_user_id, v_date, 1, now())
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    count = ad_reward_grants.count + 1,
    last_granted_at = now();

  v_count := COALESCE(v_count, 0) + 1;

  RETURN jsonb_build_object(
    'success', true,
    'grants_used', v_count,
    'grants_remaining', GREATEST(0, p_max_per_day - v_count),
    'bonus_generations', v_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_tool TEXT,
  p_daily_limit INTEGER DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_total INTEGER;
  v_bonus INTEGER;
  v_date DATE := CURRENT_DATE;
BEGIN
  SELECT COALESCE(SUM(count), 0) INTO v_total
  FROM usage_tracking
  WHERE user_id = p_user_id AND date = v_date;

  v_bonus := get_ad_bonus_count(p_user_id, v_date);

  IF p_daily_limit IS NOT NULL AND v_total >= p_daily_limit + v_bonus THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'used', v_total,
      'limit', p_daily_limit,
      'bonus', v_bonus
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
    'limit', p_daily_limit,
    'bonus', v_bonus
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
