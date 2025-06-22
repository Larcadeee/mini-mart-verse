
import { supabase } from "@/integrations/supabase/client";

export interface DatabaseStatus {
  connected: boolean;
  error?: string;
  latency?: number;
}

export const checkDatabaseConnection = async (): Promise<DatabaseStatus> => {
  const startTime = Date.now();
  
  try {
    console.log('Testing database connection...');
    
    // Simple health check query
    const { data, error } = await supabase
      .from('admin_users')
      .select('id')
      .limit(1);
    
    const latency = Date.now() - startTime;
    
    if (error) {
      console.error('Database connection error:', error);
      return {
        connected: false,
        error: error.message,
        latency
      };
    }
    
    console.log(`Database connection successful (${latency}ms)`);
    return {
      connected: true,
      latency
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    console.error('Database connection failed:', error);
    
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      latency
    };
  }
};

export const testTableAccess = async (tableName: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error(`Table access test failed for ${tableName}:`, error);
    return false;
  }
};
