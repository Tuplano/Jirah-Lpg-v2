import { createClient } from '@/utils/supabase/server'

export default async function TestDbPage() {
  const supabase = await createClient()
  
  // Try to fetch something - any response (even a "table not found" error) 
  // means the connection to the Supabase server is successful.
  const { error } = await supabase.from('_non_existent_table_test_').select('*').limit(1)

  // If we get an error like "connection refused" or "invalid api key", it's a real failure.
  // If we get "table not found", the connection itself is actually WORKING.
  const isConnected = error?.message?.includes('table') || error?.message?.includes('relation') || !error

  return (
    <div className="p-8 space-y-6 max-w-2xl mx-auto font-sans">
      <h1 className="text-3xl font-bold text-slate-800">Supabase Connection Status</h1>
      
      {isConnected ? (
        <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xl">
              ✓
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-900">Successfully Connected!</h2>
              <p className="text-emerald-700 text-sm">
                Your app is successfully talking to the Supabase server.
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-3 bg-white/50 rounded-lg border border-emerald-100 text-xs text-emerald-800">
            <strong>Technical Note:</strong> Connection was verified by receiving a response from 
            <code> {process.env.NEXT_PUBLIC_SUPABASE_URL}</code>.
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-rose-50 border-2 border-rose-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white text-xl">
              ✕
            </div>
            <div>
              <h2 className="text-xl font-bold text-rose-900">Connection Failed</h2>
              <p className="text-rose-700 text-sm">
                Check your .env.local file and make sure your server is running.
              </p>
            </div>
          </div>
          {error && (
            <pre className="mt-4 p-3 bg-rose-100/50 rounded-lg text-xs text-rose-900 overflow-auto">
              Error Profile: {error.message}
            </pre>
          )}
        </div>
      )}

      <div className="text-xs text-slate-400 text-center">
        Diagnosing: {new Date().toLocaleTimeString()}
      </div>
    </div>
  )
}
