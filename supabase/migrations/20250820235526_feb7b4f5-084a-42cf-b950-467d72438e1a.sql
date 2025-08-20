-- Add SpaceTrek VR challenge templates for educational quiz completion
INSERT INTO challenge_templates (
  title, 
  description, 
  subject, 
  item_slug, 
  requirement, 
  points, 
  bonus
) VALUES 
(
  'Space Explorer',
  'Complete a SpaceTrek VR quiz with ≥80% accuracy',
  'Science',
  'spacetrek',
  '{"event_type":"level_complete","game_name":"SpaceTrek","min_accuracy":80}'::jsonb,
  25,
  '{"min_accuracy":95,"bonus_points":10}'::jsonb
),
(
  'VR Pioneer',
  'Enter VR mode in SpaceTrek',
  'Technology',
  'spacetrek',
  '{"event_type":"level_complete","game_name":"SpaceTrek","extra":{"event_type":"vr_entered"}}'::jsonb,
  15,
  '{}'::jsonb
),
(
  'Cosmic Scholar',
  'Complete 3 SpaceTrek quizzes in one day',
  'Science',
  'spacetrek',
  '{"event_type":"level_complete","game_name":"SpaceTrek","min_count":3}'::jsonb,
  40,
  '{"min_count":5,"bonus_points":15}'::jsonb
);