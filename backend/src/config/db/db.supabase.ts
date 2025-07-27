import { createClient } from '@supabase/supabase-js'
import {supabaseUrl,supabaseKey} from '../envVariables.config'


// Create a single supabase client for interacting with your database
export const supabaseClientConnection = createClient(supabaseUrl, supabaseKey)
