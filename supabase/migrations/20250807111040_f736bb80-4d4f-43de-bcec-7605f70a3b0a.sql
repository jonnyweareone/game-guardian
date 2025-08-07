-- Insert demo children (using demo parent ID)
INSERT INTO public.children (id, parent_id, name, age, avatar_url) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Ethan', 12, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Lily', 9, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lily'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Jake', 14, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jake');

-- Insert demo devices
INSERT INTO public.devices (id, parent_id, child_id, device_code, device_name, is_active, paired_at) VALUES
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'GG-ETH-001', 'Ethan''s Gaming PC', true, now() - interval '5 days'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'GG-LIL-002', 'Lily''s Nintendo Switch', true, now() - interval '3 days'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'GG-JAK-003', 'Jake''s Xbox Series X', true, now() - interval '7 days');

-- Insert demo conversations with realistic transcripts
INSERT INTO public.conversations (id, child_id, device_id, session_start, session_end, platform, participants, total_messages, sentiment_score, conversation_type, risk_assessment, transcript) VALUES
-- Positive gaming session
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', now() - interval '2 hours', now() - interval '1 hour', 'discord', ARRAY['Ethan', 'Alex_Gaming', 'MikeTheGamer'], 24, 0.8, 'voice_chat', 'low', 
'[
  {"timestamp": "2024-01-07T14:00:00Z", "speaker": "Ethan", "message": "Hey guys! Ready for some Minecraft?"},
  {"timestamp": "2024-01-07T14:00:15Z", "speaker": "Alex_Gaming", "message": "Yeah! I found this awesome new building technique"},
  {"timestamp": "2024-01-07T14:00:30Z", "speaker": "MikeTheGamer", "message": "Cool! Can you show us?"},
  {"timestamp": "2024-01-07T14:05:00Z", "speaker": "Ethan", "message": "Wow that looks amazing! You''re really good at this"},
  {"timestamp": "2024-01-07T14:10:00Z", "speaker": "Alex_Gaming", "message": "Thanks! I learned it from a YouTube tutorial"},
  {"timestamp": "2024-01-07T14:15:00Z", "speaker": "MikeTheGamer", "message": "We should build a castle together!"},
  {"timestamp": "2024-01-07T14:20:00Z", "speaker": "Ethan", "message": "Great idea! I''ll start on the foundation"}
]'),

-- Concerning interaction with stranger
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440012', now() - interval '6 hours', now() - interval '5 hours 30 minutes', 'nintendo_online', ARRAY['Lily', 'FriendlyGamer2023'], 15, -0.3, 'text_chat', 'medium', 
'[
  {"timestamp": "2024-01-07T08:00:00Z", "speaker": "FriendlyGamer2023", "message": "Hi Lily! Want to play together?"},
  {"timestamp": "2024-01-07T08:01:00Z", "speaker": "Lily", "message": "Sure! How do you know my name?"},
  {"timestamp": "2024-01-07T08:02:00Z", "speaker": "FriendlyGamer2023", "message": "I saw it in the game. You''re really good at this!"},
  {"timestamp": "2024-01-07T08:05:00Z", "speaker": "FriendlyGamer2023", "message": "Do you have other games? Maybe we could video chat"},
  {"timestamp": "2024-01-07T08:06:00Z", "speaker": "Lily", "message": "I have Mario Kart"},
  {"timestamp": "2024-01-07T08:07:00Z", "speaker": "FriendlyGamer2023", "message": "Cool! What school do you go to? I might live nearby"},
  {"timestamp": "2024-01-07T08:08:00Z", "speaker": "Lily", "message": "I go to Riverside Elementary"},
  {"timestamp": "2024-01-07T08:09:00Z", "speaker": "FriendlyGamer2023", "message": "Oh nice! I know that area. Want to meet up sometime?"}
]'),

-- Critical cyberbullying incident
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440013', now() - interval '1 day', now() - interval '23 hours', 'xbox_live', ARRAY['Jake', 'ToxicPlayer99', 'RandomGamer123'], 18, -0.9, 'voice_chat', 'critical', 
'[
  {"timestamp": "2024-01-06T19:00:00Z", "speaker": "ToxicPlayer99", "message": "You''re terrible at this game"},
  {"timestamp": "2024-01-06T19:01:00Z", "speaker": "Jake", "message": "I''m still learning"},
  {"timestamp": "2024-01-06T19:02:00Z", "speaker": "ToxicPlayer99", "message": "You should just quit. Nobody wants you here"},
  {"timestamp": "2024-01-06T19:03:00Z", "speaker": "RandomGamer123", "message": "Yeah, get lost loser"},
  {"timestamp": "2024-01-06T19:04:00Z", "speaker": "Jake", "message": "That''s not nice..."},
  {"timestamp": "2024-01-06T19:05:00Z", "speaker": "ToxicPlayer99", "message": "Cry about it. You''re pathetic"},
  {"timestamp": "2024-01-06T19:06:00Z", "speaker": "Jake", "message": "I''m leaving"},
  {"timestamp": "2024-01-06T19:07:00Z", "speaker": "ToxicPlayer99", "message": "Good riddance"}
]'),

-- Positive educational gaming
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', now() - interval '4 hours', now() - interval '3 hours', 'steam', ARRAY['Ethan', 'TeacherBot', 'ScienceKid'], 32, 0.9, 'text_chat', 'low', 
'[
  {"timestamp": "2024-01-07T10:00:00Z", "speaker": "TeacherBot", "message": "Welcome to CodeCraft! Today we''ll learn about loops"},
  {"timestamp": "2024-01-07T10:01:00Z", "speaker": "Ethan", "message": "Cool! I''ve heard about those"},
  {"timestamp": "2024-01-07T10:02:00Z", "speaker": "ScienceKid", "message": "I use loops in Scratch all the time"},
  {"timestamp": "2024-01-07T10:05:00Z", "speaker": "Ethan", "message": "Oh I see! So the loop makes the character repeat the action"},
  {"timestamp": "2024-01-07T10:10:00Z", "speaker": "TeacherBot", "message": "Exactly! Great understanding Ethan"},
  {"timestamp": "2024-01-07T10:15:00Z", "speaker": "ScienceKid", "message": "This is helping me with my robotics project!"}
]');

-- Insert conversation summaries
INSERT INTO public.conversation_summaries (conversation_id, child_id, summary_type, ai_summary, key_topics, emotional_tone, social_interactions, talking_points, positive_highlights, concerns, confidence_score) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'session', 'Ethan had a positive gaming session with friends Alex and Mike, collaborating on building projects in Minecraft. The conversation was friendly and constructive.', ARRAY['minecraft', 'building', 'collaboration', 'friendship'], 'positive', '{"friends": ["Alex_Gaming", "MikeTheGamer"], "new_contacts": [], "interaction_quality": "positive"}', ARRAY['Ask Ethan about his Minecraft building projects', 'Encourage his collaborative gaming'], ARRAY['Shows good teamwork skills', 'Positive peer interactions', 'Creative problem solving'], ARRAY[], 0.92),

('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'session', 'Lily was approached by an unknown player who asked personal questions including her school name and suggested meeting in person. This raises safety concerns.', ARRAY['personal_information', 'stranger_contact', 'meeting_requests'], 'negative', '{"friends": [], "new_contacts": ["FriendlyGamer2023"], "interaction_quality": "concerning"}', ARRAY['Discuss online safety rules with Lily', 'Review what information should never be shared online', 'Talk about stranger danger in digital spaces'], ARRAY[], ARRAY['Shared school name with stranger', 'Stranger requested personal meeting', 'Child was receptive to stranger contact'], 0.95),

('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'session', 'Jake experienced severe cyberbullying from multiple players who used hurtful language and told him to quit gaming. This appears to have caused emotional distress.', ARRAY['cyberbullying', 'harassment', 'emotional_abuse'], 'negative', '{"friends": [], "new_contacts": [], "interaction_quality": "hostile"}', ARRAY['Check in with Jake about his gaming experiences', 'Discuss reporting mechanisms for bullying', 'Consider blocking/avoiding toxic players'], ARRAY[], ARRAY['Multiple players engaged in bullying behavior', 'Child showed signs of distress', 'Verbal abuse and exclusion tactics used'], 0.98),

('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'session', 'Ethan participated in an educational coding game that taught programming concepts through gameplay. Great learning opportunity with positive peer interaction.', ARRAY['education', 'coding', 'STEM_learning'], 'positive', '{"friends": ["ScienceKid"], "new_contacts": ["TeacherBot"], "interaction_quality": "educational"}', ARRAY['Ask Ethan about what he learned in CodeCraft', 'Encourage his interest in programming'], ARRAY['Shows strong aptitude for learning', 'Engaged well with educational content', 'Peer learning and collaboration'], ARRAY[], 0.90);

-- Insert alerts linked to conversations
INSERT INTO public.alerts (id, child_id, device_id, alert_type, risk_level, ai_summary, transcript_snippet, confidence_score, is_reviewed, flagged_at, conversation_id, emotional_impact, social_context, follow_up_required) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440012', 'inappropriate_sharing', 'high', 'Lily shared her school name with an unknown player who then suggested meeting in person. This interaction shows classic grooming patterns and requires immediate attention.', '"Do you have other games? Maybe we could video chat" - "What school do you go to? I might live nearby" - "Want to meet up sometime?"', 0.95, false, now() - interval '6 hours', '660e8400-e29b-41d4-a716-446655440002', 'medium', 'private_chat', true),

('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440013', 'cyberbullying', 'critical', 'Jake was subjected to severe cyberbullying by multiple players who used degrading language and exclusionary tactics. The interaction caused visible emotional distress.', '"You''re terrible at this game" - "Nobody wants you here" - "You should just quit" - "Cry about it. You''re pathetic"', 0.98, false, now() - interval '1 day', '660e8400-e29b-41d4-a716-446655440003', 'high', 'group_chat', true),

('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', 'positive_interaction', 'low', 'Ethan demonstrated excellent collaborative skills and positive peer interaction during a Minecraft building session. This is the type of healthy gaming we want to encourage.', '"You''re really good at this" - "Great idea! I''ll start on the foundation" - "We should build a castle together!"', 0.92, true, now() - interval '2 hours', '660e8400-e29b-41d4-a716-446655440001', 'low', 'group_chat', false);

-- Insert parent notifications
INSERT INTO public.parent_notifications (parent_id, child_id, notification_type, title, message, priority, is_read, action_required, related_conversation_id, related_alert_id, metadata) VALUES
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'alert', '🚨 URGENT: Potential grooming attempt detected', 'Lily was contacted by an unknown player who asked for personal information and suggested meeting in person. Immediate parental discussion recommended.', 'critical', false, true, '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', '{"urgency": "high", "safety_risk": true}'),

('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'alert', '⚠️ Cyberbullying incident reported', 'Jake experienced harassment from other players. Consider discussing coping strategies and reporting options.', 'high', false, true, '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002', '{"emotional_support_needed": true}'),

('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'insight', '💡 Positive gaming pattern detected', 'Ethan is showing excellent collaboration and social skills in his gaming sessions. Consider encouraging this positive behavior.', 'low', true, false, '660e8400-e29b-41d4-a716-446655440001', null, '{"positive_reinforcement": true}'),

('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'summary', '📊 Weekly Gaming Summary - Ethan', 'Ethan had 12 gaming sessions this week with 85% positive interactions. He''s developing strong problem-solving skills through educational games.', 'normal', true, false, null, null, '{"weekly_stats": {"sessions": 12, "positive_rate": 0.85}}'),

('550e8400-e29b-41d4-a716-446655440000', null, 'insight', '🎯 Suggested Discussion Topics', 'Based on recent gaming activity, consider discussing: online safety rules, how to handle bullying, and celebrating positive gaming achievements.', 'normal', false, false, null, null, '{"topics": ["online_safety", "bullying_response", "positive_reinforcement"]}');