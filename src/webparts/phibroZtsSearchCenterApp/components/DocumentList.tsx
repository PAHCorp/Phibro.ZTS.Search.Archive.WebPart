import * as React from 'react';
import styles from './PhibroZtsSearchCenterApp.module.scss';
import { useState } from 'react';

import { IDocumentListProps } from '../../../interfaces';


const DocumentList: React.FC<IDocumentListProps> = (props: IDocumentListProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 14; // Change the items per page to 14

  // Function to toggle expansion
  const toggleExpansion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Get the current items to display
  const currentItems = props.docs.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  // Function to handle the next page
  const handleNext = () => {
    if ((currentPage + 1) * itemsPerPage < props.docs.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Function to handle the previous page
  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const formatVersion = (legacyVersionString: string) => {
    if (!legacyVersionString) return "N/A"; // Handle missing data

    const versions = legacyVersionString.split(',').map(v => v.trim());

    return versions.map(version => {
        if (version.includes("CURRENT")) {
          return `${version.replace("CURRENT", "").trim()} (Current)`;
        }
        return version;
      }).join(' ');
  }

  return (
    <div>
      <ul className={styles['document-list']}>
        {currentItems.map((item, index) => (
          <li key={index} className={styles['document-item']}  onClick={() => toggleExpansion(index)}>
            <div className={styles['document-row']}>
              <a href={`https://pahc.sharepoint.com/sites/Zoetis-Regulatory/Shared%20Documents/Zoetis%20Upload/Deccox${item.file}`} target="_blank">
                {item.namev}
              </a>
              <button onClick={() => toggleExpansion(index)} className={styles['arrow-button']}>
                {expandedIndex === index ? '▲' : '▼'} {/* Arrow button */}
              </button>
            </div>
            {expandedIndex === index && (
              <div className={styles['additional-details']}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <p><strong>Country:</strong> {item.countryiescnamev}</p>
                    <p><strong>Intended Species:</strong> {item.intendedspeciesc}</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <p><strong>Additional Audience:</strong> {item.additionalaudiencescnamev}</p>
                    <p><strong>Document ID:</strong> {item.Title}</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <p><strong>Brand Name:</strong> {item.brandname1cnamev}</p>
                    <p><strong>Company:</strong> {item.companycnamev}</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <p><strong>Version:</strong> {formatVersion(item.legacyversionc)}</p>
                  </div>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className={styles['pagination-controls']} >
        <button onClick={handlePrevious} disabled={currentPage === 0}>Previous</button>
        <button onClick={handleNext} disabled={(currentPage + 1) * itemsPerPage >= props.docs.length}>Next</button>
      </div>
    </div>
  );
};

export default DocumentList;
