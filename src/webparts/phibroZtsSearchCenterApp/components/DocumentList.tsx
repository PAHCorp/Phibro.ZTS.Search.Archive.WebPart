import * as React from 'react';
import styles from './PhibroZtsSearchCenterApp.module.scss';
import { useState } from 'react';


interface IDocumentListProps {
    docs: any[];
}

const DocumentList = (props: IDocumentListProps) => {
  // State to keep track of which item is expanded
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Function to toggle expansion
  const toggleExpansion = (index: any) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div>
      <ul className={styles['document-list']}>
        {props.docs && props.docs.slice(0, 15).map((item: (boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined)[], index: React.Key | React.SetStateAction<null> | undefined) => (
          <li className={styles['document-item']}>
            <div className={styles['document-row']}>
              <a href={`https://pahc.sharepoint.com/sites/Zoetis-Regulatory/Shared%20Documents/Zoetis%20Upload/Deccox${item[1]}`}>{item[0]}</a>
              <button onClick={() => toggleExpansion(index)} className={styles['arrow-button']}>
                {expandedIndex === index ? '▲' : '▼'} {/* Arrow button */}
              </button>
            </div>
            {expandedIndex === index && (
              <div className={styles['additional-details']}>
                {/* Replace with actual additional details related to the document */}
                <p>Details about {item[0]}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentList;