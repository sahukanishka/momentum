import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../contexts/AuthContext";
import { getTasks } from "../services/Api";

interface Task {
  id: string;
  name: string;
  description: string;
  code: string;
  project_id: string;
  is_active: boolean;
}

interface TaskListProps {
  selectedTaskId?: string;
  onTaskSelect?: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  selectedTaskId,
  onTaskSelect,
}) => {
  const { employeeId } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (employeeId) {
      loadTasks();
    }
  }, [employeeId]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const response = await getTasks(employeeId!);

      if (response.success && response.data?.tasks) {
        setTasks(response.data.tasks);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskSelect = (taskId: string) => {
    onTaskSelect?.(taskId);
    setIsOpen(false);
  };

  const selectedTask = tasks.find((task) => task.id === selectedTaskId);

  const renderDropdown = () => {
    if (!isOpen) return null;

    return createPortal(
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-25"
          style={{ zIndex: 9998 }}
          onClick={() => setIsOpen(false)}
        />

        {/* Dropdown */}
        <div
          className="fixed bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-auto"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            zIndex: 9999,
          }}
        >
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              No tasks available
            </div>
          ) : (
            <div className="py-1">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => handleTaskSelect(task.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors duration-150 ${
                    selectedTaskId === task.id ? "bg-purple-100" : ""
                  }`}
                >
                  <div className="font-medium text-gray-900">{task.name}</div>
                  <div className="text-sm text-gray-500">
                    {task.description}
                  </div>
                  <div className="text-xs text-purple-600 font-mono">
                    {task.code}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </>,
      document.body
    );
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Select Task
      </label>

      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
        >
          {selectedTask ? (
            <div>
              <div className="font-medium text-gray-900">
                {selectedTask.name}
              </div>
              <div className="text-sm text-gray-500">
                {selectedTask.description}
              </div>
              <div className="text-xs text-purple-600 font-mono">
                {selectedTask.code}
              </div>
            </div>
          ) : (
            <span className="text-gray-500">Select a task...</span>
          )}
          <span className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </button>

        {renderDropdown()}
      </div>
    </div>
  );
};

export default TaskList;
