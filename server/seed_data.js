import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Supabase credentials not found in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const systemLogs = [
    { id: 1, timestamp: '2025-11-20 10:30:15', level: 'SUCCESS', message: 'User login successful: john.doe@example.com', source: 'AuthService' },
    { id: 2, timestamp: '2025-11-20 10:32:00', level: 'WARNING', message: 'High latency detected on Gemini API (450ms)', source: 'AIProvider' },
    { id: 3, timestamp: '2025-11-20 10:35:22', level: 'ERROR', message: 'Failed to process video: Format not supported', source: 'VideoService' },
    { id: 4, timestamp: '2025-11-20 10:36:05', level: 'INFO', message: 'New job posted: Senior React Developer', source: 'JobService' },
    { id: 5, timestamp: '2025-11-20 10:40:11', level: 'INFO', message: 'Candidate assessment started: ID #4421', source: 'AssessmentService' },
];

const interviews = [
    {
        id: 1,
        candidateName: "Sarah Johnson",
        role: "Senior Frontend Developer",
        date: "2024-03-20T10:00:00Z",
        time: "10:00 AM",
        type: "Video",
        status: "Scheduled",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
        participants: ["HR Alice", "HR Bob"],
        roundTag: "Round 1",
    },
    {
        id: 2,
        candidateName: "Michael Chen",
        role: "Full Stack Engineer",
        date: "2024-03-21T14:00:00Z",
        time: "2:00 PM",
        type: "Technical",
        status: "Scheduled",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
        participants: ["HR Carol"],
        roundTag: "Round 2",
    },
    {
        id: 3,
        candidateName: "Emily Davis",
        role: "UI/UX Designer",
        date: "2024-03-18T11:30:00Z",
        time: "11:30 AM",
        type: "HR",
        status: "Completed",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
        participants: ["HR Dave"],
        roundTag: "Final",
    },
];

async function seedData() {
    console.log('Starting data seed...');

    // Seed System Logs
    console.log('Seeding system_logs...');
    const { error: logsError } = await supabase
        .from('system_logs')
        .upsert(systemLogs, { onConflict: 'id' });

    if (logsError) {
        console.error('Error seeding system_logs:', logsError.message);
    } else {
        console.log('Successfully seeded system_logs!');
    }

    // Seed Interviews
    console.log('Seeding interviews...');
    const { error: interviewsError } = await supabase
        .from('interviews')
        .upsert(interviews, { onConflict: 'id' });

    if (interviewsError) {
        console.error('Error seeding interviews:', interviewsError.message);
    } else {
        console.log('Successfully seeded interviews!');
    }
}

seedData();
