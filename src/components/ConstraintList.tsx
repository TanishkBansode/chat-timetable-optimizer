
import React from 'react';
import { Constraint } from '../lib/types';
import { X } from 'lucide-react';

interface ConstraintListProps {
  constraints: Constraint[];
  onRemoveConstraint: (id: string) => void;
}

const ConstraintList: React.FC<ConstraintListProps> = ({ 
  constraints,
  onRemoveConstraint
}) => {
  if (constraints.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        No constraints yet. Start adding some through the chat!
      </div>
    );
  }

  return (
    <div className="space-y-2 animate-fade-in">
      {constraints.map((constraint) => (
        <div 
          key={constraint.id}
          className={`group flex items-center justify-between p-2 rounded-lg transition-all duration-300 hover:bg-secondary/50`}
        >
          <div className="flex items-center space-x-2">
            <div className={constraint.type === 'hard' ? 'hard-constraint' : 'soft-constraint'}>
              {constraint.type === 'hard' ? 'Required' : 'Preferred'}
            </div>
            <span className="text-sm">{constraint.text}</span>
          </div>
          
          <button
            onClick={() => onRemoveConstraint(constraint.id)}
            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
            aria-label="Remove constraint"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ConstraintList;
