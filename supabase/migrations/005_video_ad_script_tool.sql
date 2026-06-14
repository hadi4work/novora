-- Add video_ad_script to usage_tracking tool constraint

ALTER TABLE usage_tracking DROP CONSTRAINT IF EXISTS usage_tracking_tool_check;

ALTER TABLE usage_tracking
  ADD CONSTRAINT usage_tracking_tool_check
  CHECK (tool IN ('social_media', 'product_description', 'resume', 'video_ad_script'));
