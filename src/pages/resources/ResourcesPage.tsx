import { useState } from "react";
import { useResources } from "../../hooks/useResources";
import { BookOpen, Link, Plus, Trash2, CheckCircle, Circle } from "lucide-react";

export default function ResourcesPage() {
  const {
    resources,
    recommendedResources,
    isLoading,
    addResource,
    updateResource,
    deleteResource,
    updateProgress,
    addDefaultResource,
  } = useResources();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newResource, setNewResource] = useState({
    name: "",
    type: "book" as "book" | "playlist" | "pdf" | "course" | "pyq_bank" | "mock_series",
    subject: "",
    total_chapters: 10,
    url: "",
    notes: "",
  });

  const handleAddResource = () => {
    if (!newResource.name.trim()) return;
    addResource({
      ...newResource,
      completed_chapters: 0,
      status: "not_started",
      is_default: false,
    });
    setShowAddForm(false);
    setNewResource({
      name: "",
      type: "book",
      subject: "",
      total_chapters: 10,
      url: "",
      notes: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-900/30 border-emerald-800 text-emerald-300";
      case "in_progress":
        return "bg-amber-900/30 border-amber-800 text-amber-300";
      default:
        return "bg-slate-800 border-slate-700 text-slate-400";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "book":
        return "📚";
      case "playlist":
        return "📺";
      case "pdf":
        return "📄";
      case "course":
        return "🎓";
      case "pyq_bank":
        return "📝";
      case "mock_series":
        return "📊";
      default:
        return "📌";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
          <span className="text-slate-400 text-sm">Loading resources...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Resource Tracker</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track books, playlists, PDFs, and courses
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus size={14} />
          Add Resource
        </button>
      </div>

      {/* Add Resource Form */}
      {showAddForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <input
            type="text"
            placeholder="Resource name (e.g., Lucent GK, Rakesh Yadav Arithmetic)"
            value={newResource.name}
            onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={newResource.type}
              onChange={(e) =>
                setNewResource({ ...newResource, type: e.target.value as any })
              }
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-slate-600"
            >
              <option value="book">Book</option>
              <option value="playlist">YouTube Playlist</option>
              <option value="pdf">PDF</option>
              <option value="course">Course</option>
              <option value="pyq_bank">PYQ Bank</option>
              <option value="mock_series">Mock Series</option>
            </select>
            <input
              type="text"
              placeholder="Subject (e.g., Quant, CS, GK)"
              value={newResource.subject}
              onChange={(e) =>
                setNewResource({ ...newResource, subject: e.target.value })
              }
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Total chapters/videos"
              value={newResource.total_chapters}
              onChange={(e) =>
                setNewResource({
                  ...newResource,
                  total_chapters: Number(e.target.value),
                })
              }
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
            />
            <input
              type="url"
              placeholder="URL (optional)"
              value={newResource.url}
              onChange={(e) =>
                setNewResource({ ...newResource, url: e.target.value })
              }
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
            />
          </div>
          <textarea
            placeholder="Notes (optional)"
            value={newResource.notes}
            onChange={(e) =>
              setNewResource({ ...newResource, notes: e.target.value })
            }
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 resize-none"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddResource}
              className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Recommended Resources */}
      {recommendedResources.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">
            Recommended (V5.1)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recommendedResources.slice(0, 6).map((rec) => {
              const isAdded = resources.some(
                (r) => r.name === rec.resource_name && r.subject === rec.subject
              );
              return (
                <div
                  key={rec.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {getTypeIcon(rec.resource_type)}
                        </span>
                        <span className="text-sm font-medium text-white truncate">
                          {rec.resource_name}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {rec.subject} • Priority {rec.priority}
                      </div>
                    </div>
                    {isAdded ? (
                      <span className="text-xs text-emerald-400 flex items-center gap-1">
                        <CheckCircle size={12} />
                        Added
                      </span>
                    ) : (
                      <button
                        onClick={() => addDefaultResource(rec)}
                        className="px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
                      >
                        + Add
                      </button>
                    )}
                  </div>
                  {rec.resource_url && (
                    <a
                      href={rec.resource_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                    >
                      <Link size={10} />
                      Open
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* My Resources */}
      <div>
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">
          My Resources
        </h3>
        {resources.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No resources yet. Add from recommendations or create your own.
          </div>
        ) : (
          <div className="space-y-2">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getTypeIcon(resource.type)}
                      </span>
                      <span className="text-sm font-medium text-white">
                        {resource.name}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded ${getStatusColor(
                          resource.status
                        )}`}
                      >
                        {resource.status === "completed"
                          ? "Completed"
                          : resource.status === "in_progress"
                          ? "In Progress"
                          : "Not Started"}
                      </span>
                    </div>
                    {resource.subject && (
                      <div className="text-xs text-slate-500 mt-1">
                        {resource.subject}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteResource(resource.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Progress</span>
                    <span>
                      {resource.completed_chapters}/{resource.total_chapters} (
                      {resource.progress_pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        resource.progress_pct === 100
                          ? "bg-emerald-500"
                          : resource.progress_pct > 0
                          ? "bg-amber-500"
                          : "bg-slate-700"
                      }`}
                      style={{ width: `${resource.progress_pct}%` }}
                    />
                  </div>
                </div>

                {/* Chapter Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateProgress(
                        resource.id,
                        Math.max(0, resource.completed_chapters - 1)
                      )
                    }
                    className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors"
                  >
                    -1
                  </button>
                  <span className="text-xs text-slate-400 flex-1 text-center">
                    Chapters completed
                  </span>
                  <button
                    onClick={() =>
                      updateProgress(
                        resource.id,
                        Math.min(
                          resource.total_chapters,
                          resource.completed_chapters + 1
                        )
                      )
                    }
                    className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors"
                  >
                    +1
                  </button>
                </div>

                {resource.url && (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                  >
                    <Link size={10} />
                    Open Resource
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}