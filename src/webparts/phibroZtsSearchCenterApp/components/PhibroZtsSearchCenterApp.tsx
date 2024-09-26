import * as React from 'react';
import styles from './PhibroZtsSearchCenterApp.module.scss';
import type { IPhibroZtsSearchCenterAppProps } from './IPhibroZtsSearchCenterAppProps';
import { SearchBox } from '@fluentui/react';
import { useEffect, useState } from 'react';
import { SPFI } from '@pnp/sp';
import { getSP } from '../../../pnpConfig';
import { IDECCOX_Binder_6_Percent, IDeccox_Export_Full_Source } from '../../../interfaces';

const PhibroZtsSearchCenterApp: React.FC<IPhibroZtsSearchCenterAppProps> = (props: IPhibroZtsSearchCenterAppProps) => {

  let _sp:SPFI | null = getSP(props.context);

  const [searchQuery, _] = useState("");

  const [documents, setDocuments] = useState<any[]>([]);

  const getItem = async () => {
    try {
      const data = await _sp?.web.lists.getByTitle("DECCOX Binder 6 Percent").items.top(2000)();
      console.log(data?.length);
      const newdata = data?.map((i: IDECCOX_Binder_6_Percent) => [i.field_1, i.field_2, i.field_3, i.field_4]);
      const wordsArray = searchQuery.split(" ");
      const wordsSet = new Set(wordsArray);
      const filteredData = newdata?.filter((item) => {
        for (let i = 0; i < item[1].length; i++) {
          for (let j = i; j < item[1].length; j++) {
            if (wordsSet.has(item[1].slice(i, j+1))) {
              return true;
            }
          }
        }
        return false;
      });
      const idSet = new Set();
      if (filteredData){
        for (let i = 0; i < filteredData?.length; i++) {
          if (!(idSet.has(filteredData[i][2]))) {
            idSet.add(filteredData[i][2]);
          }
        }
      }
      console.log(idSet);
      const fullData = await _sp?.web.lists.getByTitle("Deccox Export Full Source").items.top(2000)();
      const newFullData = fullData?.map((i: IDeccox_Export_Full_Source) => [i.Title, i.file]);
      const filteredFullData = newFullData?.filter((item) => idSet.has(item[0]));
      console.log(filteredFullData);
      setDocuments(filteredFullData || []);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    getItem();
  }, [searchQuery])


  // const handleKeyDown = () => {
  //   getItem();
  // };


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
          placeholder='Search...'
          />
          <button onClick={()=>console.log("clicked")}>Search</button>
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