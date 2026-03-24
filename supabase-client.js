import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://vgdqjigywfrahshpdpgt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnZHFqaWd5d2ZyYWhzaHBkcGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMzIzNjcsImV4cCI6MjA4OTYwODM2N30.aunphK3bmPPleatnIOaW4BdHra4bC6TvTZchuKsMeqI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.supabaseSubmitLeaderboard = async function({ username, gridSize, difficulty, seed, timeSeconds, moveCount, difficultyScore, cleanSolve }) {
    const score = Math.round((difficultyScore + 500) / timeSeconds * 10);
    try {
        const { error } = await supabase.from('leaderboard').insert({
            username,
            grid_size: gridSize,
            difficulty,
            seed,
            time_seconds: timeSeconds,
            move_count: moveCount,
            score,
            difficulty_score: difficultyScore ?? 0,
            clean_solve: cleanSolve ?? true
        });
        if (error) console.error('Supabase insert error:', error.message);
    } catch (e) {
        console.error('Supabase submit failed:', e);
    }
};

window.supabaseSubmitDailyResult = async function({ username, timeSeconds, moveCount }) {
    const score = Math.round(500 / timeSeconds * 10);
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    try {
        const { error } = await supabase.from('daily_results').insert({
            username,
            date: today,
            time_seconds: timeSeconds,
            move_count: moveCount,
            score
        });
        if (error) console.error('Supabase daily insert error:', error.message);
    } catch (e) {
        console.error('Supabase daily submit failed:', e);
    }
};

window.supabaseFetchDailyLeaderboard = async function(date, limit = 20) {
    try {
        const { data, error } = await supabase
            .from('daily_results')
            .select('username, time_seconds, move_count, score, created_at')
            .eq('date', date)
            .order('time_seconds', { ascending: true })
            .order('move_count', { ascending: true })
            .limit(limit);
        if (error) { console.error('Supabase daily fetch error:', error.message); return []; }
        return data ?? [];
    } catch (e) {
        console.error('Supabase daily fetch failed:', e);
        return [];
    }
};

window.supabaseFetchLeaderboard = async function(gridSize, difficulty, period = 'alltime', limit = 20) {
    try {
        let query = supabase
            .from('leaderboard')
            .select('username, time_seconds, move_count, score, created_at')
            .eq('grid_size', gridSize)
            .eq('difficulty', difficulty)
            .order('time_seconds', { ascending: true })
            .order('move_count', { ascending: true })
            .limit(limit);

        if (period !== 'alltime') {
            const now = new Date();
            let since;
            if (period === 'daily') {
                since = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            } else if (period === 'weekly') {
                since = new Date(now);
                since.setDate(now.getDate() - 7);
            } else if (period === 'monthly') {
                since = new Date(now.getFullYear(), now.getMonth(), 1);
            }
            if (since) query = query.gte('created_at', since.toISOString());
        }

        const { data, error } = await query;
        if (error) { console.error('Supabase fetch error:', error.message); return []; }
        return data ?? [];
    } catch (e) {
        console.error('Supabase fetch failed:', e);
        return [];
    }
};
