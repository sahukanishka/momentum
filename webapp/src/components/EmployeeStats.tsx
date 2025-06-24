
import React from 'react';
import { Clock, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Employee {
  workTime: string;
  productiveTime: string;
  unproductiveTime: string;
  utilization: string;
}

interface EmployeeStatsProps {
  employee: Employee;
}

export function EmployeeStats({ employee }: EmployeeStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Work Time</p>
              <p className="text-2xl font-bold text-foreground">{employee.workTime}</p>
              <p className="text-xs text-muted-foreground mt-1">Total</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg dark:bg-gray-800">
              <Clock className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Productive Time</p>
              <p className="text-2xl font-bold text-green-600">{employee.productiveTime}</p>
              <p className="text-xs text-muted-foreground mt-1">Total</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Unproductive Time</p>
              <p className="text-2xl font-bold text-red-600">{employee.unproductiveTime}</p>
              <p className="text-xs text-muted-foreground mt-1">Total</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg dark:bg-red-900">
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Utilization</p>
              <p className="text-2xl font-bold text-blue-600">{employee.utilization}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900">
              <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
