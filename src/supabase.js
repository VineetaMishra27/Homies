import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
    'https://oebjfpdctezryztxgpbi.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lYmpmcGRjdGV6cnl6dHhncGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNjk5NDksImV4cCI6MjA5Mjc0NTk0OX0.rkodVtmvJCCm1hEpx3vIxI1JIdvJGHdTQ3Z6ODhOunw'
)