
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function EmployeeActivityChart() {
  // Mock data for the activity timeline
  const timeSlots = [
    { time: '1h 30m', active: false },
    { time: '1h', active: true },
    { time: '30m', active: false },
    { time: '0', active: false }
  ];

  const activities = [
    { type: 'Active Time', color: 'bg-purple-500', icon: '●' },
    { type: 'Break Time', color: 'bg-blue-400', icon: '●' },
    { type: 'Manual Time', color: 'bg-yellow-500', icon: '●' },
    { type: 'Manual Time in Processing', color: 'bg-orange-400', icon: '◗' },
    { type: 'Idle Time', color: 'bg-gray-300', icon: '○' },
    { type: 'Scheduled Time', color: 'bg-gray-400', icon: '-- ' }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Activities</CardTitle>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Utilization</span>
            <span className="text-sm text-muted-foreground">Locations</span>
            <button className="text-sm text-blue-600 hover:underline">Export</button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timeline Chart */}
        <div className="relative">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            {timeSlots.map((slot, index) => (
              <span key={index}>{slot.time}</span>
            ))}
          </div>
          
          {/* Activity Bar */}
          <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-purple-500 rounded-b"></div>
            <div className="absolute bottom-1/2 left-0 w-full h-1/2 bg-gray-200 dark:bg-gray-700 pattern-diagonal"></div>
          </div>
          
          <div className="text-center mt-2">
            <span className="text-sm text-muted-foreground">Jun 20</span>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center space-x-2 text-xs">
              <span className={`w-3 h-3 rounded-full ${activity.color} flex items-center justify-center text-white text-xs`}>
                {activity.icon === '●' ? '●' : activity.icon === '◗' ? '◗' : '○'}
              </span>
              <span className="text-muted-foreground">{activity.type}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
