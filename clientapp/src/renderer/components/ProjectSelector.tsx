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
      <label className="block text-sm font-medium text-black mb-3">
        Project
      </label>
      <select
        value={selectedProject}
        onChange={(e) => onProjectChange(e.target.value)}
        className="w-full px-4 text-black py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
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
