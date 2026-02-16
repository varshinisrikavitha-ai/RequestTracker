import React from 'react';
import { CheckCircle } from 'lucide-react';

const Timeline = ({ stages }) => {
  return (
    <div className="space-y-4">
      {stages.map((stage, index) => (
        <div key={index} className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                stage.status === 'completed'
                  ? 'bg-green-100 text-green-600'
                  : stage.status === 'in-progress'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {stage.status === 'completed' && <CheckCircle size={20} />}
              {stage.status === 'in-progress' && <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />}
              {stage.status === 'pending' && <div className="w-3 h-3 bg-gray-400 rounded-full" />}
            </div>
            {index < stages.length - 1 && (
              <div
                className={`w-1 h-8 ${
                  stage.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'
                }`}
              />
            )}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{stage.stage}</h4>
            <p className="text-sm text-gray-500">{stage.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
