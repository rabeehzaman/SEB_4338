import { Building2, TrendingUp, Activity } from 'lucide-react'

export function DashboardHeader() {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl blur-sm opacity-75"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-slate-900">SEB 4338 Dashboard</h1>
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                  SEB Logistics
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-0.5 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5" />
                Financial and Transfer Analytics
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-slate-500">System Status</p>
              <p className="text-sm font-medium text-green-600 flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Operational
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Last Sync</p>
              <p className="text-sm font-medium text-slate-700">
                {new Date().toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}