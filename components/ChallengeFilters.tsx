import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search, Globe, Lock, Code, X, Check } from 'lucide-react';

interface ChallengeFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  selectedDifficulties: string[];
  onDifficultyChange: (difficulties: string[]) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  totalChallenges: number;
  filteredCount: number;
}

const ChallengeFilters: React.FC<ChallengeFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategories,
  onCategoryChange,
  selectedDifficulties,
  onDifficultyChange,
  statusFilter,
  onStatusChange,
  totalChallenges,
  filteredCount
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { id: 'web', name: 'Web', icon: Globe, color: 'cyan' },
    { id: 'crypto', name: 'Crypto', icon: Lock, color: 'purple' },
    { id: 'binary', name: 'Binary', icon: Code, color: 'orange' },
    { id: 'forensics', name: 'Forensics', icon: Search, color: 'green' }
  ];

  const difficulties = [
    { id: 'easy', name: 'Easy', color: 'emerald' },
    { id: 'medium', name: 'Medium', color: 'yellow' },
    { id: 'hard', name: 'Hard', color: 'red' }
  ];

  const statusOptions = [
    { id: 'all', name: 'All Challenges' },
    { id: 'not_started', name: 'Not Started' },
    { id: 'attempted', name: 'In Progress' },
    { id: 'solved', name: 'Completed' }
  ];

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoryChange(selectedCategories.filter(c => c !== categoryId));
    } else {
      onCategoryChange([...selectedCategories, categoryId]);
    }
  };

  const toggleDifficulty = (difficultyId: string) => {
    if (selectedDifficulties.includes(difficultyId)) {
      onDifficultyChange(selectedDifficulties.filter(d => d !== difficultyId));
    } else {
      onDifficultyChange([...selectedDifficulties, difficultyId]);
    }
  };

  const clearAllFilters = () => {
    onSearchChange('');
    onCategoryChange([]);
    onDifficultyChange([]);
    onStatusChange('all');
  };

  const hasActiveFilters = searchTerm || selectedCategories.length > 0 || 
                          selectedDifficulties.length > 0 || statusFilter !== 'all';

  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 backdrop-blur-md">
      {/* Search and Toggle */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Search challenges..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center px-4 py-2.5 rounded-lg border transition-all ${
            showFilters || hasActiveFilters
              ? 'border-cyan-500 bg-cyan-950/20 text-cyan-400'
              : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
          }`}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 w-2 h-2 bg-cyan-500 rounded-full"></span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center px-3 py-2.5 text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
        <span>
          Showing {filteredCount} of {totalChallenges} challenges
        </span>
        {hasActiveFilters && (
          <span className="text-cyan-400">Filters active</span>
        )}
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-slate-800 pt-4 space-y-4"
        >
          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
              Progress Status
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(status => (
                <button
                  key={status.id}
                  onClick={() => onStatusChange(status.id)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                    statusFilter === status.id
                      ? 'border-cyan-500 bg-cyan-950/20 text-cyan-400'
                      : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {statusFilter === status.id && <Check className="w-3 h-3 mr-1 inline" />}
                  {status.name}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
              Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => {
                const Icon = category.icon;
                const isSelected = selectedCategories.includes(category.id);
                
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`flex items-center px-3 py-1.5 text-xs rounded-lg border transition-all ${
                      isSelected
                        ? `border-${category.color}-500 bg-${category.color}-950/20 text-${category.color}-400`
                        : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {category.name}
                    {isSelected && <Check className="w-3 h-3 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
              Difficulty
            </label>
            <div className="flex flex-wrap gap-2">
              {difficulties.map(difficulty => {
                const isSelected = selectedDifficulties.includes(difficulty.id);
                
                return (
                  <button
                    key={difficulty.id}
                    onClick={() => toggleDifficulty(difficulty.id)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                      isSelected
                        ? `border-${difficulty.color}-500 bg-${difficulty.color}-950/20 text-${difficulty.color}-400`
                        : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {difficulty.name}
                    {isSelected && <Check className="w-3 h-3 ml-1 inline" />}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ChallengeFilters;