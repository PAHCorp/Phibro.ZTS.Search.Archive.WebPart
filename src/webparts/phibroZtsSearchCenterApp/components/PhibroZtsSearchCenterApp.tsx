import * as React from 'react';
import styles from './PhibroZtsSearchCenterApp.module.scss';
import type { IPhibroZtsSearchCenterAppProps } from './IPhibroZtsSearchCenterAppProps';
import { SearchBox } from '@fluentui/react-components';
import { useState, useEffect, useCallback } from 'react';
import { SPFI } from '@pnp/sp';
import { getSP } from '../../../pnpConfig';
import { IDECCOX_Binder_6_Percent, IDeccox_Export_Full_Source } from '../../../interfaces';
import TreeView, { TreeViewTypes } from "devextreme-react/tree-view";
// import DocumentList from './DocumentList';

const PhibroZtsSearchCenterApp: React.FC<IPhibroZtsSearchCenterAppProps> = (props: IPhibroZtsSearchCenterAppProps) => {

  // let _sp:SPFI | null = getSP(props.context);
  const [_sp, _] = useState<SPFI | null>(getSP(props.context));
  const [searchQuery, setSearchQuery] = useState("");

  const [__, setCurrentItem] = useState({  });

  // const [binderData, setBinderData] = useState<IDECCOX_Binder_6_Percent[]>([]);
  // const [exportData, setExportData] = useState<IDeccox_Export_Full_Source[]>([]);

  const [products, setProducts] = useState<IDECCOX_Binder_6_Percent[]>();
  

  // This function convert the flat binder data into unflat JSON structure to connect it to the children inside it.
  function flatToHierarchy (flat: Object[]) {

    var roots: IDECCOX_Binder_6_Percent[] = [] // things without parent

    // make them accessible by guid on this map
    var all: { [key: string]: IDECCOX_Binder_6_Percent } = {};

    flat.forEach(function(item: IDECCOX_Binder_6_Percent) {
      all[item.OrderNumber] = item;
    })

    // connect items to its parent, and split roots apart
    Object.keys(all).forEach(function (OrderNumber) {
        var item = all[OrderNumber];
        if (item.parent === null) {
            roots.push(item);
        } else if (item.parent in all) {
            var p = all[item.parent]
            if (!('items' in p)) {
                p.items = [];
            }
            p.items?.push(item);
        }
    })

    // done!
    return roots
  }

  // This loads the data from sharepoint lists whenever the page loads.
  useEffect(() => {
    const fetchData = async () => {
      if (!_sp) return; // Ensure _sp is available before fetching

      try {
        const [fetchedBinderData, fetchedExportData] = await Promise.all([
          _sp.web.lists
            .getByTitle("DECCOX Binder 6 Percent")
            .items.select("OrderNumber", "field_1", "field_2", "field_3", "field_4")
            .top(2000)(),
          _sp.web.lists
            .getByTitle("Deccox Export Full Source")
            .items
            .top(2000)()
        ]);

        let mapping: { [key: string]: IDeccox_Export_Full_Source } = {};
        for (let i = 0; i < fetchedExportData.length; i++) {
          mapping[fetchedExportData[i]['Title']] = fetchedExportData[i];
        }


        // Sort the fetched Binder Data
        let sortedBinderData = fetchedBinderData.sort((n1, n2) => n1.OrderNumber - n2.OrderNumber);

        // The below code is to store the parent of each item. In other words, parent is the directory/folder that the item is inside.
        let parents = [null];
        for (let i = 0; i < sortedBinderData.length; i++) {
          sortedBinderData[i]["id"] = sortedBinderData[i]["OrderNumber"]
          sortedBinderData[i]["text"] = sortedBinderData[i]["field_2"];
          if (parents.length == sortedBinderData[i]["field_4"]) {
            parents.push(sortedBinderData[i]["OrderNumber"])
            sortedBinderData[i]["parent"] = parents[sortedBinderData[i]["field_4"] - 1]
          } else {
            sortedBinderData[i]["parent"] = parents[sortedBinderData[i]["field_4"] - 1]
            parents[sortedBinderData[i]["field_4"]] = sortedBinderData[i]["OrderNumber"]
          }

          if (sortedBinderData[i].field_1 !== 'section') {
            for (let [key, value] of Object.entries(mapping[sortedBinderData[i].field_3])) {
              sortedBinderData[i][key] = value;
            }
          }

          delete sortedBinderData[i]["odata.type"];
          delete sortedBinderData[i]["odata.id"];
          delete sortedBinderData[i]["odata.etag"];
          delete sortedBinderData[i]["odata.editLink"];
        }
      

        let recursiveArray = flatToHierarchy(sortedBinderData);
        console.log(recursiveArray);
        setProducts(recursiveArray);
        // setBinderData(fetchedBinderData);
        // setExportData(fetchedExportData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData(); // Call the fetch function
  }, [_sp]); // Dependency array includes _sp to re-run if it changes

  const getItem = async () => {
    try {
      console.log(searchQuery);
      // let tempBinderData = binderData.map(item=>item);
      // let tempExportData = exportData.map(item=>item);
      // // Prepare the search words set (case-insensitive)2az
      // const wordsSet = new Set(
      //   searchQuery
      //     .split(" ")
      //     .map(word => word.trim().toLowerCase())
      //     .filter(word => word.length > 0) // Remove empty strings
      // );
      // const wordsArray = Array.from(wordsSet);
  
      // Filter data based on search words
      // const filteredData = tempBinderData?.filter(item => {
      //   const fieldValue = item.field_2?.toLowerCase() || "";
      //   for (let word of wordsArray) {
      //     if (fieldValue.includes(word)) {
      //       return true;
      //     }
      //   }
      //   return false;
      // });
  
      // Create a Set of unique IDs from filtered data
      // const idSet = new Set(filteredData?.map(item => item.field_3) || []);
  
      // // Filter the full data based on idSet
      // const filteredFullData = tempExportData?.filter(item => {
      //   if (idSet.has(item.Title)) {
      //     return true;
      //   }
      //   if (searchQuery && item.countryiescnamev && searchQuery.toLowerCase().includes(item.countryiescnamev.toLowerCase())) {
      //     return true;
      //   }
      //   if (searchQuery && searchQuery === item.Title) {
      //     return true;
      //   }
      //   // if (searchQuery.includes)
      //   return false;
      // });
  
      // Update the state with the filtered documents
      // setDocuments(filteredFullData || []);
    } catch (err) {
      console.error("Error fetching and processing data:", err);
    }
  };
  

  const handleSearchInputChange = (event: any) => {
    setSearchQuery(event.target.value);
  };

  const handleKeyDown = (event: { key: string; preventDefault: () => void; }) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      getItem();
    }
  };

  const selectItem = useCallback(
    (e: TreeViewTypes.ItemClickEvent & { itemData?: IDECCOX_Binder_6_Percent }) => {
      setCurrentItem({ ...e.itemData });
    },
    [setCurrentItem]
  );


  return (
    <div className={styles.container}>
      {/* Left Column: Filters */}
      <div className={styles["left-column"]}>
        <h3>Filters</h3>
        {/* Add filter controls here */}
      </div>

      {/* Right Column: Search and Documents */}
      <div className={styles["right-column"]}>
        <div style={{display: 'flex', gap: '10px'}}>
          <SearchBox
          id='searchBoxValue'
          onChange={handleSearchInputChange}
          onKeyDown={handleKeyDown}
          placeholder='Search...'
          style={{ width: '400px' }}
          />
          <button onClick={getItem} style={{ padding: '8px 16px'}} >Search</button>
        </div>
        <div className="form">
          <TreeView
            id="simple-treeview"
            className={styles['document-list']}
            items={products}
            width="100%"
            onItemClick={selectItem}
          />
        </div>
      </div>
    </div>
  )
};

export default PhibroZtsSearchCenterApp;