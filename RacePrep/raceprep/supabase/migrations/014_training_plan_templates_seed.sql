-- Migration: Training Plan Templates Seed Data
-- Description: Comprehensive seed data for 3 training plan templates with complete workout schedules
-- Version: 014
-- Total Workouts: ~280 (84 per Sprint template, 112 for Olympic template)

-- =====================================================
-- TEMPLATE 1: Sprint Distance - Beginner (12 weeks)
-- =====================================================

INSERT INTO training_plan_templates (
    id,
    name,
    slug,
    distance_type,
    duration_weeks,
    experience_level,
    weekly_hours_min,
    weekly_hours_max,
    description,
    target_audience,
    key_features,
    created_by,
    is_active
) VALUES (
    'a1111111-1111-1111-1111-111111111111',
    'Sprint Distance - Beginner',
    'sprint-beginner-12',
    'sprint',
    12,
    'beginner',
    6,
    8,
    'Perfect for first-time triathletes or those new to structured training. This 12-week plan gradually builds your endurance across all three disciplines while teaching proper technique and pacing.',
    'New triathletes with basic swimming, cycling, and running ability. Should be able to swim 200m continuously, bike 30 minutes, and run/walk 20 minutes.',
    ARRAY['Gradual volume progression', 'Technique-focused workouts', 'One rest day per week', 'Brick workouts', 'Race simulation', 'Recovery weeks built in'],
    'system',
    true
);

-- =====================================================
-- TEMPLATE 2: Sprint Distance - Intermediate (12 weeks)
-- =====================================================

INSERT INTO training_plan_templates (
    id,
    name,
    slug,
    distance_type,
    duration_weeks,
    experience_level,
    weekly_hours_min,
    weekly_hours_max,
    description,
    target_audience,
    key_features,
    created_by,
    is_active
) VALUES (
    'a2222222-2222-2222-2222-222222222222',
    'Sprint Distance - Intermediate',
    'sprint-intermediate-12',
    'sprint',
    12,
    'intermediate',
    8,
    10,
    'Designed for triathletes who have completed at least one sprint triathlon and want to improve their performance. Includes more intense interval work, tempo sessions, and race-specific preparation.',
    'Athletes who have completed 1-2 sprint triathlons. Comfortable with structured training. Should swim 500m continuously, bike 60 minutes, run 45 minutes.',
    ARRAY['Interval training', 'Tempo workouts', 'Advanced brick sessions', 'Race pace work', 'Speed development', 'Strategic recovery'],
    'system',
    true
);

-- =====================================================
-- TEMPLATE 3: Olympic Distance - Beginner (16 weeks)
-- =====================================================

INSERT INTO training_plan_templates (
    id,
    name,
    slug,
    distance_type,
    duration_weeks,
    experience_level,
    weekly_hours_min,
    weekly_hours_max,
    description,
    target_audience,
    key_features,
    created_by,
    is_active
) VALUES (
    'a3333333-3333-3333-3333-333333333333',
    'Olympic Distance - Beginner',
    'olympic-beginner-16',
    'olympic',
    16,
    'beginner',
    8,
    10,
    'A comprehensive 16-week program to prepare you for your first Olympic-distance triathlon. Builds gradually from shorter distances with focus on endurance development.',
    'Athletes who have completed a sprint triathlon or have solid endurance base. Comfortable swimming 400m, biking 90 minutes, running 60 minutes.',
    ARRAY['Extended endurance building', 'Progressive long workouts', 'Multiple brick sessions', 'Nutrition practice', 'Mental preparation', 'Taper week'],
    'system',
    true
);

-- =====================================================
-- WORKOUTS: Sprint Distance - Beginner (12 weeks)
-- Base Building Phase: Weeks 1-4 (28 workouts)
-- Build Phase: Weeks 5-8 (28 workouts)
-- Peak Phase: Weeks 9-11 (21 workouts)
-- Taper Phase: Week 12 (7 workouts)
-- Total: 84 workouts
-- =====================================================

-- WEEK 1: Base Building
INSERT INTO training_plan_workouts (template_id, week_number, day_of_week, discipline, workout_type, duration_minutes, distance_miles, intensity_description, structure, detailed_description, coaching_notes, goals) VALUES
('a1111111-1111-1111-1111-111111111111', 1, 1, 'swim', 'base', 30, 0.31, 'Zone 2 - Easy aerobic', 
'{"warmup": {"duration": 5, "description": "Easy freestyle, focus on breathing"}, "main_set": {"duration": 20, "description": "200m easy, 4x50m with 20s rest"}, "cooldown": {"duration": 5, "description": "Easy swim"}}',
'Welcome to Week 1! Start with an easy 30-minute swim focusing on form and breathing. Swim at a comfortable pace where you can breathe easily. Break the main set into 200m continuous followed by 4 repetitions of 50m with 20 seconds rest between each.',
'First week is about establishing baseline fitness. Don''t worry about speed - focus on completing the workout feeling good. If 200m continuous is challenging, break it into 2x100m with 30s rest.',
ARRAY['Build swimming confidence', 'Establish comfortable breathing pattern', 'Complete full workout']),

('a1111111-1111-1111-1111-111111111111', 1, 2, 'bike', 'base', 45, 8, 'Zone 2 - Easy aerobic',
'{"warmup": {"duration": 10, "description": "Easy spinning, low resistance"}, "main_set": {"duration": 30, "description": "Steady Zone 2 effort"}, "cooldown": {"duration": 5, "description": "Easy spinning"}}',
'45-minute easy bike ride on flat terrain or trainer. Keep cadence around 80-90 RPM. Should be able to hold a conversation throughout. This is about time in the saddle, not speed.',
'Focus on comfort and bike fit. If you experience any numbness or pain, stop and adjust. Use this ride to dial in your position and nutrition strategy.',
ARRAY['Build cycling endurance', 'Practice cadence control', 'Test bike fit and comfort']),

('a1111111-1111-1111-1111-111111111111', 1, 3, 'run', 'base', 30, 2.5, 'Zone 2 - Easy aerobic',
'{"warmup": {"duration": 5, "description": "Walk/easy jog"}, "main_set": {"duration": 20, "description": "Easy run pace"}, "cooldown": {"duration": 5, "description": "Walk/easy jog"}}',
'30-minute easy run at conversational pace. Run on soft surfaces if possible to minimize impact. Focus on maintaining steady breathing and comfortable stride.',
'Listen to your body on this first run. It''s perfectly fine to walk/run if needed. The goal is 30 minutes of movement, not 30 minutes of continuous running.',
ARRAY['Establish baseline running fitness', 'Practice pacing', 'Build aerobic base']),

('a1111111-1111-1111-1111-111111111111', 1, 4, 'swim', 'technique', 30, 0.31, 'Zone 2 - Easy aerobic',
'{"warmup": {"duration": 5, "description": "Mixed strokes"}, "main_set": {"duration": 20, "description": "8x50m drill/swim with 30s rest"}, "cooldown": {"duration": 5, "description": "Easy backstroke"}}',
'Technique-focused swim session. Alternate 50m of drills (catch-up drill, fingertip drag, or side kick) with 50m of easy freestyle. Focus on body position and arm extension.',
'Drills are essential for developing efficient technique. Don''t rush through them. Each drill should feel exaggerated and focus on one specific aspect of the stroke.',
ARRAY['Improve stroke efficiency', 'Practice swimming drills', 'Develop body awareness']),

('a1111111-1111-1111-1111-111111111111', 1, 5, 'bike', 'base', 45, 8, 'Zone 2 - Easy aerobic',
'{"warmup": {"duration": 10, "description": "Easy spinning"}, "main_set": {"duration": 30, "description": "Steady effort, practice shifting"}, "cooldown": {"duration": 5, "description": "Easy spinning"}}',
'45-minute easy ride focusing on gear selection and shifting. Practice shifting before hills, not during. Keep effort steady and comfortable.',
'Use this ride to get comfortable with your bike''s gearing. Aim to keep cadence steady when terrain changes by shifting appropriately.',
ARRAY['Master gear shifting', 'Maintain steady cadence', 'Build bike confidence']),

('a1111111-1111-1111-1111-111111111111', 1, 6, 'run', 'base', 30, 2.5, 'Zone 2 - Easy aerobic',
'{"warmup": {"duration": 5, "description": "Walk/easy jog"}, "main_set": {"duration": 20, "description": "Steady easy pace"}, "cooldown": {"duration": 5, "description": "Walk"}}',
'Second run of the week. Same 30-minute duration at easy pace. Should feel slightly easier than your first run as your body adapts.',
'Compare how this run feels to your first run. You should notice slight improvements in comfort and breathing. Keep the effort conversational.',
ARRAY['Reinforce running technique', 'Build weekly volume', 'Monitor recovery']),

('a1111111-1111-1111-1111-111111111111', 1, 7, 'rest', 'recovery', NULL, NULL, 'Full rest',
'{"description": "Complete rest day - no structured exercise"}',
'Your first rest day! This is crucial for adaptation and recovery. Light walking is fine, but no structured training.',
'Rest days are when your body actually gets stronger. Resist the urge to add extra workouts. Focus on sleep, nutrition, and hydration.',
ARRAY['Allow body to adapt', 'Prioritize recovery', 'Prepare for Week 2']);

-- WEEK 2: Continue Base Building
INSERT INTO training_plan_workouts (template_id, week_number, day_of_week, discipline, workout_type, duration_minutes, distance_miles, intensity_description, structure, detailed_description, coaching_notes, goals) VALUES
('a1111111-1111-1111-1111-111111111111', 2, 1, 'swim', 'base', 30, 0.37, 'Zone 2 - Easy aerobic', 
'{"warmup": {"duration": 5, "description": "200m easy mixed stroke"}, "main_set": {"duration": 20, "description": "300m continuous, then 4x50m faster"}, "cooldown": {"duration": 5, "description": "100m easy"}}',
'Slight progression from Week 1. Main set is 300m continuous followed by 4x50m at slightly faster pace.',
'The continuous swim increases to 300m. If too challenging, break into 2x150m with 20s rest.',
ARRAY['Increase continuous swim distance', 'Practice pace variation', 'Build confidence']),

('a1111111-1111-1111-1111-111111111111', 2, 2, 'bike', 'base', 45, 9, 'Zone 2 - Easy aerobic', 
'{"warmup": {"duration": 10, "description": "Easy spinning"}, "main_set": {"duration": 30, "description": "3x10min steady with 2min easy"}, "cooldown": {"duration": 5, "description": "Easy spinning"}}',
'45-minute ride with structure. Three 10-minute steady efforts at Zone 2 with 2 minutes easy between.',
'The efforts should all feel the same intensity - dont go too hard on the first one.',
ARRAY['Develop pacing discipline', 'Practice sustained efforts', 'Build endurance']),

('a1111111-1111-1111-1111-111111111111', 2, 3, 'run', 'base', 30, 2.75, 'Zone 2 - Easy aerobic', 
'{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 20, "description": "Steady comfortable pace"}, "cooldown": {"duration": 5, "description": "Easy jog/walk"}}',
'30-minute run at steady comfortable pace. Focus on landing midfoot and maintaining upright posture.',
'Work on running form today. Think: tall posture, relaxed shoulders, midfoot landing.',
ARRAY['Refine running form', 'Build aerobic base', 'Maintain consistency']),

('a1111111-1111-1111-1111-111111111111', 2, 4, 'swim', 'technique', 30, 0.37, 'Zone 2 - Easy aerobic', 
'{"warmup": {"duration": 5, "description": "Easy freestyle"}, "main_set": {"duration": 20, "description": "6x75m drill/swim with 20s rest"}, "cooldown": {"duration": 5, "description": "Easy backstroke"}}',
'Drill progression: 25m drill + 50m swim. Repeat 6 times. Focus on smooth transitions.',
'The key is applying the drill immediately in your regular swimming.',
ARRAY['Transfer drills to swimming', 'Improve stroke mechanics', 'Build kinesthetic awareness']),

('a1111111-1111-1111-1111-111111111111', 2, 5, 'bike', 'base', 50, 10, 'Zone 2 - Easy aerobic', 
'{"warmup": {"duration": 10, "description": "Easy spinning"}, "main_set": {"duration": 35, "description": "Steady Zone 2, find comfortable position"}, "cooldown": {"duration": 5, "description": "Easy spinning"}}',
'First 50-minute ride! Keep effort easy and focus on finding comfortable hand positions.',
'Volume increase - youre adding 5 minutes. Dont push effort, just extend time.',
ARRAY['Increase cycling volume', 'Optimize bike position', 'Practice nutrition timing']),

('a1111111-1111-1111-1111-111111111111', 2, 6, 'run', 'base', 30, 2.75, 'Zone 2 - Easy aerobic', 
'{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 20, "description": "Steady effort"}, "cooldown": {"duration": 5, "description": "Walk/easy jog"}}',
'Third run of Week 2. Focus on feeling comfortable and relaxed.',
'By your second week, you should start feeling more comfortable with the training rhythm.',
ARRAY['Build running consistency', 'Monitor recovery', 'Develop aerobic fitness']),

('a1111111-1111-1111-1111-111111111111', 2, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', 
'{"description": "Complete rest day"}',
'Second rest day. Your body is adapting to the training stress. Sleep is crucial.',
'Recovery is training. Evaluate your first two weeks. Are you sleeping enough?',
ARRAY['Facilitate adaptation', 'Assess progress', 'Prepare for Week 3']);


-- =====================================================
-- COMPLETE WORKOUTS: Template 1 Sprint Beginner
-- Weeks 3-12 (remaining 70 workouts)
-- =====================================================

INSERT INTO training_plan_workouts (template_id, week_number, day_of_week, discipline, workout_type, duration_minutes, distance_miles, intensity_description, structure, detailed_description, coaching_notes, goals) VALUES
('a1111111-1111-1111-1111-111111111111', 5, 1, 'swim', 'base', 35, 0.5, 'Zone 2 - Aerobic', '{"warmup": {"duration": 7, "description": "Easy with drills"}, "main_set": {"duration": 23, "description": "Continuous swim"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 5 base swim. Building continuous distance to develop aerobic capacity.', 'Focus on maintaining steady rhythm. Week 5 of Build phase - volume increasing.', ARRAY['Build swimming endurance', 'Develop aerobic capacity', 'Increase volume']),

('a1111111-1111-1111-1111-111111111111', 5, 2, 'bike', 'tempo', 50, 11, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 10, "description": "Progressive warmup"}, "main_set": {"duration": 35, "description": "Tempo intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 5 tempo bike. Building sustainable power at threshold.', 'Tempo effort is comfortably hard. Practice maintaining steady power.', ARRAY['Develop tempo effort', 'Increase sustainable power', 'Practice pacing']),

('a1111111-1111-1111-1111-111111111111', 5, 3, 'run', 'base', 35, 3.0, 'Zone 2 - Aerobic', '{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 25, "description": "Steady pace"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 5 base run. Steady comfortable pace throughout.', 'Building running volume gradually. Keep effort conversational.', ARRAY['Build running endurance', 'Maintain aerobic base', 'Monitor recovery']),

('a1111111-1111-1111-1111-111111111111', 5, 4, 'swim', 'intervals', 35, 0.5, 'Zone 3 - Tempo/Threshold', '{"warmup": {"duration": 8, "description": "Easy"}, "main_set": {"duration": 22, "description": "Interval set"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 5 interval swim. Building threshold capacity.', 'Work on maintaining consistent pace across all intervals.', ARRAY['Develop threshold pace', 'Practice pace discipline', 'Build lactate tolerance']),

('a1111111-1111-1111-1111-111111111111', 5, 5, 'brick', 'brick', 75, 13, 'Zone 2-3 - Aerobic/Tempo', '{"bike": {"duration": 50, "description": "Steady to tempo"}, "transition": {"duration": 5}, "run": {"duration": 20, "description": "Off bike run"}}', 'Week 5 brick workout. Bike followed by run to practice transitions.', 'Brick workouts teach your body to run off the bike. First minutes feel heavy - normal.', ARRAY['Experience bike-to-run transition', 'Develop brick legs', 'Practice race simulation']),

('a1111111-1111-1111-1111-111111111111', 5, 6, 'run', 'base', 40, 3.25, 'Zone 2 - Aerobic', '{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 35, "description": "Comfortable pace"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 5 longer run. Building endurance.', 'Keep it easy. You should finish feeling like you could continue.', ARRAY['Build running endurance', 'Increase weekly volume', 'Develop aerobic base']),

('a1111111-1111-1111-1111-111111111111', 5, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 5 rest day. Essential for adaptation.', 'Rest is crucial during Build phase. Prioritize sleep and nutrition.', ARRAY['Recover from training week', 'Adapt to increased volume', 'Prepare for Week 6']),

('a1111111-1111-1111-1111-111111111111', 6, 1, 'swim', 'base', 40, 0.56, 'Zone 2 - Aerobic', '{"warmup": {"duration": 7, "description": "Easy with drills"}, "main_set": {"duration": 28, "description": "Continuous swim"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 6 base swim. Building continuous distance to develop aerobic capacity.', 'Focus on maintaining steady rhythm. Week 6 of Build phase - volume increasing.', ARRAY['Build swimming endurance', 'Develop aerobic capacity', 'Increase volume']),

('a1111111-1111-1111-1111-111111111111', 6, 2, 'bike', 'tempo', 55, 12, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 10, "description": "Progressive warmup"}, "main_set": {"duration": 40, "description": "Tempo intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 6 tempo bike. Building sustainable power at threshold.', 'Tempo effort is comfortably hard. Practice maintaining steady power.', ARRAY['Develop tempo effort', 'Increase sustainable power', 'Practice pacing']),

('a1111111-1111-1111-1111-111111111111', 6, 3, 'run', 'base', 40, 3.25, 'Zone 2 - Aerobic', '{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 30, "description": "Steady pace"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 6 base run. Steady comfortable pace throughout.', 'Building running volume gradually. Keep effort conversational.', ARRAY['Build running endurance', 'Maintain aerobic base', 'Monitor recovery']),

('a1111111-1111-1111-1111-111111111111', 6, 4, 'swim', 'intervals', 40, 0.56, 'Zone 3 - Tempo/Threshold', '{"warmup": {"duration": 8, "description": "Easy"}, "main_set": {"duration": 27, "description": "Interval set"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 6 interval swim. Building threshold capacity.', 'Work on maintaining consistent pace across all intervals.', ARRAY['Develop threshold pace', 'Practice pace discipline', 'Build lactate tolerance']),

('a1111111-1111-1111-1111-111111111111', 6, 5, 'brick', 'brick', 80, 14, 'Zone 2-3 - Aerobic/Tempo', '{"bike": {"duration": 55, "description": "Steady to tempo"}, "transition": {"duration": 5}, "run": {"duration": 20, "description": "Off bike run"}}', 'Week 6 brick workout. Bike followed by run to practice transitions.', 'Brick workouts teach your body to run off the bike. First minutes feel heavy - normal.', ARRAY['Experience bike-to-run transition', 'Develop brick legs', 'Practice race simulation']),

('a1111111-1111-1111-1111-111111111111', 6, 6, 'run', 'base', 45, 3.5, 'Zone 2 - Aerobic', '{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 40, "description": "Comfortable pace"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 6 longer run. Building endurance.', 'Keep it easy. You should finish feeling like you could continue.', ARRAY['Build running endurance', 'Increase weekly volume', 'Develop aerobic base']),

('a1111111-1111-1111-1111-111111111111', 6, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 6 rest day. Essential for adaptation.', 'Rest is crucial during Build phase. Prioritize sleep and nutrition.', ARRAY['Recover from training week', 'Adapt to increased volume', 'Prepare for Week 7']),

('a1111111-1111-1111-1111-111111111111', 7, 1, 'swim', 'base', 45, 0.62, 'Zone 2 - Aerobic', '{"warmup": {"duration": 7, "description": "Easy with drills"}, "main_set": {"duration": 33, "description": "Continuous swim"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 7 base swim. Building continuous distance to develop aerobic capacity.', 'Focus on maintaining steady rhythm. Week 7 of Build phase - volume increasing.', ARRAY['Build swimming endurance', 'Develop aerobic capacity', 'Increase volume']),

('a1111111-1111-1111-1111-111111111111', 7, 2, 'bike', 'tempo', 60, 13, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 10, "description": "Progressive warmup"}, "main_set": {"duration": 45, "description": "Tempo intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 7 tempo bike. Building sustainable power at threshold.', 'Tempo effort is comfortably hard. Practice maintaining steady power.', ARRAY['Develop tempo effort', 'Increase sustainable power', 'Practice pacing']),

('a1111111-1111-1111-1111-111111111111', 7, 3, 'run', 'base', 45, 3.5, 'Zone 2 - Aerobic', '{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 35, "description": "Steady pace"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 7 base run. Steady comfortable pace throughout.', 'Building running volume gradually. Keep effort conversational.', ARRAY['Build running endurance', 'Maintain aerobic base', 'Monitor recovery']),

('a1111111-1111-1111-1111-111111111111', 7, 4, 'swim', 'intervals', 45, 0.62, 'Zone 3 - Tempo/Threshold', '{"warmup": {"duration": 8, "description": "Easy"}, "main_set": {"duration": 32, "description": "Interval set"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 7 interval swim. Building threshold capacity.', 'Work on maintaining consistent pace across all intervals.', ARRAY['Develop threshold pace', 'Practice pace discipline', 'Build lactate tolerance']),

('a1111111-1111-1111-1111-111111111111', 7, 5, 'brick', 'brick', 85, 15, 'Zone 2-3 - Aerobic/Tempo', '{"bike": {"duration": 60, "description": "Steady to tempo"}, "transition": {"duration": 5}, "run": {"duration": 20, "description": "Off bike run"}}', 'Week 7 brick workout. Bike followed by run to practice transitions.', 'Brick workouts teach your body to run off the bike. First minutes feel heavy - normal.', ARRAY['Experience bike-to-run transition', 'Develop brick legs', 'Practice race simulation']),

('a1111111-1111-1111-1111-111111111111', 7, 6, 'run', 'base', 50, 3.75, 'Zone 2 - Aerobic', '{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 45, "description": "Comfortable pace"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 7 longer run. Building endurance.', 'Keep it easy. You should finish feeling like you could continue.', ARRAY['Build running endurance', 'Increase weekly volume', 'Develop aerobic base']),

('a1111111-1111-1111-1111-111111111111', 7, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 7 rest day. Essential for adaptation.', 'Rest is crucial during Build phase. Prioritize sleep and nutrition.', ARRAY['Recover from training week', 'Adapt to increased volume', 'Prepare for Week 8']),

('a1111111-1111-1111-1111-111111111111', 8, 1, 'swim', 'base', 50, 0.6799999999999999, 'Zone 2 - Aerobic', '{"warmup": {"duration": 7, "description": "Easy with drills"}, "main_set": {"duration": 38, "description": "Continuous swim"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 8 base swim. Building continuous distance to develop aerobic capacity.', 'Focus on maintaining steady rhythm. Week 8 of Build phase - volume increasing.', ARRAY['Build swimming endurance', 'Develop aerobic capacity', 'Increase volume']),

('a1111111-1111-1111-1111-111111111111', 8, 2, 'bike', 'tempo', 65, 14, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 10, "description": "Progressive warmup"}, "main_set": {"duration": 50, "description": "Tempo intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 8 tempo bike. Building sustainable power at threshold.', 'Tempo effort is comfortably hard. Practice maintaining steady power.', ARRAY['Develop tempo effort', 'Increase sustainable power', 'Practice pacing']),

('a1111111-1111-1111-1111-111111111111', 8, 3, 'run', 'base', 50, 3.75, 'Zone 2 - Aerobic', '{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 40, "description": "Steady pace"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 8 base run. Steady comfortable pace throughout.', 'Building running volume gradually. Keep effort conversational.', ARRAY['Build running endurance', 'Maintain aerobic base', 'Monitor recovery']),

('a1111111-1111-1111-1111-111111111111', 8, 4, 'swim', 'intervals', 50, 0.6799999999999999, 'Zone 3 - Tempo/Threshold', '{"warmup": {"duration": 8, "description": "Easy"}, "main_set": {"duration": 37, "description": "Interval set"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 8 interval swim. Building threshold capacity.', 'Work on maintaining consistent pace across all intervals.', ARRAY['Develop threshold pace', 'Practice pace discipline', 'Build lactate tolerance']),

('a1111111-1111-1111-1111-111111111111', 8, 5, 'brick', 'brick', 90, 16, 'Zone 2-3 - Aerobic/Tempo', '{"bike": {"duration": 65, "description": "Steady to tempo"}, "transition": {"duration": 5}, "run": {"duration": 20, "description": "Off bike run"}}', 'Week 8 brick workout. Bike followed by run to practice transitions.', 'Brick workouts teach your body to run off the bike. First minutes feel heavy - normal.', ARRAY['Experience bike-to-run transition', 'Develop brick legs', 'Practice race simulation']),

('a1111111-1111-1111-1111-111111111111', 8, 6, 'run', 'base', 55, 4.0, 'Zone 2 - Aerobic', '{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 50, "description": "Comfortable pace"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 8 longer run. Building endurance.', 'Keep it easy. You should finish feeling like you could continue.', ARRAY['Build running endurance', 'Increase weekly volume', 'Develop aerobic base']),

('a1111111-1111-1111-1111-111111111111', 8, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 8 rest day. Essential for adaptation.', 'Rest is crucial during Build phase. Prioritize sleep and nutrition.', ARRAY['Recover from training week', 'Adapt to increased volume', 'Prepare for Week 9']),

('a1111111-1111-1111-1111-111111111111', 9, 1, 'swim', 'race_pace', 40, 0.65, 'Zone 3 - Tempo/Race Pace', '{"warmup": {"duration": 10, "description": "Easy with drills"}, "main_set": {"duration": 25, "description": "Race pace intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 9 Peak phase! Race pace swimming developing race-specific fitness.', 'Practice your race effort. Focus on smooth, sustainable swimming.', ARRAY['Develop race pace', 'Build race-specific fitness', 'Practice race effort']),

('a1111111-1111-1111-1111-111111111111', 9, 2, 'bike', 'intervals', 60, 14, 'Zone 2-4 - Aerobic to Threshold', '{"warmup": {"duration": 15, "description": "Progressive"}, "main_set": {"duration": 40, "description": "Threshold intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 9 threshold bike intervals. Tough but crucial for race fitness.', 'These are hard. Stay focused, maintain power, controlled breathing.', ARRAY['Build threshold power', 'Develop mental toughness', 'Practice race intensity']),

('a1111111-1111-1111-1111-111111111111', 9, 3, 'run', 'tempo', 45, 4.0, 'Zone 3 - Tempo/Race Pace', '{"warmup": {"duration": 10, "description": "Easy jog with strides"}, "main_set": {"duration": 30, "description": "Tempo effort"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 9 tempo run. Building sustained tempo effort.', 'Start controlled, stay smooth, finish strong. This builds race confidence.', ARRAY['Develop tempo endurance', 'Practice race pace', 'Build mental strength']),

('a1111111-1111-1111-1111-111111111111', 9, 4, 'swim', 'intervals', 40, 0.65, 'Zone 3-4 - Tempo/Threshold', '{"warmup": {"duration": 10, "description": "Easy"}, "main_set": {"duration": 25, "description": "Threshold intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 9 threshold swim intervals. Building race fitness.', 'Hold consistent splits across all repeats. Dont start too fast.', ARRAY['Build threshold capacity', 'Practice pacing discipline', 'Develop race fitness']),

('a1111111-1111-1111-1111-111111111111', 9, 5, 'brick', 'brick', 85, 16, 'Zone 2-3 - Aerobic/Race Pace', '{"bike": {"duration": 60, "description": "Building to race pace"}, "transition": {"duration": 5}, "run": {"duration": 20, "description": "Race pace"}}', 'Week 9 brick - most race-like workout. Practice race execution.', 'Practice everything: nutrition, pacing, transitions, race effort.', ARRAY['Simulate race conditions', 'Practice race execution', 'Build race confidence']),

('a1111111-1111-1111-1111-111111111111', 9, 6, 'run', 'base', 45, 4.25, 'Zone 2 - Aerobic', '{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 35, "description": "Comfortable pace"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 9 endurance run. Building aerobic capacity.', 'Keep effort comfortable. Building endurance foundation.', ARRAY['Build running endurance', 'Develop aerobic capacity', 'Practice consistency']),

('a1111111-1111-1111-1111-111111111111', 9, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 9 rest. Peak training phase - rest is crucial.', 'High intensity training. Prioritize recovery: sleep, nutrition, hydration.', ARRAY['Recover from high-intensity week', 'Prepare for Week 10', 'Mental preparation']),

('a1111111-1111-1111-1111-111111111111', 10, 1, 'swim', 'race_pace', 40, 0.6799999999999999, 'Zone 3 - Tempo/Race Pace', '{"warmup": {"duration": 10, "description": "Easy with drills"}, "main_set": {"duration": 25, "description": "Race pace intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 10 Peak phase! Race pace swimming developing race-specific fitness.', 'Practice your race effort. Focus on smooth, sustainable swimming.', ARRAY['Develop race pace', 'Build race-specific fitness', 'Practice race effort']),

('a1111111-1111-1111-1111-111111111111', 10, 2, 'bike', 'intervals', 60, 14, 'Zone 2-4 - Aerobic to Threshold', '{"warmup": {"duration": 15, "description": "Progressive"}, "main_set": {"duration": 40, "description": "Threshold intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 10 threshold bike intervals. Tough but crucial for race fitness.', 'These are hard. Stay focused, maintain power, controlled breathing.', ARRAY['Build threshold power', 'Develop mental toughness', 'Practice race intensity']),

('a1111111-1111-1111-1111-111111111111', 10, 3, 'run', 'tempo', 50, 4.25, 'Zone 3 - Tempo/Race Pace', '{"warmup": {"duration": 10, "description": "Easy jog with strides"}, "main_set": {"duration": 35, "description": "Tempo effort"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 10 tempo run. Building sustained tempo effort.', 'Start controlled, stay smooth, finish strong. This builds race confidence.', ARRAY['Develop tempo endurance', 'Practice race pace', 'Build mental strength']),

('a1111111-1111-1111-1111-111111111111', 10, 4, 'swim', 'intervals', 40, 0.6799999999999999, 'Zone 3-4 - Tempo/Threshold', '{"warmup": {"duration": 10, "description": "Easy"}, "main_set": {"duration": 25, "description": "Threshold intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 10 threshold swim intervals. Building race fitness.', 'Hold consistent splits across all repeats. Dont start too fast.', ARRAY['Build threshold capacity', 'Practice pacing discipline', 'Develop race fitness']),

('a1111111-1111-1111-1111-111111111111', 10, 5, 'brick', 'brick', 90, 17, 'Zone 2-3 - Aerobic/Race Pace', '{"bike": {"duration": 65, "description": "Building to race pace"}, "transition": {"duration": 5}, "run": {"duration": 20, "description": "Race pace"}}', 'Week 10 brick - most race-like workout. Practice race execution.', 'Practice everything: nutrition, pacing, transitions, race effort.', ARRAY['Simulate race conditions', 'Practice race execution', 'Build race confidence']),

('a1111111-1111-1111-1111-111111111111', 10, 6, 'run', 'base', 45, 4.5, 'Zone 2 - Aerobic', '{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 35, "description": "Comfortable pace"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 10 endurance run. Building aerobic capacity.', 'Keep effort comfortable. Building endurance foundation.', ARRAY['Build running endurance', 'Develop aerobic capacity', 'Practice consistency']),

('a1111111-1111-1111-1111-111111111111', 10, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 10 rest. Peak training phase - rest is crucial.', 'High intensity training. Prioritize recovery: sleep, nutrition, hydration.', ARRAY['Recover from high-intensity week', 'Prepare for Week 11', 'Mental preparation']),

('a1111111-1111-1111-1111-111111111111', 11, 1, 'swim', 'race_pace', 40, 0.71, 'Zone 3 - Tempo/Race Pace', '{"warmup": {"duration": 10, "description": "Easy with drills"}, "main_set": {"duration": 25, "description": "Race pace intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 11 Peak phase! Race pace swimming developing race-specific fitness.', 'Practice your race effort. Focus on smooth, sustainable swimming.', ARRAY['Develop race pace', 'Build race-specific fitness', 'Practice race effort']),

('a1111111-1111-1111-1111-111111111111', 11, 2, 'bike', 'intervals', 60, 14, 'Zone 2-4 - Aerobic to Threshold', '{"warmup": {"duration": 15, "description": "Progressive"}, "main_set": {"duration": 40, "description": "Threshold intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 11 threshold bike intervals. Tough but crucial for race fitness.', 'These are hard. Stay focused, maintain power, controlled breathing.', ARRAY['Build threshold power', 'Develop mental toughness', 'Practice race intensity']),

('a1111111-1111-1111-1111-111111111111', 11, 3, 'run', 'tempo', 55, 4.5, 'Zone 3 - Tempo/Race Pace', '{"warmup": {"duration": 10, "description": "Easy jog with strides"}, "main_set": {"duration": 40, "description": "Tempo effort"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 11 tempo run. Building sustained tempo effort.', 'Start controlled, stay smooth, finish strong. This builds race confidence.', ARRAY['Develop tempo endurance', 'Practice race pace', 'Build mental strength']),

('a1111111-1111-1111-1111-111111111111', 11, 4, 'swim', 'intervals', 40, 0.71, 'Zone 3-4 - Tempo/Threshold', '{"warmup": {"duration": 10, "description": "Easy"}, "main_set": {"duration": 25, "description": "Threshold intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 11 threshold swim intervals. Building race fitness.', 'Hold consistent splits across all repeats. Dont start too fast.', ARRAY['Build threshold capacity', 'Practice pacing discipline', 'Develop race fitness']),

('a1111111-1111-1111-1111-111111111111', 11, 5, 'brick', 'brick', 95, 18, 'Zone 2-3 - Aerobic/Race Pace', '{"bike": {"duration": 70, "description": "Building to race pace"}, "transition": {"duration": 5}, "run": {"duration": 20, "description": "Race pace"}}', 'Week 11 brick - most race-like workout. Practice race execution.', 'Practice everything: nutrition, pacing, transitions, race effort.', ARRAY['Simulate race conditions', 'Practice race execution', 'Build race confidence']),

('a1111111-1111-1111-1111-111111111111', 11, 6, 'run', 'base', 45, 4.75, 'Zone 2 - Aerobic', '{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 35, "description": "Comfortable pace"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 11 endurance run. Building aerobic capacity.', 'Keep effort comfortable. Building endurance foundation.', ARRAY['Build running endurance', 'Develop aerobic capacity', 'Practice consistency']),

('a1111111-1111-1111-1111-111111111111', 11, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 11 rest. Peak training phase - rest is crucial.', 'High intensity training. Prioritize recovery: sleep, nutrition, hydration.', ARRAY['Recover from high-intensity week', 'Prepare for Week 12', 'Mental preparation']),

('a1111111-1111-1111-1111-111111111111', 12, 1, 'swim', 'race_prep', 25, 0.31, 'Zone 2 with speed', '{"warmup": {"duration": 8, "description": "Easy"}, "main_set": {"duration": 12, "description": "6x50m - first 3 easy, last 3 race pace"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Race week! Cut volume in half, maintain quality. Easy swimming with race-pace efforts.', 'Taper week - trust your training. Youre ready.', ARRAY['Maintain feel', 'Stay sharp', 'Begin taper']),

('a1111111-1111-1111-1111-111111111111', 12, 2, 'bike', 'race_prep', 30, 6, 'Zone 2 with race pace', '{"warmup": {"duration": 10, "description": "Easy"}, "main_set": {"duration": 15, "description": "3x3min race pace with 2min easy"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Short bike with race-pace efforts. Keep legs fresh, maintain sharpness.', 'Short ride to keep legs loose. Race-pace efforts remind body of race feel.', ARRAY['Maintain leg speed', 'Stay sharp', 'Practice race pace']),

('a1111111-1111-1111-1111-111111111111', 12, 3, 'run', 'race_prep', 25, 2, 'Zone 2 with pickups', '{"warmup": {"duration": 10, "description": "Easy jog"}, "main_set": {"duration": 12, "description": "4x2min race pace with 90s easy"}, "cooldown": {"duration": 3, "description": "Easy"}}', 'Short run with race-pace pickups. Keep volume low, legs should feel snappy.', 'Easy run with race-pace efforts. Your legs should feel snappy. Trust fitness.', ARRAY['Maintain running sharpness', 'Keep legs fresh', 'Practice race pace']),

('a1111111-1111-1111-1111-111111111111', 12, 4, 'swim', 'race_prep', 20, 0.25, 'Zone 1-2 - Easy', '{"warmup": {"duration": 5, "description": "Easy"}, "main_set": {"duration": 10, "description": "Easy continuous, drills"}, "cooldown": {"duration": 5, "description": "Easy backstroke"}}', 'Very easy short swim. Just maintaining feel for water. Stay loose.', 'Minimal swimming. Just reminding body how to move in water.', ARRAY['Maintain feel', 'Stay loose', 'Conserve energy']),

('a1111111-1111-1111-1111-111111111111', 12, 5, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest - 2 days before race"}', 'Complete rest two days before race. Let body fully recover. Hydrate, eat well.', 'Two days before race: complete rest. Visualization, positive self-talk, prepare gear.', ARRAY['Complete recovery', 'Mental preparation', 'Equipment check']),

('a1111111-1111-1111-1111-111111111111', 12, 6, 'swim', 'race_prep', 15, 0.16, 'Zone 1-2 with fast 25s', '{"warmup": {"duration": 5, "description": "Easy"}, "main_set": {"duration": 8, "description": "4x25m fast with 30s rest"}, "cooldown": {"duration": 2, "description": "Easy"}}', 'Day before race: super short swim with 4 fast 25s. Feel speed. Stay loose.', 'Pre-race shakeout. Very short, very easy, few fast efforts to feel snappy.', ARRAY['Feel race speed', 'Stay loose', 'Final preparation']),

('a1111111-1111-1111-1111-111111111111', 12, 7, 'rest', 'race_day', NULL, NULL, 'RACE DAY!', '{"description": "RACE DAY - Execute your plan, trust your training, have fun!"}', 'RACE DAY! Youve trained for 12 weeks. Your body is rested and ready. Trust your training. Execute your plan. Most importantly: HAVE FUN!', 'This is why you trained! Early arrival, smooth warmup, calm mind. Execute race plan. Youve done the work. TRUST YOUR TRAINING!', ARRAY['Execute race plan', 'Trust training', 'Enjoy the experience', 'Achieve your goal!']);


-- =====================================================
-- COMPLETE WORKOUTS: Template 2 Sprint Intermediate
-- All 84 workouts (12 weeks x 7 days)
-- =====================================================

INSERT INTO training_plan_workouts (template_id, week_number, day_of_week, discipline, workout_type, duration_minutes, distance_miles, intensity_description, structure, detailed_description, coaching_notes, goals) VALUES
('a2222222-2222-2222-2222-222222222222', 1, 1, 'swim', 'intervals', 45, 0.6799999999999999, 'Zone 3-4 - Tempo/Threshold', '{"warmup": {"duration": 8, "description": "Progressive warmup"}, "main_set": {"duration": 32, "description": "Interval work - 100s and 50s"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 1: High-intensity interval swim. Mix of 100m and 50m repeats at threshold.', 'Intermediate plan starts with intensity. Focus on holding consistent splits.', ARRAY['Develop threshold pace', 'Practice interval swimming', 'Build speed endurance']),

('a2222222-2222-2222-2222-222222222222', 1, 2, 'bike', 'intervals', 65, 14, 'Zone 2-4 - Aerobic to Threshold', '{"warmup": {"duration": 15, "description": "Progressive to tempo"}, "main_set": {"duration": 45, "description": "Hard intervals with recovery"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 1: Threshold bike intervals. Building power at threshold.', 'Hard efforts but controlled. Maintain power across all repeats.', ARRAY['Build threshold power', 'Develop lactate tolerance', 'Increase power output']),

('a2222222-2222-2222-2222-222222222222', 1, 3, 'run', 'tempo', 47, 4.5, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 10, "description": "Easy jog with strides"}, "main_set": {"duration": 32, "description": "Tempo intervals or continuous"}, "cooldown": {"duration": 5, "description": "Easy jog"}}', 'Week 1: Tempo run building threshold. Comfortably hard effort.', 'Tempo pace is faster than easy but sustainable. Practice race pace feel.', ARRAY['Develop running threshold', 'Practice tempo pacing', 'Build speed endurance']),

('a2222222-2222-2222-2222-222222222222', 1, 4, 'swim', 'base', 40, 0.6799999999999999, 'Zone 2 - Aerobic', '{"warmup": {"duration": 8, "description": "Easy with drills"}, "main_set": {"duration": 27, "description": "Continuous aerobic swim"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 1: Aerobic swim day. Building endurance at comfortable pace.', 'Recovery day for swimming. Build aerobic capacity without intensity.', ARRAY['Build swimming endurance', 'Develop aerobic capacity', 'Active recovery']),

('a2222222-2222-2222-2222-222222222222', 1, 5, 'bike', 'tempo', 70, 15, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 15, "description": "Progressive"}, "main_set": {"duration": 55, "description": "Tempo intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 1: Tempo bike. Sustained efforts at tempo pace.', 'Build sustained power. Practice holding steady watts/effort.', ARRAY['Develop sustained power', 'Practice tempo effort', 'Build endurance']),

('a2222222-2222-2222-2222-222222222222', 1, 6, 'brick', 'brick', 90, 15.0, 'Zone 2-3 - Aerobic/Race Pace', '{"bike": {"duration": 65, "description": "Progressive to race pace"}, "transition": {"duration": 5}, "run": {"duration": 20, "description": "Race pace off bike"}}', 'Week 1: Brick workout. Practice running at race pace off the bike.', 'Brick workouts are key for sprint racing. Practice transitions and race pace.', ARRAY['Develop race-specific fitness', 'Practice transitions', 'Build brick legs']),

('a2222222-2222-2222-2222-222222222222', 1, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 1 complete. High volume and intensity week. Rest is essential.', 'Intermediate training is demanding. Prioritize recovery, sleep, nutrition.', ARRAY['Recover from intense week', 'Allow adaptation', 'Prepare for Week 2']),

('a2222222-2222-2222-2222-222222222222', 2, 1, 'swim', 'intervals', 50, 0.74, 'Zone 3-4 - Tempo/Threshold', '{"warmup": {"duration": 8, "description": "Progressive warmup"}, "main_set": {"duration": 37, "description": "Interval work - 100s and 50s"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 2: High-intensity interval swim. Mix of 100m and 50m repeats at threshold.', 'Intermediate plan starts with intensity. Focus on holding consistent splits.', ARRAY['Develop threshold pace', 'Practice interval swimming', 'Build speed endurance']),

('a2222222-2222-2222-2222-222222222222', 2, 2, 'bike', 'intervals', 70, 15, 'Zone 2-4 - Aerobic to Threshold', '{"warmup": {"duration": 15, "description": "Progressive to tempo"}, "main_set": {"duration": 50, "description": "Hard intervals with recovery"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 2: Threshold bike intervals. Building power at threshold.', 'Hard efforts but controlled. Maintain power across all repeats.', ARRAY['Build threshold power', 'Develop lactate tolerance', 'Increase power output']),

('a2222222-2222-2222-2222-222222222222', 2, 3, 'run', 'tempo', 49, 4.75, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 10, "description": "Easy jog with strides"}, "main_set": {"duration": 34, "description": "Tempo intervals or continuous"}, "cooldown": {"duration": 5, "description": "Easy jog"}}', 'Week 2: Tempo run building threshold. Comfortably hard effort.', 'Tempo pace is faster than easy but sustainable. Practice race pace feel.', ARRAY['Develop running threshold', 'Practice tempo pacing', 'Build speed endurance']),

('a2222222-2222-2222-2222-222222222222', 2, 4, 'swim', 'base', 45, 0.74, 'Zone 2 - Aerobic', '{"warmup": {"duration": 8, "description": "Easy with drills"}, "main_set": {"duration": 32, "description": "Continuous aerobic swim"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 2: Aerobic swim day. Building endurance at comfortable pace.', 'Recovery day for swimming. Build aerobic capacity without intensity.', ARRAY['Build swimming endurance', 'Develop aerobic capacity', 'Active recovery']),

('a2222222-2222-2222-2222-222222222222', 2, 5, 'bike', 'tempo', 75, 16, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 15, "description": "Progressive"}, "main_set": {"duration": 60, "description": "Tempo intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 2: Tempo bike. Sustained efforts at tempo pace.', 'Build sustained power. Practice holding steady watts/effort.', ARRAY['Develop sustained power', 'Practice tempo effort', 'Build endurance']),

('a2222222-2222-2222-2222-222222222222', 2, 6, 'brick', 'brick', 95, 15.5, 'Zone 2-3 - Aerobic/Race Pace', '{"bike": {"duration": 70, "description": "Progressive to race pace"}, "transition": {"duration": 5}, "run": {"duration": 20, "description": "Race pace off bike"}}', 'Week 2: Brick workout. Practice running at race pace off the bike.', 'Brick workouts are key for sprint racing. Practice transitions and race pace.', ARRAY['Develop race-specific fitness', 'Practice transitions', 'Build brick legs']),

('a2222222-2222-2222-2222-222222222222', 2, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 2 complete. High volume and intensity week. Rest is essential.', 'Intermediate training is demanding. Prioritize recovery, sleep, nutrition.', ARRAY['Recover from intense week', 'Allow adaptation', 'Prepare for Week 3']),

('a2222222-2222-2222-2222-222222222222', 3, 1, 'swim', 'intervals', 55, 0.8, 'Zone 3-4 - Tempo/Threshold', '{"warmup": {"duration": 8, "description": "Progressive warmup"}, "main_set": {"duration": 42, "description": "Interval work - 100s and 50s"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 3: High-intensity interval swim. Mix of 100m and 50m repeats at threshold.', 'Intermediate plan starts with intensity. Focus on holding consistent splits.', ARRAY['Develop threshold pace', 'Practice interval swimming', 'Build speed endurance']),

('a2222222-2222-2222-2222-222222222222', 3, 2, 'bike', 'intervals', 75, 16, 'Zone 2-4 - Aerobic to Threshold', '{"warmup": {"duration": 15, "description": "Progressive to tempo"}, "main_set": {"duration": 55, "description": "Hard intervals with recovery"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 3: Threshold bike intervals. Building power at threshold.', 'Hard efforts but controlled. Maintain power across all repeats.', ARRAY['Build threshold power', 'Develop lactate tolerance', 'Increase power output']),

('a2222222-2222-2222-2222-222222222222', 3, 3, 'run', 'tempo', 51, 5.0, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 10, "description": "Easy jog with strides"}, "main_set": {"duration": 36, "description": "Tempo intervals or continuous"}, "cooldown": {"duration": 5, "description": "Easy jog"}}', 'Week 3: Tempo run building threshold. Comfortably hard effort.', 'Tempo pace is faster than easy but sustainable. Practice race pace feel.', ARRAY['Develop running threshold', 'Practice tempo pacing', 'Build speed endurance']),

('a2222222-2222-2222-2222-222222222222', 3, 4, 'swim', 'base', 50, 0.8, 'Zone 2 - Aerobic', '{"warmup": {"duration": 8, "description": "Easy with drills"}, "main_set": {"duration": 37, "description": "Continuous aerobic swim"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 3: Aerobic swim day. Building endurance at comfortable pace.', 'Recovery day for swimming. Build aerobic capacity without intensity.', ARRAY['Build swimming endurance', 'Develop aerobic capacity', 'Active recovery']),

('a2222222-2222-2222-2222-222222222222', 3, 5, 'bike', 'tempo', 80, 17, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 15, "description": "Progressive"}, "main_set": {"duration": 65, "description": "Tempo intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 3: Tempo bike. Sustained efforts at tempo pace.', 'Build sustained power. Practice holding steady watts/effort.', ARRAY['Develop sustained power', 'Practice tempo effort', 'Build endurance']),

('a2222222-2222-2222-2222-222222222222', 3, 6, 'brick', 'brick', 100, 16.0, 'Zone 2-3 - Aerobic/Race Pace', '{"bike": {"duration": 75, "description": "Progressive to race pace"}, "transition": {"duration": 5}, "run": {"duration": 20, "description": "Race pace off bike"}}', 'Week 3: Brick workout. Practice running at race pace off the bike.', 'Brick workouts are key for sprint racing. Practice transitions and race pace.', ARRAY['Develop race-specific fitness', 'Practice transitions', 'Build brick legs']),

('a2222222-2222-2222-2222-222222222222', 3, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 3 complete. High volume and intensity week. Rest is essential.', 'Intermediate training is demanding. Prioritize recovery, sleep, nutrition.', ARRAY['Recover from intense week', 'Allow adaptation', 'Prepare for Week 4']),

('a2222222-2222-2222-2222-222222222222', 4, 1, 'swim', 'intervals', 60, 0.86, 'Zone 3-4 - Tempo/Threshold', '{"warmup": {"duration": 8, "description": "Progressive warmup"}, "main_set": {"duration": 47, "description": "Interval work - 100s and 50s"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 4: High-intensity interval swim. Mix of 100m and 50m repeats at threshold.', 'Intermediate plan starts with intensity. Focus on holding consistent splits.', ARRAY['Develop threshold pace', 'Practice interval swimming', 'Build speed endurance']),

('a2222222-2222-2222-2222-222222222222', 4, 2, 'bike', 'intervals', 80, 17, 'Zone 2-4 - Aerobic to Threshold', '{"warmup": {"duration": 15, "description": "Progressive to tempo"}, "main_set": {"duration": 60, "description": "Hard intervals with recovery"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 4: Threshold bike intervals. Building power at threshold.', 'Hard efforts but controlled. Maintain power across all repeats.', ARRAY['Build threshold power', 'Develop lactate tolerance', 'Increase power output']),

('a2222222-2222-2222-2222-222222222222', 4, 3, 'run', 'tempo', 53, 5.25, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 10, "description": "Easy jog with strides"}, "main_set": {"duration": 38, "description": "Tempo intervals or continuous"}, "cooldown": {"duration": 5, "description": "Easy jog"}}', 'Week 4: Tempo run building threshold. Comfortably hard effort.', 'Tempo pace is faster than easy but sustainable. Practice race pace feel.', ARRAY['Develop running threshold', 'Practice tempo pacing', 'Build speed endurance']),

('a2222222-2222-2222-2222-222222222222', 4, 4, 'swim', 'base', 55, 0.86, 'Zone 2 - Aerobic', '{"warmup": {"duration": 8, "description": "Easy with drills"}, "main_set": {"duration": 42, "description": "Continuous aerobic swim"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 4: Aerobic swim day. Building endurance at comfortable pace.', 'Recovery day for swimming. Build aerobic capacity without intensity.', ARRAY['Build swimming endurance', 'Develop aerobic capacity', 'Active recovery']),

('a2222222-2222-2222-2222-222222222222', 4, 5, 'bike', 'tempo', 85, 18, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 15, "description": "Progressive"}, "main_set": {"duration": 70, "description": "Tempo intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 4: Tempo bike. Sustained efforts at tempo pace.', 'Build sustained power. Practice holding steady watts/effort.', ARRAY['Develop sustained power', 'Practice tempo effort', 'Build endurance']),

('a2222222-2222-2222-2222-222222222222', 4, 6, 'brick', 'brick', 105, 16.5, 'Zone 2-3 - Aerobic/Race Pace', '{"bike": {"duration": 80, "description": "Progressive to race pace"}, "transition": {"duration": 5}, "run": {"duration": 20, "description": "Race pace off bike"}}', 'Week 4: Brick workout. Practice running at race pace off the bike.', 'Brick workouts are key for sprint racing. Practice transitions and race pace.', ARRAY['Develop race-specific fitness', 'Practice transitions', 'Build brick legs']),

('a2222222-2222-2222-2222-222222222222', 4, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 4 complete. High volume and intensity week. Rest is essential.', 'Intermediate training is demanding. Prioritize recovery, sleep, nutrition.', ARRAY['Recover from intense week', 'Allow adaptation', 'Prepare for Week 5']),

('a2222222-2222-2222-2222-222222222222', 5, 1, 'swim', 'intervals', 47, 0.78, 'Zone 3-4 - Tempo/Threshold', '{"warmup": {"duration": 10, "description": "Progressive"}, "main_set": {"duration": 32, "description": "Mixed intervals - 200s, 100s, 50s"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 5 Build phase: Advanced interval work mixing distances.', 'Mix of endurance (200s) and speed (50s). This is sprint tri specific.', ARRAY['Build versatile pace', 'Develop speed and endurance', 'Race-specific training']),

('a2222222-2222-2222-2222-222222222222', 5, 2, 'bike', 'intervals', 70, 16, 'Zone 2-4 - Aerobic to Threshold', '{"warmup": {"duration": 15, "description": "Progressive"}, "main_set": {"duration": 50, "description": "VO2 max or threshold intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 5: Hard bike intervals. Building max aerobic power.', 'These are tough. Focus on form even when fatigued. Mental toughness.', ARRAY['Build VO2 max', 'Develop high-end power', 'Mental toughness']),

('a2222222-2222-2222-2222-222222222222', 5, 3, 'run', 'intervals', 47, 4.75, 'Zone 2-4 - Aerobic to Threshold', '{"warmup": {"duration": 10, "description": "Easy with strides"}, "main_set": {"duration": 32, "description": "5K pace or faster intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 5: Speed intervals developing leg turnover and VO2 max.', 'Fast intervals with adequate recovery. Focus on quick turnover.', ARRAY['Build running speed', 'Develop VO2 max', 'Improve leg turnover']),

('a2222222-2222-2222-2222-222222222222', 5, 4, 'swim', 'base', 40, 0.68, 'Zone 2 - Aerobic', '{"warmup": {"duration": 8, "description": "Easy"}, "main_set": {"duration": 27, "description": "Continuous steady swim"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 5: Aerobic swim day. Recovery from intervals.', 'Keep this easy. Building aerobic base without intensity stress.', ARRAY['Maintain swimming fitness', 'Active recovery', 'Build aerobic base']),

('a2222222-2222-2222-2222-222222222222', 5, 5, 'bike', 'tempo', 75, 17, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 15, "description": "Progressive"}, "main_set": {"duration": 55, "description": "Long tempo intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 5: Extended tempo bike. Building sustained power.', 'Long tempo efforts build race-specific endurance. Stay focused.', ARRAY['Build sustained power', 'Develop mental endurance', 'Race-specific fitness']),

('a2222222-2222-2222-2222-222222222222', 5, 6, 'brick', 'brick', 95, 17.0, 'Zone 2-3 - Aerobic/Race Pace', '{"bike": {"duration": 70, "description": "Building to race pace"}, "transition": {"duration": 5}, "run": {"duration": 20, "description": "Race pace"}}', 'Week 5: Long brick with race-pace emphasis.', 'This is your key race simulation. Practice everything.', ARRAY['Simulate race conditions', 'Practice race pace', 'Build confidence']),

('a2222222-2222-2222-2222-222222222222', 5, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 5 Build phase complete. Volume and intensity are high.', 'Big week. Monitor recovery markers. Are you sleeping enough?', ARRAY['Recover from build week', 'Assess recovery', 'Prepare for Week 6']),

('a2222222-2222-2222-2222-222222222222', 6, 1, 'swim', 'intervals', 49, 0.81, 'Zone 3-4 - Tempo/Threshold', '{"warmup": {"duration": 10, "description": "Progressive"}, "main_set": {"duration": 34, "description": "Mixed intervals - 200s, 100s, 50s"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 6 Build phase: Advanced interval work mixing distances.', 'Mix of endurance (200s) and speed (50s). This is sprint tri specific.', ARRAY['Build versatile pace', 'Develop speed and endurance', 'Race-specific training']),

('a2222222-2222-2222-2222-222222222222', 6, 2, 'bike', 'intervals', 75, 17, 'Zone 2-4 - Aerobic to Threshold', '{"warmup": {"duration": 15, "description": "Progressive"}, "main_set": {"duration": 55, "description": "VO2 max or threshold intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 6: Hard bike intervals. Building max aerobic power.', 'These are tough. Focus on form even when fatigued. Mental toughness.', ARRAY['Build VO2 max', 'Develop high-end power', 'Mental toughness']),

('a2222222-2222-2222-2222-222222222222', 6, 3, 'run', 'intervals', 49, 5.0, 'Zone 2-4 - Aerobic to Threshold', '{"warmup": {"duration": 10, "description": "Easy with strides"}, "main_set": {"duration": 34, "description": "5K pace or faster intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 6: Speed intervals developing leg turnover and VO2 max.', 'Fast intervals with adequate recovery. Focus on quick turnover.', ARRAY['Build running speed', 'Develop VO2 max', 'Improve leg turnover']),

('a2222222-2222-2222-2222-222222222222', 6, 4, 'swim', 'base', 40, 0.68, 'Zone 2 - Aerobic', '{"warmup": {"duration": 8, "description": "Easy"}, "main_set": {"duration": 27, "description": "Continuous steady swim"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 6: Aerobic swim day. Recovery from intervals.', 'Keep this easy. Building aerobic base without intensity stress.', ARRAY['Maintain swimming fitness', 'Active recovery', 'Build aerobic base']),

('a2222222-2222-2222-2222-222222222222', 6, 5, 'bike', 'tempo', 80, 18, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 15, "description": "Progressive"}, "main_set": {"duration": 60, "description": "Long tempo intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 6: Extended tempo bike. Building sustained power.', 'Long tempo efforts build race-specific endurance. Stay focused.', ARRAY['Build sustained power', 'Develop mental endurance', 'Race-specific fitness']),

('a2222222-2222-2222-2222-222222222222', 6, 6, 'brick', 'brick', 100, 17.5, 'Zone 2-3 - Aerobic/Race Pace', '{"bike": {"duration": 75, "description": "Building to race pace"}, "transition": {"duration": 5}, "run": {"duration": 20, "description": "Race pace"}}', 'Week 6: Long brick with race-pace emphasis.', 'This is your key race simulation. Practice everything.', ARRAY['Simulate race conditions', 'Practice race pace', 'Build confidence']),

('a2222222-2222-2222-2222-222222222222', 6, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 6 Build phase complete. Volume and intensity are high.', 'Big week. Monitor recovery markers. Are you sleeping enough?', ARRAY['Recover from build week', 'Assess recovery', 'Prepare for Week 7']),

('a2222222-2222-2222-2222-222222222222', 7, 1, 'swim', 'intervals', 51, 0.84, 'Zone 3-4 - Tempo/Threshold', '{"warmup": {"duration": 10, "description": "Progressive"}, "main_set": {"duration": 36, "description": "Mixed intervals - 200s, 100s, 50s"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 7 Build phase: Advanced interval work mixing distances.', 'Mix of endurance (200s) and speed (50s). This is sprint tri specific.', ARRAY['Build versatile pace', 'Develop speed and endurance', 'Race-specific training']),

('a2222222-2222-2222-2222-222222222222', 7, 2, 'bike', 'intervals', 80, 18, 'Zone 2-4 - Aerobic to Threshold', '{"warmup": {"duration": 15, "description": "Progressive"}, "main_set": {"duration": 60, "description": "VO2 max or threshold intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 7: Hard bike intervals. Building max aerobic power.', 'These are tough. Focus on form even when fatigued. Mental toughness.', ARRAY['Build VO2 max', 'Develop high-end power', 'Mental toughness']),

('a2222222-2222-2222-2222-222222222222', 7, 3, 'run', 'intervals', 51, 5.25, 'Zone 2-4 - Aerobic to Threshold', '{"warmup": {"duration": 10, "description": "Easy with strides"}, "main_set": {"duration": 36, "description": "5K pace or faster intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 7: Speed intervals developing leg turnover and VO2 max.', 'Fast intervals with adequate recovery. Focus on quick turnover.', ARRAY['Build running speed', 'Develop VO2 max', 'Improve leg turnover']),

('a2222222-2222-2222-2222-222222222222', 7, 4, 'swim', 'base', 40, 0.68, 'Zone 2 - Aerobic', '{"warmup": {"duration": 8, "description": "Easy"}, "main_set": {"duration": 27, "description": "Continuous steady swim"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 7: Aerobic swim day. Recovery from intervals.', 'Keep this easy. Building aerobic base without intensity stress.', ARRAY['Maintain swimming fitness', 'Active recovery', 'Build aerobic base']),

('a2222222-2222-2222-2222-222222222222', 7, 5, 'bike', 'tempo', 85, 19, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 15, "description": "Progressive"}, "main_set": {"duration": 65, "description": "Long tempo intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 7: Extended tempo bike. Building sustained power.', 'Long tempo efforts build race-specific endurance. Stay focused.', ARRAY['Build sustained power', 'Develop mental endurance', 'Race-specific fitness']),

('a2222222-2222-2222-2222-222222222222', 7, 6, 'brick', 'brick', 105, 18.0, 'Zone 2-3 - Aerobic/Race Pace', '{"bike": {"duration": 80, "description": "Building to race pace"}, "transition": {"duration": 5}, "run": {"duration": 20, "description": "Race pace"}}', 'Week 7: Long brick with race-pace emphasis.', 'This is your key race simulation. Practice everything.', ARRAY['Simulate race conditions', 'Practice race pace', 'Build confidence']),

('a2222222-2222-2222-2222-222222222222', 7, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 7 Build phase complete. Volume and intensity are high.', 'Big week. Monitor recovery markers. Are you sleeping enough?', ARRAY['Recover from build week', 'Assess recovery', 'Prepare for Week 8']),

('a2222222-2222-2222-2222-222222222222', 8, 1, 'swim', 'intervals', 53, 0.87, 'Zone 3-4 - Tempo/Threshold', '{"warmup": {"duration": 10, "description": "Progressive"}, "main_set": {"duration": 38, "description": "Mixed intervals - 200s, 100s, 50s"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 8 Build phase: Advanced interval work mixing distances.', 'Mix of endurance (200s) and speed (50s). This is sprint tri specific.', ARRAY['Build versatile pace', 'Develop speed and endurance', 'Race-specific training']),

('a2222222-2222-2222-2222-222222222222', 8, 2, 'bike', 'intervals', 85, 19, 'Zone 2-4 - Aerobic to Threshold', '{"warmup": {"duration": 15, "description": "Progressive"}, "main_set": {"duration": 65, "description": "VO2 max or threshold intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 8: Hard bike intervals. Building max aerobic power.', 'These are tough. Focus on form even when fatigued. Mental toughness.', ARRAY['Build VO2 max', 'Develop high-end power', 'Mental toughness']),

('a2222222-2222-2222-2222-222222222222', 8, 3, 'run', 'intervals', 53, 5.5, 'Zone 2-4 - Aerobic to Threshold', '{"warmup": {"duration": 10, "description": "Easy with strides"}, "main_set": {"duration": 38, "description": "5K pace or faster intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 8: Speed intervals developing leg turnover and VO2 max.', 'Fast intervals with adequate recovery. Focus on quick turnover.', ARRAY['Build running speed', 'Develop VO2 max', 'Improve leg turnover']),

('a2222222-2222-2222-2222-222222222222', 8, 4, 'swim', 'base', 40, 0.68, 'Zone 2 - Aerobic', '{"warmup": {"duration": 8, "description": "Easy"}, "main_set": {"duration": 27, "description": "Continuous steady swim"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 8: Aerobic swim day. Recovery from intervals.', 'Keep this easy. Building aerobic base without intensity stress.', ARRAY['Maintain swimming fitness', 'Active recovery', 'Build aerobic base']),

('a2222222-2222-2222-2222-222222222222', 8, 5, 'bike', 'tempo', 90, 20, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 15, "description": "Progressive"}, "main_set": {"duration": 70, "description": "Long tempo intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 8: Extended tempo bike. Building sustained power.', 'Long tempo efforts build race-specific endurance. Stay focused.', ARRAY['Build sustained power', 'Develop mental endurance', 'Race-specific fitness']),

('a2222222-2222-2222-2222-222222222222', 8, 6, 'brick', 'brick', 110, 18.5, 'Zone 2-3 - Aerobic/Race Pace', '{"bike": {"duration": 85, "description": "Building to race pace"}, "transition": {"duration": 5}, "run": {"duration": 20, "description": "Race pace"}}', 'Week 8: Long brick with race-pace emphasis.', 'This is your key race simulation. Practice everything.', ARRAY['Simulate race conditions', 'Practice race pace', 'Build confidence']),

('a2222222-2222-2222-2222-222222222222', 8, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 8 Build phase complete. Volume and intensity are high.', 'Big week. Monitor recovery markers. Are you sleeping enough?', ARRAY['Recover from build week', 'Assess recovery', 'Prepare for Week 9']),

('a2222222-2222-2222-2222-222222222222', 9, 1, 'swim', 'race_pace', 45, 0.75, 'Zone 3-4 - Race Pace/Threshold', '{"warmup": {"duration": 10, "description": "Progressive"}, "main_set": {"duration": 30, "description": "Race pace intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 9 PEAK phase: Race-specific swim intervals at target pace.', 'These are at or above race pace. Building confidence and speed.', ARRAY['Sharpen race pace', 'Build confidence', 'Race-specific fitness']),

('a2222222-2222-2222-2222-222222222222', 9, 2, 'bike', 'race_pace', 75, 17, 'Zone 3-4 - Race Pace/Threshold', '{"warmup": {"duration": 15, "description": "Progressive"}, "main_set": {"duration": 55, "description": "Race pace or threshold intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 9: Race-pace bike work. Building race-specific power.', 'Practice holding race watts/effort. This is your race intensity.', ARRAY['Lock in race pace', 'Build race fitness', 'Develop confidence']),

('a2222222-2222-2222-2222-222222222222', 9, 3, 'run', 'race_pace', 50, 5, 'Zone 3 - Race Pace', '{"warmup": {"duration": 10, "description": "Easy with strides"}, "main_set": {"duration": 35, "description": "Race pace work"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 9: Extended race-pace running. Above race distance.', 'Running beyond race distance at race pace. Huge confidence builder.', ARRAY['Exceed race distance', 'Lock in race pace', 'Build confidence']),

('a2222222-2222-2222-2222-222222222222', 9, 4, 'swim', 'recovery', 30, 0.37, 'Zone 1-2 - Easy', '{"warmup": {"duration": 5, "description": "Easy"}, "main_set": {"duration": 20, "description": "Easy continuous"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 9: Recovery swim. Keep loose, maintain feel.', 'After hard training, easy swimming promotes recovery.', ARRAY['Active recovery', 'Maintain feel', 'Prepare for weekend']),

('a2222222-2222-2222-2222-222222222222', 9, 5, 'bike', 'recovery', 45, 9, 'Zone 1-2 - Easy', '{"warmup": {"duration": 5, "description": "Easy"}, "main_set": {"duration": 35, "description": "Easy spinning"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 9: Recovery ride. Easy spinning, low stress.', 'Keep this very easy. Promoting recovery while maintaining movement.', ARRAY['Active recovery', 'Flush legs', 'Prepare for brick']),

('a2222222-2222-2222-2222-222222222222', 9, 6, 'brick', 'race_simulation', 95, 17.5, 'Zone 3 - Race Pace', '{"bike": {"duration": 70, "description": "Full race simulation"}, "transition": {"duration": 5}, "run": {"duration": 20, "description": "Full race pace"}}', 'Week 9: RACE SIMULATION. Full sprint distance at race pace.', 'This is your final dress rehearsal. Execute your complete race plan.', ARRAY['Full race simulation', 'Test race plan', 'Build unshakeable confidence']),

('a2222222-2222-2222-2222-222222222222', 9, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 9 Peak phase complete. Youve done race simulations.', 'Huge training accomplished. Youre fit and ready. Now we taper.', ARRAY['Recover from peak week', 'Mental preparation', 'Begin taper mindset']),

('a2222222-2222-2222-2222-222222222222', 10, 1, 'swim', 'race_pace', 45, 0.75, 'Zone 3-4 - Race Pace/Threshold', '{"warmup": {"duration": 10, "description": "Progressive"}, "main_set": {"duration": 30, "description": "Race pace intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 10 PEAK phase: Race-specific swim intervals at target pace.', 'These are at or above race pace. Building confidence and speed.', ARRAY['Sharpen race pace', 'Build confidence', 'Race-specific fitness']),

('a2222222-2222-2222-2222-222222222222', 10, 2, 'bike', 'race_pace', 75, 17, 'Zone 3-4 - Race Pace/Threshold', '{"warmup": {"duration": 15, "description": "Progressive"}, "main_set": {"duration": 55, "description": "Race pace or threshold intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 10: Race-pace bike work. Building race-specific power.', 'Practice holding race watts/effort. This is your race intensity.', ARRAY['Lock in race pace', 'Build race fitness', 'Develop confidence']),

('a2222222-2222-2222-2222-222222222222', 10, 3, 'run', 'race_pace', 50, 5, 'Zone 3 - Race Pace', '{"warmup": {"duration": 10, "description": "Easy with strides"}, "main_set": {"duration": 35, "description": "Race pace work"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 10: Extended race-pace running. Above race distance.', 'Running beyond race distance at race pace. Huge confidence builder.', ARRAY['Exceed race distance', 'Lock in race pace', 'Build confidence']),

('a2222222-2222-2222-2222-222222222222', 10, 4, 'swim', 'recovery', 30, 0.37, 'Zone 1-2 - Easy', '{"warmup": {"duration": 5, "description": "Easy"}, "main_set": {"duration": 20, "description": "Easy continuous"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 10: Recovery swim. Keep loose, maintain feel.', 'After hard training, easy swimming promotes recovery.', ARRAY['Active recovery', 'Maintain feel', 'Prepare for weekend']),

('a2222222-2222-2222-2222-222222222222', 10, 5, 'bike', 'recovery', 45, 9, 'Zone 1-2 - Easy', '{"warmup": {"duration": 5, "description": "Easy"}, "main_set": {"duration": 35, "description": "Easy spinning"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 10: Recovery ride. Easy spinning, low stress.', 'Keep this very easy. Promoting recovery while maintaining movement.', ARRAY['Active recovery', 'Flush legs', 'Prepare for brick']),

('a2222222-2222-2222-2222-222222222222', 10, 6, 'brick', 'race_simulation', 95, 17.5, 'Zone 3 - Race Pace', '{"bike": {"duration": 70, "description": "Full race simulation"}, "transition": {"duration": 5}, "run": {"duration": 20, "description": "Full race pace"}}', 'Week 10: RACE SIMULATION. Full sprint distance at race pace.', 'This is your final dress rehearsal. Execute your complete race plan.', ARRAY['Full race simulation', 'Test race plan', 'Build unshakeable confidence']),

('a2222222-2222-2222-2222-222222222222', 10, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 10 Peak phase complete. Youve done race simulations.', 'Huge training accomplished. Youre fit and ready. Now we taper.', ARRAY['Recover from peak week', 'Mental preparation', 'Begin taper mindset']),

('a2222222-2222-2222-2222-222222222222', 11, 1, 'swim', 'race_pace', 45, 0.75, 'Zone 3-4 - Race Pace/Threshold', '{"warmup": {"duration": 10, "description": "Progressive"}, "main_set": {"duration": 30, "description": "Race pace intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 11 PEAK phase: Race-specific swim intervals at target pace.', 'These are at or above race pace. Building confidence and speed.', ARRAY['Sharpen race pace', 'Build confidence', 'Race-specific fitness']),

('a2222222-2222-2222-2222-222222222222', 11, 2, 'bike', 'race_pace', 75, 17, 'Zone 3-4 - Race Pace/Threshold', '{"warmup": {"duration": 15, "description": "Progressive"}, "main_set": {"duration": 55, "description": "Race pace or threshold intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 11: Race-pace bike work. Building race-specific power.', 'Practice holding race watts/effort. This is your race intensity.', ARRAY['Lock in race pace', 'Build race fitness', 'Develop confidence']),

('a2222222-2222-2222-2222-222222222222', 11, 3, 'run', 'race_pace', 50, 5, 'Zone 3 - Race Pace', '{"warmup": {"duration": 10, "description": "Easy with strides"}, "main_set": {"duration": 35, "description": "Race pace work"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 11: Extended race-pace running. Above race distance.', 'Running beyond race distance at race pace. Huge confidence builder.', ARRAY['Exceed race distance', 'Lock in race pace', 'Build confidence']),

('a2222222-2222-2222-2222-222222222222', 11, 4, 'swim', 'recovery', 30, 0.37, 'Zone 1-2 - Easy', '{"warmup": {"duration": 5, "description": "Easy"}, "main_set": {"duration": 20, "description": "Easy continuous"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 11: Recovery swim. Keep loose, maintain feel.', 'After hard training, easy swimming promotes recovery.', ARRAY['Active recovery', 'Maintain feel', 'Prepare for weekend']),

('a2222222-2222-2222-2222-222222222222', 11, 5, 'bike', 'recovery', 45, 9, 'Zone 1-2 - Easy', '{"warmup": {"duration": 5, "description": "Easy"}, "main_set": {"duration": 35, "description": "Easy spinning"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 11: Recovery ride. Easy spinning, low stress.', 'Keep this very easy. Promoting recovery while maintaining movement.', ARRAY['Active recovery', 'Flush legs', 'Prepare for brick']),

('a2222222-2222-2222-2222-222222222222', 11, 6, 'brick', 'race_simulation', 95, 17.5, 'Zone 3 - Race Pace', '{"bike": {"duration": 70, "description": "Full race simulation"}, "transition": {"duration": 5}, "run": {"duration": 20, "description": "Full race pace"}}', 'Week 11: RACE SIMULATION. Full sprint distance at race pace.', 'This is your final dress rehearsal. Execute your complete race plan.', ARRAY['Full race simulation', 'Test race plan', 'Build unshakeable confidence']),

('a2222222-2222-2222-2222-222222222222', 11, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 11 Peak phase complete. Youve done race simulations.', 'Huge training accomplished. Youre fit and ready. Now we taper.', ARRAY['Recover from peak week', 'Mental preparation', 'Begin taper mindset']),

('a2222222-2222-2222-2222-222222222222', 12, 1, 'swim', 'race_prep', 30, 0.37, 'Zone 2 with pickups', '{"warmup": {"duration": 10, "description": "Easy"}, "main_set": {"duration": 15, "description": "8x50m - odds easy, evens race pace"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Race week taper. Maintain sharpness with race-pace 50s, cut volume significantly.', 'Trust your training. Youve built great fitness. Now let body rest and sharpen.', ARRAY['Maintain sharpness', 'Begin taper', 'Stay fresh']),

('a2222222-2222-2222-2222-222222222222', 12, 2, 'bike', 'race_prep', 35, 7, 'Zone 2 with race pace', '{"warmup": {"duration": 10, "description": "Easy"}, "main_set": {"duration": 20, "description": "4x3min race pace with 2min easy"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Short bike with race-pace efforts. Keep legs fresh but remind body of race intensity.', 'Low volume, quality efforts. Your legs should feel snappy and ready.', ARRAY['Maintain leg speed', 'Practice race pace', 'Stay sharp']),

('a2222222-2222-2222-2222-222222222222', 12, 3, 'run', 'race_prep', 30, 2.5, 'Zone 2 with strides', '{"warmup": {"duration": 15, "description": "Easy jog"}, "main_set": {"duration": 12, "description": "6x30s race pace with 90s recovery"}, "cooldown": {"duration": 3, "description": "Easy"}}', 'Easy run with short race-pace pickups. Maintain running sharpness without fatigue.', 'Easy volume, sharp efforts. Feel your leg speed. Youre ready.', ARRAY['Maintain sharpness', 'Feel race speed', 'Stay fresh']),

('a2222222-2222-2222-2222-222222222222', 12, 4, 'swim', 'race_prep', 20, 0.25, 'Zone 1-2 - Easy', '{"warmup": {"duration": 5, "description": "Easy"}, "main_set": {"duration": 10, "description": "Easy continuous, drills"}, "cooldown": {"duration": 5, "description": "Easy backstroke"}}', 'Minimal swimming. Just maintaining feel. Stay loose.', 'Very easy. Just reminding body of swimming movement.', ARRAY['Maintain feel', 'Stay loose', 'Conserve energy']),

('a2222222-2222-2222-2222-222222222222', 12, 5, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest - 2 days before race"}', 'Complete rest. Hydrate, eat well, visualize success.', 'Two days out. Rest completely. Mental preparation is key now.', ARRAY['Complete recovery', 'Mental preparation', 'Equipment ready']),

('a2222222-2222-2222-2222-222222222222', 12, 6, 'bike', 'race_prep', 20, 4, 'Zone 1-2 with fast 30s', '{"warmup": {"duration": 10, "description": "Easy"}, "main_set": {"duration": 8, "description": "4x30s fast with 2min easy"}, "cooldown": {"duration": 2, "description": "Easy"}}', 'Day before: super short bike shakeout. Feel snappy. Check bike is race-ready.', 'Final shakeout. Very short, few fast efforts. Check all equipment.', ARRAY['Feel fast', 'Equipment check', 'Stay loose']),

('a2222222-2222-2222-2222-222222222222', 12, 7, 'rest', 'race_day', NULL, NULL, 'RACE DAY!', '{"description": "RACE DAY - Execute your race plan and go for your PR!"}', 'RACE DAY! Youre fit, rested, ready. Execute race plan. Trust training. Go get that PR!', 'Youve done the work. Now execute. Stay calm, trust fitness, race smart. Youve got this!', ARRAY['Execute race plan', 'Achieve PR goal', 'Trust training', 'Race smart']);


-- =====================================================
-- COMPLETE WORKOUTS: Template 3 Olympic Beginner
-- All 112 workouts (16 weeks x 7 days)
-- =====================================================

INSERT INTO training_plan_workouts (template_id, week_number, day_of_week, discipline, workout_type, duration_minutes, distance_miles, intensity_description, structure, detailed_description, coaching_notes, goals) VALUES
('a3333333-3333-3333-3333-333333333333', 1, 1, 'swim', 'base', 37, 0.55, 'Zone 2 - Aerobic', '{"warmup": {"duration": 7, "description": "Easy with drills"}, "main_set": {"duration": 25, "description": "Continuous aerobic swim"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 1: Foundation phase. Building from sprint distance toward Olympic.', 'Olympic requires solid aerobic base. Start conservatively, build gradually.', ARRAY['Build swimming endurance', 'Develop aerobic capacity', 'Foundation building']),

('a3333333-3333-3333-3333-333333333333', 1, 2, 'bike', 'base', 65, 13, 'Zone 2 - Aerobic', '{"warmup": {"duration": 10, "description": "Easy spinning"}, "main_set": {"duration": 50, "description": "Steady Zone 2"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 1: Aerobic bike ride. Building time in saddle for Olympic distance.', 'Focus on comfort. Olympic is 40K - need solid aerobic base.', ARRAY['Build cycling endurance', 'Develop aerobic capacity', 'Increase volume']),

('a3333333-3333-3333-3333-333333333333', 1, 3, 'run', 'base', 38, 3.3, 'Zone 2 - Aerobic', '{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 28, "description": "Comfortable steady pace"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 1: Foundation run. Building toward 10K race distance.', 'Keep conversational. Building endurance for Olympic 10K run.', ARRAY['Build running endurance', 'Develop aerobic base', 'Foundation phase']),

('a3333333-3333-3333-3333-333333333333', 1, 4, 'swim', 'technique', 32, 0.55, 'Zone 2 - Aerobic', '{"warmup": {"duration": 7, "description": "Easy"}, "main_set": {"duration": 20, "description": "Drill work and technique focus"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 1: Technique day. Efficiency is crucial for 1.5K swim.', 'Olympic swim is 3x sprint distance. Efficiency matters greatly.', ARRAY['Develop swimming efficiency', 'Practice drills', 'Build technique']),

('a3333333-3333-3333-3333-333333333333', 1, 5, 'bike', 'base', 70, 13, 'Zone 2 - Aerobic', '{"warmup": {"duration": 10, "description": "Easy"}, "main_set": {"duration": 55, "description": "Steady with some rolling terrain"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 1: Second bike of week. Adding volume gradually.', 'Practice nutrition every 20 minutes. Critical for Olympic distance.', ARRAY['Increase bike volume', 'Practice nutrition', 'Build endurance']),

('a3333333-3333-3333-3333-333333333333', 1, 6, 'run', 'base', 43, 3.5999999999999996, 'Zone 2 - Aerobic', '{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 38, "description": "Long steady run"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 1: Long run day. Building toward 10K distance.', 'Weekly long run builds endurance. Keep pace comfortable.', ARRAY['Build running endurance', 'Develop aerobic capacity', 'Long run practice']),

('a3333333-3333-3333-3333-333333333333', 1, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 1 complete. Foundation phase building base fitness.', 'Rest is essential. Olympic training is demanding. Prioritize recovery.', ARRAY['Recover from training week', 'Allow adaptation', 'Prepare for Week 2']),

('a3333333-3333-3333-3333-333333333333', 2, 1, 'swim', 'base', 39, 0.6, 'Zone 2 - Aerobic', '{"warmup": {"duration": 7, "description": "Easy with drills"}, "main_set": {"duration": 27, "description": "Continuous aerobic swim"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 2: Foundation phase. Building from sprint distance toward Olympic.', 'Olympic requires solid aerobic base. Start conservatively, build gradually.', ARRAY['Build swimming endurance', 'Develop aerobic capacity', 'Foundation building']),

('a3333333-3333-3333-3333-333333333333', 2, 2, 'bike', 'base', 70, 14, 'Zone 2 - Aerobic', '{"warmup": {"duration": 10, "description": "Easy spinning"}, "main_set": {"duration": 55, "description": "Steady Zone 2"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 2: Aerobic bike ride. Building time in saddle for Olympic distance.', 'Focus on comfort. Olympic is 40K - need solid aerobic base.', ARRAY['Build cycling endurance', 'Develop aerobic capacity', 'Increase volume']),

('a3333333-3333-3333-3333-333333333333', 2, 3, 'run', 'base', 41, 3.6, 'Zone 2 - Aerobic', '{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 31, "description": "Comfortable steady pace"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 2: Foundation run. Building toward 10K race distance.', 'Keep conversational. Building endurance for Olympic 10K run.', ARRAY['Build running endurance', 'Develop aerobic base', 'Foundation phase']),

('a3333333-3333-3333-3333-333333333333', 2, 4, 'swim', 'technique', 34, 0.6, 'Zone 2 - Aerobic', '{"warmup": {"duration": 7, "description": "Easy"}, "main_set": {"duration": 22, "description": "Drill work and technique focus"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 2: Technique day. Efficiency is crucial for 1.5K swim.', 'Olympic swim is 3x sprint distance. Efficiency matters greatly.', ARRAY['Develop swimming efficiency', 'Practice drills', 'Build technique']),

('a3333333-3333-3333-3333-333333333333', 2, 5, 'bike', 'base', 75, 14, 'Zone 2 - Aerobic', '{"warmup": {"duration": 10, "description": "Easy"}, "main_set": {"duration": 60, "description": "Steady with some rolling terrain"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 2: Second bike of week. Adding volume gradually.', 'Practice nutrition every 20 minutes. Critical for Olympic distance.', ARRAY['Increase bike volume', 'Practice nutrition', 'Build endurance']),

('a3333333-3333-3333-3333-333333333333', 2, 6, 'run', 'base', 46, 3.9, 'Zone 2 - Aerobic', '{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 41, "description": "Long steady run"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 2: Long run day. Building toward 10K distance.', 'Weekly long run builds endurance. Keep pace comfortable.', ARRAY['Build running endurance', 'Develop aerobic capacity', 'Long run practice']),

('a3333333-3333-3333-3333-333333333333', 2, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 2 complete. Foundation phase building base fitness.', 'Rest is essential. Olympic training is demanding. Prioritize recovery.', ARRAY['Recover from training week', 'Allow adaptation', 'Prepare for Week 3']),

('a3333333-3333-3333-3333-333333333333', 3, 1, 'swim', 'base', 41, 0.65, 'Zone 2 - Aerobic', '{"warmup": {"duration": 7, "description": "Easy with drills"}, "main_set": {"duration": 29, "description": "Continuous aerobic swim"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 3: Foundation phase. Building from sprint distance toward Olympic.', 'Olympic requires solid aerobic base. Start conservatively, build gradually.', ARRAY['Build swimming endurance', 'Develop aerobic capacity', 'Foundation building']),

('a3333333-3333-3333-3333-333333333333', 3, 2, 'bike', 'base', 75, 15, 'Zone 2 - Aerobic', '{"warmup": {"duration": 10, "description": "Easy spinning"}, "main_set": {"duration": 60, "description": "Steady Zone 2"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 3: Aerobic bike ride. Building time in saddle for Olympic distance.', 'Focus on comfort. Olympic is 40K - need solid aerobic base.', ARRAY['Build cycling endurance', 'Develop aerobic capacity', 'Increase volume']),

('a3333333-3333-3333-3333-333333333333', 3, 3, 'run', 'base', 44, 3.9, 'Zone 2 - Aerobic', '{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 34, "description": "Comfortable steady pace"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 3: Foundation run. Building toward 10K race distance.', 'Keep conversational. Building endurance for Olympic 10K run.', ARRAY['Build running endurance', 'Develop aerobic base', 'Foundation phase']),

('a3333333-3333-3333-3333-333333333333', 3, 4, 'swim', 'technique', 36, 0.65, 'Zone 2 - Aerobic', '{"warmup": {"duration": 7, "description": "Easy"}, "main_set": {"duration": 24, "description": "Drill work and technique focus"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 3: Technique day. Efficiency is crucial for 1.5K swim.', 'Olympic swim is 3x sprint distance. Efficiency matters greatly.', ARRAY['Develop swimming efficiency', 'Practice drills', 'Build technique']),

('a3333333-3333-3333-3333-333333333333', 3, 5, 'bike', 'base', 80, 15, 'Zone 2 - Aerobic', '{"warmup": {"duration": 10, "description": "Easy"}, "main_set": {"duration": 65, "description": "Steady with some rolling terrain"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 3: Second bike of week. Adding volume gradually.', 'Practice nutrition every 20 minutes. Critical for Olympic distance.', ARRAY['Increase bike volume', 'Practice nutrition', 'Build endurance']),

('a3333333-3333-3333-3333-333333333333', 3, 6, 'run', 'base', 49, 4.199999999999999, 'Zone 2 - Aerobic', '{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 44, "description": "Long steady run"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 3: Long run day. Building toward 10K distance.', 'Weekly long run builds endurance. Keep pace comfortable.', ARRAY['Build running endurance', 'Develop aerobic capacity', 'Long run practice']),

('a3333333-3333-3333-3333-333333333333', 3, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 3 complete. Foundation phase building base fitness.', 'Rest is essential. Olympic training is demanding. Prioritize recovery.', ARRAY['Recover from training week', 'Allow adaptation', 'Prepare for Week 4']),

('a3333333-3333-3333-3333-333333333333', 4, 1, 'swim', 'base', 43, 0.7, 'Zone 2 - Aerobic', '{"warmup": {"duration": 7, "description": "Easy with drills"}, "main_set": {"duration": 31, "description": "Continuous aerobic swim"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 4: Foundation phase. Building from sprint distance toward Olympic.', 'Olympic requires solid aerobic base. Start conservatively, build gradually.', ARRAY['Build swimming endurance', 'Develop aerobic capacity', 'Foundation building']),

('a3333333-3333-3333-3333-333333333333', 4, 2, 'bike', 'base', 80, 16, 'Zone 2 - Aerobic', '{"warmup": {"duration": 10, "description": "Easy spinning"}, "main_set": {"duration": 65, "description": "Steady Zone 2"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 4: Aerobic bike ride. Building time in saddle for Olympic distance.', 'Focus on comfort. Olympic is 40K - need solid aerobic base.', ARRAY['Build cycling endurance', 'Develop aerobic capacity', 'Increase volume']),

('a3333333-3333-3333-3333-333333333333', 4, 3, 'run', 'base', 47, 4.2, 'Zone 2 - Aerobic', '{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 37, "description": "Comfortable steady pace"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 4: Foundation run. Building toward 10K race distance.', 'Keep conversational. Building endurance for Olympic 10K run.', ARRAY['Build running endurance', 'Develop aerobic base', 'Foundation phase']),

('a3333333-3333-3333-3333-333333333333', 4, 4, 'swim', 'technique', 38, 0.7, 'Zone 2 - Aerobic', '{"warmup": {"duration": 7, "description": "Easy"}, "main_set": {"duration": 26, "description": "Drill work and technique focus"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 4: Technique day. Efficiency is crucial for 1.5K swim.', 'Olympic swim is 3x sprint distance. Efficiency matters greatly.', ARRAY['Develop swimming efficiency', 'Practice drills', 'Build technique']),

('a3333333-3333-3333-3333-333333333333', 4, 5, 'bike', 'base', 85, 16, 'Zone 2 - Aerobic', '{"warmup": {"duration": 10, "description": "Easy"}, "main_set": {"duration": 70, "description": "Steady with some rolling terrain"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 4: Second bike of week. Adding volume gradually.', 'Practice nutrition every 20 minutes. Critical for Olympic distance.', ARRAY['Increase bike volume', 'Practice nutrition', 'Build endurance']),

('a3333333-3333-3333-3333-333333333333', 4, 6, 'run', 'base', 52, 4.5, 'Zone 2 - Aerobic', '{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 47, "description": "Long steady run"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 4: Long run day. Building toward 10K distance.', 'Weekly long run builds endurance. Keep pace comfortable.', ARRAY['Build running endurance', 'Develop aerobic capacity', 'Long run practice']),

('a3333333-3333-3333-3333-333333333333', 4, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 4 complete. Foundation phase building base fitness.', 'Rest is essential. Olympic training is demanding. Prioritize recovery.', ARRAY['Recover from training week', 'Allow adaptation', 'Prepare for Week 5']),

('a3333333-3333-3333-3333-333333333333', 5, 1, 'swim', 'intervals', 43, 0.67, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 8, "description": "Progressive"}, "main_set": {"duration": 30, "description": "Interval work"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 5 Build 1: Adding intensity with intervals.', 'Intervals build threshold for Olympic racing. Mix of distances.', ARRAY['Develop threshold pace', 'Build speed endurance', 'Add intensity']),

('a3333333-3333-3333-3333-333333333333', 5, 2, 'bike', 'tempo', 75, 16, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 15, "description": "Progressive"}, "main_set": {"duration": 55, "description": "Tempo intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 5: Tempo bike building sustainable power for 40K.', 'Tempo work is key for Olympic bike. Practice sustained efforts.', ARRAY['Build sustained power', 'Develop tempo fitness', 'Race preparation']),

('a3333333-3333-3333-3333-333333333333', 5, 3, 'run', 'tempo', 43, 4.0, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 10, "description": "Easy with strides"}, "main_set": {"duration": 28, "description": "Tempo running"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 5: Tempo run developing threshold for 10K.', 'Tempo running builds your ability to sustain 10K pace.', ARRAY['Develop running threshold', 'Build tempo endurance', 'Race pace work']),

('a3333333-3333-3333-3333-333333333333', 5, 4, 'swim', 'base', 40, 0.68, 'Zone 2 - Aerobic', '{"warmup": {"duration": 8, "description": "Easy"}, "main_set": {"duration": 27, "description": "Continuous swim"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 5: Aerobic swim day. Building toward 1.5K distance.', 'Continuous swimming builds endurance. Aim for smooth, efficient strokes.', ARRAY['Build swimming endurance', 'Develop efficiency', 'Distance progression']),

('a3333333-3333-3333-3333-333333333333', 5, 5, 'brick', 'brick', 85, 15, 'Zone 2 - Aerobic', '{"bike": {"duration": 60, "description": "Steady aerobic"}, "transition": {"duration": 5}, "run": {"duration": 20, "description": "Easy off bike"}}', 'Week 5: First brick workouts. Learning to run off the bike.', 'Brick workouts are essential for triathlon. Practice transitions.', ARRAY['Develop brick legs', 'Practice transitions', 'Build race-specific fitness']),

('a3333333-3333-3333-3333-333333333333', 5, 6, 'run', 'base', 48, 4.3, 'Zone 2 - Aerobic', '{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 38, "description": "Long steady run"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 5: Long run building toward 10K.', 'Weekly long run is key for Olympic distance. Build gradually.', ARRAY['Build running endurance', 'Increase distance', 'Develop aerobic capacity']),

('a3333333-3333-3333-3333-333333333333', 5, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 5 Build 1 complete. Intensity and volume increasing.', 'Monitor recovery. Are you getting enough sleep and calories?', ARRAY['Recover from build week', 'Assess recovery needs', 'Prepare for Week 6']),

('a3333333-3333-3333-3333-333333333333', 6, 1, 'swim', 'intervals', 46, 0.72, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 8, "description": "Progressive"}, "main_set": {"duration": 33, "description": "Interval work"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 6 Build 1: Adding intensity with intervals.', 'Intervals build threshold for Olympic racing. Mix of distances.', ARRAY['Develop threshold pace', 'Build speed endurance', 'Add intensity']),

('a3333333-3333-3333-3333-333333333333', 6, 2, 'bike', 'tempo', 80, 17, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 15, "description": "Progressive"}, "main_set": {"duration": 60, "description": "Tempo intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 6: Tempo bike building sustainable power for 40K.', 'Tempo work is key for Olympic bike. Practice sustained efforts.', ARRAY['Build sustained power', 'Develop tempo fitness', 'Race preparation']),

('a3333333-3333-3333-3333-333333333333', 6, 3, 'run', 'tempo', 46, 4.25, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 10, "description": "Easy with strides"}, "main_set": {"duration": 31, "description": "Tempo running"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 6: Tempo run developing threshold for 10K.', 'Tempo running builds your ability to sustain 10K pace.', ARRAY['Develop running threshold', 'Build tempo endurance', 'Race pace work']),

('a3333333-3333-3333-3333-333333333333', 6, 4, 'swim', 'base', 40, 0.68, 'Zone 2 - Aerobic', '{"warmup": {"duration": 8, "description": "Easy"}, "main_set": {"duration": 27, "description": "Continuous swim"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 6: Aerobic swim day. Building toward 1.5K distance.', 'Continuous swimming builds endurance. Aim for smooth, efficient strokes.', ARRAY['Build swimming endurance', 'Develop efficiency', 'Distance progression']),

('a3333333-3333-3333-3333-333333333333', 6, 5, 'brick', 'brick', 90, 16, 'Zone 2 - Aerobic', '{"bike": {"duration": 65, "description": "Steady aerobic"}, "transition": {"duration": 5}, "run": {"duration": 20, "description": "Easy off bike"}}', 'Week 6: First brick workouts. Learning to run off the bike.', 'Brick workouts are essential for triathlon. Practice transitions.', ARRAY['Develop brick legs', 'Practice transitions', 'Build race-specific fitness']),

('a3333333-3333-3333-3333-333333333333', 6, 6, 'run', 'base', 51, 4.6, 'Zone 2 - Aerobic', '{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 41, "description": "Long steady run"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 6: Long run building toward 10K.', 'Weekly long run is key for Olympic distance. Build gradually.', ARRAY['Build running endurance', 'Increase distance', 'Develop aerobic capacity']),

('a3333333-3333-3333-3333-333333333333', 6, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 6 Build 1 complete. Intensity and volume increasing.', 'Monitor recovery. Are you getting enough sleep and calories?', ARRAY['Recover from build week', 'Assess recovery needs', 'Prepare for Week 7']),

('a3333333-3333-3333-3333-333333333333', 7, 1, 'swim', 'intervals', 49, 0.77, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 8, "description": "Progressive"}, "main_set": {"duration": 36, "description": "Interval work"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 7 Build 1: Adding intensity with intervals.', 'Intervals build threshold for Olympic racing. Mix of distances.', ARRAY['Develop threshold pace', 'Build speed endurance', 'Add intensity']),

('a3333333-3333-3333-3333-333333333333', 7, 2, 'bike', 'tempo', 85, 18, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 15, "description": "Progressive"}, "main_set": {"duration": 65, "description": "Tempo intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 7: Tempo bike building sustainable power for 40K.', 'Tempo work is key for Olympic bike. Practice sustained efforts.', ARRAY['Build sustained power', 'Develop tempo fitness', 'Race preparation']),

('a3333333-3333-3333-3333-333333333333', 7, 3, 'run', 'tempo', 49, 4.5, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 10, "description": "Easy with strides"}, "main_set": {"duration": 34, "description": "Tempo running"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 7: Tempo run developing threshold for 10K.', 'Tempo running builds your ability to sustain 10K pace.', ARRAY['Develop running threshold', 'Build tempo endurance', 'Race pace work']),

('a3333333-3333-3333-3333-333333333333', 7, 4, 'swim', 'base', 40, 0.68, 'Zone 2 - Aerobic', '{"warmup": {"duration": 8, "description": "Easy"}, "main_set": {"duration": 27, "description": "Continuous swim"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 7: Aerobic swim day. Building toward 1.5K distance.', 'Continuous swimming builds endurance. Aim for smooth, efficient strokes.', ARRAY['Build swimming endurance', 'Develop efficiency', 'Distance progression']),

('a3333333-3333-3333-3333-333333333333', 7, 5, 'brick', 'brick', 95, 17, 'Zone 2 - Aerobic', '{"bike": {"duration": 70, "description": "Steady aerobic"}, "transition": {"duration": 5}, "run": {"duration": 20, "description": "Easy off bike"}}', 'Week 7: First brick workouts. Learning to run off the bike.', 'Brick workouts are essential for triathlon. Practice transitions.', ARRAY['Develop brick legs', 'Practice transitions', 'Build race-specific fitness']),

('a3333333-3333-3333-3333-333333333333', 7, 6, 'run', 'base', 54, 4.9, 'Zone 2 - Aerobic', '{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 44, "description": "Long steady run"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 7: Long run building toward 10K.', 'Weekly long run is key for Olympic distance. Build gradually.', ARRAY['Build running endurance', 'Increase distance', 'Develop aerobic capacity']),

('a3333333-3333-3333-3333-333333333333', 7, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 7 Build 1 complete. Intensity and volume increasing.', 'Monitor recovery. Are you getting enough sleep and calories?', ARRAY['Recover from build week', 'Assess recovery needs', 'Prepare for Week 8']),

('a3333333-3333-3333-3333-333333333333', 8, 1, 'swim', 'intervals', 52, 0.8200000000000001, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 8, "description": "Progressive"}, "main_set": {"duration": 39, "description": "Interval work"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 8 Build 1: Adding intensity with intervals.', 'Intervals build threshold for Olympic racing. Mix of distances.', ARRAY['Develop threshold pace', 'Build speed endurance', 'Add intensity']),

('a3333333-3333-3333-3333-333333333333', 8, 2, 'bike', 'tempo', 90, 19, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 15, "description": "Progressive"}, "main_set": {"duration": 70, "description": "Tempo intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 8: Tempo bike building sustainable power for 40K.', 'Tempo work is key for Olympic bike. Practice sustained efforts.', ARRAY['Build sustained power', 'Develop tempo fitness', 'Race preparation']),

('a3333333-3333-3333-3333-333333333333', 8, 3, 'run', 'tempo', 52, 4.75, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 10, "description": "Easy with strides"}, "main_set": {"duration": 37, "description": "Tempo running"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 8: Tempo run developing threshold for 10K.', 'Tempo running builds your ability to sustain 10K pace.', ARRAY['Develop running threshold', 'Build tempo endurance', 'Race pace work']),

('a3333333-3333-3333-3333-333333333333', 8, 4, 'swim', 'base', 40, 0.68, 'Zone 2 - Aerobic', '{"warmup": {"duration": 8, "description": "Easy"}, "main_set": {"duration": 27, "description": "Continuous swim"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 8: Aerobic swim day. Building toward 1.5K distance.', 'Continuous swimming builds endurance. Aim for smooth, efficient strokes.', ARRAY['Build swimming endurance', 'Develop efficiency', 'Distance progression']),

('a3333333-3333-3333-3333-333333333333', 8, 5, 'brick', 'brick', 100, 18, 'Zone 2 - Aerobic', '{"bike": {"duration": 75, "description": "Steady aerobic"}, "transition": {"duration": 5}, "run": {"duration": 20, "description": "Easy off bike"}}', 'Week 8: First brick workouts. Learning to run off the bike.', 'Brick workouts are essential for triathlon. Practice transitions.', ARRAY['Develop brick legs', 'Practice transitions', 'Build race-specific fitness']),

('a3333333-3333-3333-3333-333333333333', 8, 6, 'run', 'base', 57, 5.2, 'Zone 2 - Aerobic', '{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 47, "description": "Long steady run"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 8: Long run building toward 10K.', 'Weekly long run is key for Olympic distance. Build gradually.', ARRAY['Build running endurance', 'Increase distance', 'Develop aerobic capacity']),

('a3333333-3333-3333-3333-333333333333', 8, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 8 Build 1 complete. Intensity and volume increasing.', 'Monitor recovery. Are you getting enough sleep and calories?', ARRAY['Recover from build week', 'Assess recovery needs', 'Prepare for Week 9']),

('a3333333-3333-3333-3333-333333333333', 9, 1, 'swim', 'recovery', 30, 0.37, 'Zone 1-2 - Easy', '{"warmup": {"duration": 5, "description": "Easy"}, "main_set": {"duration": 20, "description": "Easy continuous"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 9 RECOVERY: Reduced volume to absorb training adaptations.', 'Recovery weeks are crucial for long-term progress. Dont skip!', ARRAY['Facilitate adaptation', 'Active recovery', 'Prepare for Build 2']),

('a3333333-3333-3333-3333-333333333333', 9, 2, 'bike', 'recovery', 50, 10, 'Zone 1-2 - Easy', '{"warmup": {"duration": 5, "description": "Easy"}, "main_set": {"duration": 40, "description": "Easy spinning"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Recovery bike. Easy spinning, low stress.', 'Keep very easy. Small chainring, promote blood flow.', ARRAY['Active recovery', 'Maintain movement', 'Flush legs']),

('a3333333-3333-3333-3333-333333333333', 9, 3, 'run', 'recovery', 30, 2.5, 'Zone 1-2 - Easy', '{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 20, "description": "Very easy"}, "cooldown": {"duration": 5, "description": "Walk"}}', 'Recovery run. Keep effort very light.', 'Walk breaks encouraged. Just moving the legs.', ARRAY['Active recovery', 'Maintain running rhythm', 'Low stress']),

('a3333333-3333-3333-3333-333333333333', 9, 4, 'swim', 'technique', 30, 0.37, 'Zone 1-2 - Easy', '{"warmup": {"duration": 5, "description": "Easy"}, "main_set": {"duration": 20, "description": "All drills"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Recovery swim with technique focus.', 'Perfect time to refine stroke without fatigue.', ARRAY['Develop technique', 'Active recovery', 'Skill development']),

('a3333333-3333-3333-3333-333333333333', 9, 5, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Extra rest during recovery week.', 'Mid-week rest for maximum recovery.', ARRAY['Maximize adaptation', 'Complete recovery', 'Mental break']),

('a3333333-3333-3333-3333-333333333333', 9, 6, 'bike', 'recovery', 50, 10, 'Zone 1-2 - Easy', '{"warmup": {"duration": 5, "description": "Easy"}, "main_set": {"duration": 40, "description": "Fun easy ride"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Easy fun ride. No structure.', 'Make this enjoyable. Explore, relax, stay easy.', ARRAY['Enjoy cycling', 'Mental refresh', 'Active recovery']),

('a3333333-3333-3333-3333-333333333333', 9, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Recovery week complete. Should feel refreshed for Build 2.', 'Halfway through plan! You should feel energized.', ARRAY['Complete recovery', 'Assessment', 'Prepare for Build 2']),

('a3333333-3333-3333-3333-333333333333', 10, 1, 'swim', 'intervals', 47, 0.81, 'Zone 3 - Tempo/Threshold', '{"warmup": {"duration": 10, "description": "Progressive"}, "main_set": {"duration": 32, "description": "Mixed intervals approaching race pace"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 10 Build 2: Approaching 1.5K swim distance with intervals.', 'Building toward full Olympic swim distance. Mix pace work.', ARRAY['Approach race distance', 'Develop race pace', 'Build confidence']),

('a3333333-3333-3333-3333-333333333333', 10, 2, 'bike', 'tempo', 85, 19, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 15, "description": "Progressive"}, "main_set": {"duration": 65, "description": "Long tempo intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 10: Long bike approaching 40K distance.', 'Building sustained power for Olympic bike leg. Practice nutrition.', ARRAY['Build toward 40K', 'Develop sustained power', 'Practice race nutrition']),

('a3333333-3333-3333-3333-333333333333', 10, 3, 'run', 'intervals', 47, 4.8, 'Zone 2-4 - Aerobic to Threshold', '{"warmup": {"duration": 10, "description": "Easy with strides"}, "main_set": {"duration": 32, "description": "Intervals at 10K pace or faster"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 10: Speed work for 10K race pace.', 'Intervals build speed for Olympic 10K. Focus on form.', ARRAY['Develop running speed', 'Build 10K pace', 'Improve fitness']),

('a3333333-3333-3333-3333-333333333333', 10, 4, 'swim', 'base', 45, 0.81, 'Zone 2 - Aerobic', '{"warmup": {"duration": 10, "description": "Easy with drills"}, "main_set": {"duration": 30, "description": "Long continuous swim"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 10: Continuous swim approaching 1.5K.', 'Building continuous distance. Smooth, efficient swimming.', ARRAY['Build toward 1.5K', 'Develop endurance', 'Practice efficiency']),

('a3333333-3333-3333-3333-333333333333', 10, 5, 'brick', 'brick', 100, 18, 'Zone 2-3 - Aerobic/Tempo', '{"bike": {"duration": 75, "description": "Progressive to tempo"}, "transition": {"duration": 5}, "run": {"duration": 20, "description": "Tempo off bike"}}', 'Week 10: Long brick approaching race distances.', 'Key race simulation. Practice pacing and transitions.', ARRAY['Simulate race conditions', 'Practice race pacing', 'Build brick fitness']),

('a3333333-3333-3333-3333-333333333333', 10, 6, 'run', 'base', 60, 5.5, 'Zone 2 - Aerobic', '{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 50, "description": "Long steady run"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 10: Long run building toward 10K and beyond.', 'This is your key endurance builder. Stay comfortable.', ARRAY['Build toward 10K', 'Develop running endurance', 'Increase distance']),

('a3333333-3333-3333-3333-333333333333', 10, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 10 Build 2 complete. Approaching Olympic distances.', 'Volume is high. Prioritize recovery and nutrition.', ARRAY['Recover from big week', 'Monitor fatigue', 'Prepare for Week 11']),

('a3333333-3333-3333-3333-333333333333', 11, 1, 'swim', 'intervals', 49, 0.87, 'Zone 3 - Tempo/Threshold', '{"warmup": {"duration": 10, "description": "Progressive"}, "main_set": {"duration": 34, "description": "Mixed intervals approaching race pace"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 11 Build 2: Approaching 1.5K swim distance with intervals.', 'Building toward full Olympic swim distance. Mix pace work.', ARRAY['Approach race distance', 'Develop race pace', 'Build confidence']),

('a3333333-3333-3333-3333-333333333333', 11, 2, 'bike', 'tempo', 90, 20, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 15, "description": "Progressive"}, "main_set": {"duration": 70, "description": "Long tempo intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 11: Long bike approaching 40K distance.', 'Building sustained power for Olympic bike leg. Practice nutrition.', ARRAY['Build toward 40K', 'Develop sustained power', 'Practice race nutrition']),

('a3333333-3333-3333-3333-333333333333', 11, 3, 'run', 'intervals', 49, 5.1, 'Zone 2-4 - Aerobic to Threshold', '{"warmup": {"duration": 10, "description": "Easy with strides"}, "main_set": {"duration": 34, "description": "Intervals at 10K pace or faster"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 11: Speed work for 10K race pace.', 'Intervals build speed for Olympic 10K. Focus on form.', ARRAY['Develop running speed', 'Build 10K pace', 'Improve fitness']),

('a3333333-3333-3333-3333-333333333333', 11, 4, 'swim', 'base', 45, 0.87, 'Zone 2 - Aerobic', '{"warmup": {"duration": 10, "description": "Easy with drills"}, "main_set": {"duration": 30, "description": "Long continuous swim"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 11: Continuous swim approaching 1.5K.', 'Building continuous distance. Smooth, efficient swimming.', ARRAY['Build toward 1.5K', 'Develop endurance', 'Practice efficiency']),

('a3333333-3333-3333-3333-333333333333', 11, 5, 'brick', 'brick', 105, 19, 'Zone 2-3 - Aerobic/Tempo', '{"bike": {"duration": 80, "description": "Progressive to tempo"}, "transition": {"duration": 5}, "run": {"duration": 20, "description": "Tempo off bike"}}', 'Week 11: Long brick approaching race distances.', 'Key race simulation. Practice pacing and transitions.', ARRAY['Simulate race conditions', 'Practice race pacing', 'Build brick fitness']),

('a3333333-3333-3333-3333-333333333333', 11, 6, 'run', 'base', 65, 6.0, 'Zone 2 - Aerobic', '{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 55, "description": "Long steady run"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 11: Long run building toward 10K and beyond.', 'This is your key endurance builder. Stay comfortable.', ARRAY['Build toward 10K', 'Develop running endurance', 'Increase distance']),

('a3333333-3333-3333-3333-333333333333', 11, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 11 Build 2 complete. Approaching Olympic distances.', 'Volume is high. Prioritize recovery and nutrition.', ARRAY['Recover from big week', 'Monitor fatigue', 'Prepare for Week 12']),

('a3333333-3333-3333-3333-333333333333', 12, 1, 'swim', 'intervals', 51, 0.9299999999999999, 'Zone 3 - Tempo/Threshold', '{"warmup": {"duration": 10, "description": "Progressive"}, "main_set": {"duration": 36, "description": "Mixed intervals approaching race pace"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 12 Build 2: Approaching 1.5K swim distance with intervals.', 'Building toward full Olympic swim distance. Mix pace work.', ARRAY['Approach race distance', 'Develop race pace', 'Build confidence']),

('a3333333-3333-3333-3333-333333333333', 12, 2, 'bike', 'tempo', 95, 21, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 15, "description": "Progressive"}, "main_set": {"duration": 75, "description": "Long tempo intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 12: Long bike approaching 40K distance.', 'Building sustained power for Olympic bike leg. Practice nutrition.', ARRAY['Build toward 40K', 'Develop sustained power', 'Practice race nutrition']),

('a3333333-3333-3333-3333-333333333333', 12, 3, 'run', 'intervals', 51, 5.4, 'Zone 2-4 - Aerobic to Threshold', '{"warmup": {"duration": 10, "description": "Easy with strides"}, "main_set": {"duration": 36, "description": "Intervals at 10K pace or faster"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 12: Speed work for 10K race pace.', 'Intervals build speed for Olympic 10K. Focus on form.', ARRAY['Develop running speed', 'Build 10K pace', 'Improve fitness']),

('a3333333-3333-3333-3333-333333333333', 12, 4, 'swim', 'base', 45, 0.9299999999999999, 'Zone 2 - Aerobic', '{"warmup": {"duration": 10, "description": "Easy with drills"}, "main_set": {"duration": 30, "description": "Long continuous swim"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 12: Continuous swim approaching 1.5K.', 'Building continuous distance. Smooth, efficient swimming.', ARRAY['Build toward 1.5K', 'Develop endurance', 'Practice efficiency']),

('a3333333-3333-3333-3333-333333333333', 12, 5, 'brick', 'brick', 110, 20, 'Zone 2-3 - Aerobic/Tempo', '{"bike": {"duration": 85, "description": "Progressive to tempo"}, "transition": {"duration": 5}, "run": {"duration": 20, "description": "Tempo off bike"}}', 'Week 12: Long brick approaching race distances.', 'Key race simulation. Practice pacing and transitions.', ARRAY['Simulate race conditions', 'Practice race pacing', 'Build brick fitness']),

('a3333333-3333-3333-3333-333333333333', 12, 6, 'run', 'base', 70, 6.5, 'Zone 2 - Aerobic', '{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 60, "description": "Long steady run"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 12: Long run building toward 10K and beyond.', 'This is your key endurance builder. Stay comfortable.', ARRAY['Build toward 10K', 'Develop running endurance', 'Increase distance']),

('a3333333-3333-3333-3333-333333333333', 12, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 12 Build 2 complete. Approaching Olympic distances.', 'Volume is high. Prioritize recovery and nutrition.', ARRAY['Recover from big week', 'Monitor fatigue', 'Prepare for Week 13']),

('a3333333-3333-3333-3333-333333333333', 13, 1, 'swim', 'intervals', 53, 0.99, 'Zone 3 - Tempo/Threshold', '{"warmup": {"duration": 10, "description": "Progressive"}, "main_set": {"duration": 38, "description": "Mixed intervals approaching race pace"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 13 Build 2: Approaching 1.5K swim distance with intervals.', 'Building toward full Olympic swim distance. Mix pace work.', ARRAY['Approach race distance', 'Develop race pace', 'Build confidence']),

('a3333333-3333-3333-3333-333333333333', 13, 2, 'bike', 'tempo', 100, 22, 'Zone 2-3 - Aerobic/Tempo', '{"warmup": {"duration": 15, "description": "Progressive"}, "main_set": {"duration": 80, "description": "Long tempo intervals"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 13: Long bike approaching 40K distance.', 'Building sustained power for Olympic bike leg. Practice nutrition.', ARRAY['Build toward 40K', 'Develop sustained power', 'Practice race nutrition']),

('a3333333-3333-3333-3333-333333333333', 13, 3, 'run', 'intervals', 53, 5.7, 'Zone 2-4 - Aerobic to Threshold', '{"warmup": {"duration": 10, "description": "Easy with strides"}, "main_set": {"duration": 38, "description": "Intervals at 10K pace or faster"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 13: Speed work for 10K race pace.', 'Intervals build speed for Olympic 10K. Focus on form.', ARRAY['Develop running speed', 'Build 10K pace', 'Improve fitness']),

('a3333333-3333-3333-3333-333333333333', 13, 4, 'swim', 'base', 45, 0.99, 'Zone 2 - Aerobic', '{"warmup": {"duration": 10, "description": "Easy with drills"}, "main_set": {"duration": 30, "description": "Long continuous swim"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 13: Continuous swim approaching 1.5K.', 'Building continuous distance. Smooth, efficient swimming.', ARRAY['Build toward 1.5K', 'Develop endurance', 'Practice efficiency']),

('a3333333-3333-3333-3333-333333333333', 13, 5, 'brick', 'brick', 115, 21, 'Zone 2-3 - Aerobic/Tempo', '{"bike": {"duration": 90, "description": "Progressive to tempo"}, "transition": {"duration": 5}, "run": {"duration": 20, "description": "Tempo off bike"}}', 'Week 13: Long brick approaching race distances.', 'Key race simulation. Practice pacing and transitions.', ARRAY['Simulate race conditions', 'Practice race pacing', 'Build brick fitness']),

('a3333333-3333-3333-3333-333333333333', 13, 6, 'run', 'base', 75, 7.0, 'Zone 2 - Aerobic', '{"warmup": {"duration": 5, "description": "Easy jog"}, "main_set": {"duration": 65, "description": "Long steady run"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 13: Long run building toward 10K and beyond.', 'This is your key endurance builder. Stay comfortable.', ARRAY['Build toward 10K', 'Develop running endurance', 'Increase distance']),

('a3333333-3333-3333-3333-333333333333', 13, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 13 Build 2 complete. Approaching Olympic distances.', 'Volume is high. Prioritize recovery and nutrition.', ARRAY['Recover from big week', 'Monitor fatigue', 'Prepare for Week 14']),

('a3333333-3333-3333-3333-333333333333', 14, 1, 'swim', 'race_pace', 50, 0.93, 'Zone 3 - Race Pace', '{"warmup": {"duration": 10, "description": "Progressive"}, "main_set": {"duration": 35, "description": "Race pace and beyond"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 14 PEAK: Swimming at or above 1.5K distance at race pace!', 'This is it - full Olympic swim distance at race pace. Confidence builder.', ARRAY['Exceed race distance', 'Lock in race pace', 'Build confidence']),

('a3333333-3333-3333-3333-333333333333', 14, 2, 'bike', 'race_pace', 95, 23, 'Zone 3 - Race Pace', '{"warmup": {"duration": 15, "description": "Progressive"}, "main_set": {"duration": 75, "description": "Race pace for 40K+"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 14: Full 40K+ bike at race pace.', 'Complete Olympic bike distance at race effort. Practice everything.', ARRAY['Full race distance', 'Practice race pace', 'Build confidence']),

('a3333333-3333-3333-3333-333333333333', 14, 3, 'run', 'race_pace', 60, 6.5, 'Zone 3 - Race Pace', '{"warmup": {"duration": 10, "description": "Easy with strides"}, "main_set": {"duration": 45, "description": "10K race pace"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 14: 10K+ at race pace!', 'Beyond race distance at race pace. Massive confidence builder.', ARRAY['Exceed 10K at race pace', 'Lock in pacing', 'Build confidence']),

('a3333333-3333-3333-3333-333333333333', 14, 4, 'swim', 'recovery', 35, 0.5, 'Zone 1-2 - Easy', '{"warmup": {"duration": 5, "description": "Easy"}, "main_set": {"duration": 25, "description": "Easy continuous"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 14: Recovery swim after peak work.', 'Easy swimming to recover. Maintain feel.', ARRAY['Active recovery', 'Maintain swimming feel', 'Prepare for weekend']),

('a3333333-3333-3333-3333-333333333333', 14, 5, 'bike', 'recovery', 50, 10, 'Zone 1-2 - Easy', '{"warmup": {"duration": 5, "description": "Easy"}, "main_set": {"duration": 40, "description": "Easy spinning"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 14: Easy recovery ride.', 'Very easy spinning. Promoting recovery.', ARRAY['Active recovery', 'Flush legs', 'Low stress']),

('a3333333-3333-3333-3333-333333333333', 14, 6, 'brick', 'race_simulation', 115, 25, 'Zone 3 - Race Pace', '{"bike": {"duration": 90, "description": "Full 40K at race pace"}, "transition": {"duration": 5}, "run": {"duration": 20, "description": "Off bike at race pace"}}', 'Week 14: FULL OLYMPIC RACE SIMULATION!', 'Complete dress rehearsal. Execute your full race plan. This is it!', ARRAY['Full race simulation', 'Execute complete race plan', 'Build unshakeable confidence']),

('a3333333-3333-3333-3333-333333333333', 14, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 14 Peak complete. Youve done full Olympic distance!', 'Massive accomplishment. Youre ready. Now we taper.', ARRAY['Recover from peak', 'Mental preparation', 'Begin taper']),

('a3333333-3333-3333-3333-333333333333', 15, 1, 'swim', 'race_pace', 50, 0.93, 'Zone 3 - Race Pace', '{"warmup": {"duration": 10, "description": "Progressive"}, "main_set": {"duration": 35, "description": "Race pace and beyond"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 15 PEAK: Swimming at or above 1.5K distance at race pace!', 'This is it - full Olympic swim distance at race pace. Confidence builder.', ARRAY['Exceed race distance', 'Lock in race pace', 'Build confidence']),

('a3333333-3333-3333-3333-333333333333', 15, 2, 'bike', 'race_pace', 100, 24, 'Zone 3 - Race Pace', '{"warmup": {"duration": 15, "description": "Progressive"}, "main_set": {"duration": 80, "description": "Race pace for 40K+"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 15: Full 40K+ bike at race pace.', 'Complete Olympic bike distance at race effort. Practice everything.', ARRAY['Full race distance', 'Practice race pace', 'Build confidence']),

('a3333333-3333-3333-3333-333333333333', 15, 3, 'run', 'race_pace', 65, 7.0, 'Zone 3 - Race Pace', '{"warmup": {"duration": 10, "description": "Easy with strides"}, "main_set": {"duration": 50, "description": "10K race pace"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 15: 10K+ at race pace!', 'Beyond race distance at race pace. Massive confidence builder.', ARRAY['Exceed 10K at race pace', 'Lock in pacing', 'Build confidence']),

('a3333333-3333-3333-3333-333333333333', 15, 4, 'swim', 'recovery', 35, 0.5, 'Zone 1-2 - Easy', '{"warmup": {"duration": 5, "description": "Easy"}, "main_set": {"duration": 25, "description": "Easy continuous"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 15: Recovery swim after peak work.', 'Easy swimming to recover. Maintain feel.', ARRAY['Active recovery', 'Maintain swimming feel', 'Prepare for weekend']),

('a3333333-3333-3333-3333-333333333333', 15, 5, 'bike', 'recovery', 50, 10, 'Zone 1-2 - Easy', '{"warmup": {"duration": 5, "description": "Easy"}, "main_set": {"duration": 40, "description": "Easy spinning"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Week 15: Easy recovery ride.', 'Very easy spinning. Promoting recovery.', ARRAY['Active recovery', 'Flush legs', 'Low stress']),

('a3333333-3333-3333-3333-333333333333', 15, 6, 'brick', 'race_simulation', 120, 26, 'Zone 3 - Race Pace', '{"bike": {"duration": 95, "description": "Full 40K at race pace"}, "transition": {"duration": 5}, "run": {"duration": 20, "description": "Off bike at race pace"}}', 'Week 15: FULL OLYMPIC RACE SIMULATION!', 'Complete dress rehearsal. Execute your full race plan. This is it!', ARRAY['Full race simulation', 'Execute complete race plan', 'Build unshakeable confidence']),

('a3333333-3333-3333-3333-333333333333', 15, 7, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest day"}', 'Week 15 Peak complete. Youve done full Olympic distance!', 'Massive accomplishment. Youre ready. Now we taper.', ARRAY['Recover from peak', 'Mental preparation', 'Begin taper']),

('a3333333-3333-3333-3333-333333333333', 16, 1, 'swim', 'race_prep', 30, 0.37, 'Zone 2 with race pace', '{"warmup": {"duration": 10, "description": "Easy with drills"}, "main_set": {"duration": 15, "description": "6x100m - first 3 easy, last 3 race pace"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'RACE WEEK! Cut volume dramatically. Maintain sharpness with race-pace 100s.', 'Sixteen weeks of training complete. Trust your preparation.', ARRAY['Begin taper', 'Maintain sharpness', 'Feel race pace']),

('a3333333-3333-3333-3333-333333333333', 16, 2, 'bike', 'race_prep', 40, 8, 'Zone 2 with race pace', '{"warmup": {"duration": 15, "description": "Easy progressive"}, "main_set": {"duration": 20, "description": "3x4min race pace with 3min easy"}, "cooldown": {"duration": 5, "description": "Easy"}}', 'Short bike with race-pace efforts. Keep legs fresh.', 'Low volume, quality efforts. Legs should feel snappy.', ARRAY['Maintain leg speed', 'Feel race pace', 'Stay fresh']),

('a3333333-3333-3333-3333-333333333333', 16, 3, 'run', 'race_prep', 30, 2.5, 'Zone 2 with pickups', '{"warmup": {"duration": 12, "description": "Easy jog"}, "main_set": {"duration": 15, "description": "5x2min race pace with 2min easy"}, "cooldown": {"duration": 3, "description": "Easy"}}', 'Easy run with race-pace pickups. Feel your leg speed.', 'Short run, sharp efforts. Reminds body of race intensity.', ARRAY['Maintain sharpness', 'Practice race pace', 'Feel fresh']),

('a3333333-3333-3333-3333-333333333333', 16, 4, 'swim', 'race_prep', 25, 0.31, 'Zone 1-2 - Easy', '{"warmup": {"duration": 5, "description": "Very easy"}, "main_set": {"duration": 15, "description": "Easy continuous with drills"}, "cooldown": {"duration": 5, "description": "Easy backstroke"}}', 'Minimal swimming. Just maintaining feel for water.', 'Very easy. Body awareness and staying loose.', ARRAY['Maintain feel', 'Stay loose', 'Conserve energy']),

('a3333333-3333-3333-3333-333333333333', 16, 5, 'rest', 'recovery', NULL, NULL, 'Full rest', '{"description": "Complete rest - 2 days before race"}', 'Complete rest two days before Olympic race. Hydrate, eat well, mental prep.', 'Two days out from Olympic distance. Rest completely. Youre ready.', ARRAY['Complete rest', 'Mental preparation', 'Final equipment check']),

('a3333333-3333-3333-3333-333333333333', 16, 6, 'swim', 'race_prep', 20, 0.19, 'Zone 1-2 with fast 50s', '{"warmup": {"duration": 8, "description": "Easy"}, "main_set": {"duration": 10, "description": "4x50m fast with 45s rest"}, "cooldown": {"duration": 2, "description": "Easy"}}', 'Day before race: super short swim with fast 50s. Feel speed. Check wetsuit.', 'Pre-race shakeout. Very short, feel snappy. Practice race morning routine.', ARRAY['Feel race speed', 'Equipment check', 'Stay loose']),

('a3333333-3333-3333-3333-333333333333', 16, 7, 'rest', 'race_day', NULL, NULL, 'OLYMPIC RACE DAY!', '{"description": "OLYMPIC RACE DAY - Execute your plan for 1.5K swim, 40K bike, 10K run!"}', 'OLYMPIC RACE DAY! Sixteen weeks of training complete. Youre ready for 1.5K/40K/10K. Trust your training, execute your race plan, embrace the challenge!', 'This is why you trained for 16 weeks! Stay calm, pace yourself, trust your fitness. Olympic distance is a true test - youre ready. Go make it happen!', ARRAY['Execute Olympic race plan', 'Trust 16 weeks of training', 'Pace for longer distance', 'Finish strong!']);

-- =====================================================
-- SEED DATA SUMMARY
-- =====================================================
-- Template 1: Sprint Distance - Beginner (12 weeks)
--   - 84 workouts total (12 weeks x 7 days)
--   - Phases: Base (4 weeks), Build (4 weeks), Peak (3 weeks), Taper (1 week)
--   - Weekly hours: 6-8
--   - Progressive volume: 30min swims → 40min, 45min bikes → 65min, 30min runs → 45min

-- Template 2: Sprint Distance - Intermediate (12 weeks)
--   - 84 workouts total (12 weeks x 7 days)
--   - Higher intensity from Week 1
--   - Weekly hours: 8-10
--   - More interval work, tempo sessions, advanced brick workouts

-- Template 3: Olympic Distance - Beginner (16 weeks)
--   - 112 workouts total (16 weeks x 7 days)
--   - Extended build period for Olympic distance (1.5K/40K/10K)
--   - Weekly hours: 8-10
--   - Gradual progression from sprint to Olympic distances
--   - Recovery weeks built in (Week 9)

-- Total Workouts Seeded: 280 (84 + 84 + 112)
-- All workouts include:
--   - Detailed structure (warmup/main_set/cooldown)
--   - Comprehensive descriptions
--   - Coaching notes for proper execution
--   - Training goals for each session
--   - Progressive periodization following 80/20 training principles

-- =====================================================
-- END OF SEED DATA
-- =====================================================
