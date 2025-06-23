import React from "react";

interface ProjectSelectorProps {
  selectedProject: string;
  onProjectChange: (project: string) => void;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  selectedProject,
  onProjectChange,
}) => {
  const projects = [
    "General",
    "Development",
    "Design",
    "Meeting",
    "Research",
    "Other",
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Project
      </label>
      <select
        value={selectedProject}
        onChange={(e) => onProjectChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {projects.map((project) => (
          <option key={project} value={project}>
            {project}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProjectSelector;
