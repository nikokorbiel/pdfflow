export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#030304] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-64 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-white/5 rounded-lg animate-pulse" />
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
            >
              <div className="h-4 w-24 bg-white/5 rounded animate-pulse mb-3" />
              <div className="h-8 w-16 bg-white/5 rounded animate-pulse mb-2" />
              <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Main content skeleton */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tools section */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="h-6 w-32 bg-white/5 rounded animate-pulse mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-white/5 rounded-xl animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="h-5 w-28 bg-white/5 rounded animate-pulse mb-4" />
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/5 rounded-lg animate-pulse" />
                    <div className="flex-1">
                      <div className="h-3 w-full bg-white/5 rounded animate-pulse mb-1" />
                      <div className="h-2 w-20 bg-white/5 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
