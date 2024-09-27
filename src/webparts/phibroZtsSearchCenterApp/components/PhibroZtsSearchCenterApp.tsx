import * as React from 'react';
import styles from './PhibroZtsSearchCenterApp.module.scss';
import type { IPhibroZtsSearchCenterAppProps } from './IPhibroZtsSearchCenterAppProps';
import { SearchBox } from '@fluentui/react';
import { useState } from 'react';
import { SPFI } from '@pnp/sp';
import { getSP } from '../../../pnpConfig';
import { IDECCOX_Binder_6_Percent, IDeccox_Export_Full_Source } from '../../../interfaces';

const PhibroZtsSearchCenterApp: React.FC<IPhibroZtsSearchCenterAppProps> = (props: IPhibroZtsSearchCenterAppProps) => {

  let _sp:SPFI | null = getSP(props.context);

  const [searchQuery, setSearchQuery] = useState("");

  const [documents, setDocuments] = useState<any[]>([]);

  const getItem = async () => {
    try {
      // Fetch both lists concurrently with only necessary fields
      const [data, fullData] = await Promise.all([
        _sp?.web.lists
          .getByTitle("DECCOX Binder 6 Percent")
          .items.select("field_1", "field_2", "field_3", "field_4")
          .top(2000)(),
        _sp?.web.lists
          .getByTitle("Deccox Export Full Source")
          .items.select("Title", "file")
          .top(2000)()
      ]);
  
      console.log(`Fetched ${data?.length} items from DECCOX Binder 6 Percent`);
  
      // Map the necessary fields
      const newdata = data?.map((i: IDECCOX_Binder_6_Percent) => [
        i.field_1,
        i.field_2,
        i.field_3,
        i.field_4
      ]);

      const past_data = fullData?.map((i: IDeccox_Export_Full_Source) => {
        i.Title,
        i.file
      });
      console.log(past_data);
  
      // Prepare the search words set (case-insensitive)
      const wordsSet = new Set(
        searchQuery
          .split(" ")
          .map(word => word.trim().toLowerCase())
          .filter(word => word.length > 0) // Remove empty strings
      );
      console.log(newdata);
      console.log(wordsSet);
      const wordsArray = Array.from(wordsSet);
  
      // Filter data based on search words
      const filteredData = newdata?.filter(item => {
        const fieldValue = item[1]?.toLowerCase() || "";
        for (let word of wordsArray) {
          if (fieldValue.includes(word)) {
            return true;
          }
        }
        return false;
      });
  
      // Create a Set of unique IDs from filtered data
      const idSet = new Set(filteredData?.map(item => item[2]) || []);
      console.log(`Unique IDs:`, idSet);
  
      // Map the full data
      const newFullData = fullData?.map((i: IDeccox_Export_Full_Source) => [
        i.Title,
        i.file
      ]);
  
      // Filter the full data based on idSet
      const filteredFullData = newFullData?.filter(item => idSet.has(item[0]));
      console.log(`Filtered Full Data:`, filteredFullData);
  
      // Update the state with the filtered documents
      setDocuments(filteredData || []);
    } catch (err) {
      console.error("Error fetching and processing data:", err);
    }
  };
  

  const handleSearchInputChange = (event: any) => {
    setSearchQuery(event.target.value);
  };

  const handleKeyDown = () => {
    getItem();
  };


  return (
    <div className={styles.container}>
      {/* Left Column: Filters */}
      <div className={styles["left-column"]}>
        <h3>Filters</h3>
        {/* Add filter controls here */}
      </div>

      {/* Right Column: Search and Documents */}
      <div className={styles["right-column"]}>
        <div>
          <SearchBox
          id='searchBoxValue'
          onChange={handleSearchInputChange}
          placeholder='Search...'
          />
          <button onClick={handleKeyDown}>Search</button>
        </div>
        <ul className={styles['document-list']}>
        {documents && documents.map((item) => (
          <li>{item}</li> ))}
        </ul>
      </div>
    </div>
  )
};

export default PhibroZtsSearchCenterApp;