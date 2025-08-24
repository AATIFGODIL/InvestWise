typescriptreact
import React from 'react';

interface EducationalContentItem {
  title: string;
  description: string;
  filePath: string;
  type: 'image' | 'pdf';
}

interface EducationalContentDisplayProps {
  content: EducationalContentItem[];
}

const EducationalContentDisplay: React.FC<EducationalContentDisplayProps> = ({ content }) => {
  return (
    <div className="space-y-6">
      {content.map((item, index) => (
        <div
          key={index}
          className="border rounded-lg p-4"
          style={item.type === 'image' ? {
            backgroundImage: `url(${item.filePath})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '200px', // Added for visibility
            padding: '16px', // Added for visibility
            color: item.type === 'image' ? 'white' : 'inherit', // Make text readable on image
            textShadow: item.type === 'image' ? '1px 1px 3px rgba(0,0,0,0.5)' : 'none', // Add shadow for readability
          } : {}}
        >
          <h2>{item.title}</h2>
          <p>{item.description}</p>
          <a href={item.filePath} target="_blank" rel="noopener noreferrer">
            Read Document
          </a>
        </div>
      ))}
    </div>
  );
};

export default EducationalContentDisplay;