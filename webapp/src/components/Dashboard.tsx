
import { Users, FolderOpen, CheckSquare, Clock, TrendingUp, Activity } from 'lucide-react';

interface DashboardProps {
  userRole: 'admin' | 'employee';
}

export function Dashboard({ userRole }: DashboardProps) {
  const adminStats = [
    { label: 'Total Employees', value: '24', icon: Users, change: '+12%' },
    { label: 'Active Projects', value: '8', icon: FolderOpen, change: '+3%' },
    { label: 'Tasks Completed', value: '156', icon: CheckSquare, change: '+28%' },
    { label: 'Hours Tracked', value: '1,245', icon: Clock, change: '+15%' },
  ];

  const employeeStats = [
    { label: 'My Tasks', value: '12', icon: CheckSquare, change: '+2' },
    { label: 'Hours Today', value: '6.5', icon: Clock, change: '+1.5h' },
    { label: 'Projects', value: '3', icon: FolderOpen, change: '0' },
    { label: 'Productivity', value: '94%', icon: TrendingUp, change: '+5%' },
  ];

  const stats = userRole === 'admin' ? adminStats : employeeStats;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {userRole === 'admin' ? 'Admin Dashboard' : 'Employee Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {userRole === 'admin' 
              ? 'Monitor your organization and team performance' 
              : 'Track your daily progress and tasks'
            }
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-green-500" />
          <span className="text-sm text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm text-green-600 font-medium">{stat.change}</span>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts/Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {userRole === 'admin' ? 'Team Activity' : 'My Activity'}
          </h3>
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Activity Chart Placeholder</p>
          </div>
        </div>

        {/* Recent Items */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {userRole === 'admin' ? 'Recent Employee Activity' : 'Recent Tasks'}
          </h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {userRole === 'admin' 
                      ? `Employee ${item} completed task` 
                      : `Task ${item} completed`
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item} hour{item !== 1 ? 's' : ''} ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {userRole === 'admin' ? (
            <>
              <button className="btn-secondary p-4 h-auto flex flex-col items-center space-y-2">
                <Users className="h-6 w-6" />
                <span className="text-sm">Add Employee</span>
              </button>
              <button className="btn-secondary p-4 h-auto flex flex-col items-center space-y-2">
                <FolderOpen className="h-6 w-6" />
                <span className="text-sm">New Project</span>
              </button>
              <button className="btn-secondary p-4 h-auto flex flex-col items-center space-y-2">
                <CheckSquare className="h-6 w-6" />
                <span className="text-sm">Create Task</span>
              </button>
              <button className="btn-secondary p-4 h-auto flex flex-col items-center space-y-2">
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm">View Reports</span>
              </button>
            </>
          ) : (
            <>
              <button className="btn-secondary p-4 h-auto flex flex-col items-center space-y-2">
                <Clock className="h-6 w-6" />
                <span className="text-sm">Start Timer</span>
              </button>
              <button className="btn-secondary p-4 h-auto flex flex-col items-center space-y-2">
                <CheckSquare className="h-6 w-6" />
                <span className="text-sm">New Task</span>
              </button>
              <button className="btn-secondary p-4 h-auto flex flex-col items-center space-y-2">
                <Activity className="h-6 w-6" />
                <span className="text-sm">View Progress</span>
              </button>
              <button className="btn-secondary p-4 h-auto flex flex-col items-center space-y-2">
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm">My Reports</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
