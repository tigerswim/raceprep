-- RacePrep Row Level Security Policies

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Race results policies
CREATE POLICY "Users can view own race results" ON race_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own race results" ON race_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own race results" ON race_results
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own race results" ON race_results
  FOR DELETE USING (auth.uid() = user_id);

-- Course reviews policies
CREATE POLICY "Users can view all course reviews" ON course_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own course reviews" ON course_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own course reviews" ON course_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own course reviews" ON course_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Nutrition plans policies
CREATE POLICY "Users can view own nutrition plans" ON nutrition_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition plans" ON nutrition_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition plans" ON nutrition_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition plans" ON nutrition_plans
  FOR DELETE USING (auth.uid() = user_id);

-- User equipment policies
CREATE POLICY "Users can view own equipment" ON user_equipment
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own equipment" ON user_equipment
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own equipment" ON user_equipment
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own equipment" ON user_equipment
  FOR DELETE USING (auth.uid() = user_id);

-- User goals policies
CREATE POLICY "Users can view own goals" ON user_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON user_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON user_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON user_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Packing lists policies
CREATE POLICY "Users can view own packing lists" ON packing_lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own packing lists" ON packing_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own packing lists" ON packing_lists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own packing lists" ON packing_lists
  FOR DELETE USING (auth.uid() = user_id);

-- Public read access for courses and races (no RLS needed as they're public data)
-- These tables don't have RLS enabled, so they're readable by all authenticated users