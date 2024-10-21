import * as React from 'react';
import styles from './PhibroZtsSearchCenterApp.module.scss';
import type { IPhibroZtsSearchCenterAppProps } from './IPhibroZtsSearchCenterAppProps';
import { SearchBox } from '@fluentui/react-components';
import { useState, useEffect, useCallback } from 'react';
import { SPFI } from '@pnp/sp';
import { getSP } from '../../../pnpConfig';
import { IDECCOX_Binder_6_Percent } from '../../../interfaces';
import TreeView, { TreeViewTypes } from "devextreme-react/tree-view";

const PhibroZtsSearchCenterApp: React.FC<IPhibroZtsSearchCenterAppProps> = (props: IPhibroZtsSearchCenterAppProps) => {

  // let _sp:SPFI | null = getSP(props.context);
  const [_sp, _] = useState<SPFI | null>(getSP(props.context));
  const [searchQuery, setSearchQuery] = useState("");

  const [__, setCurrentItem] = useState({  });


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
        const [fetchedBinderData] = await Promise.all([
          _sp.web.lists
            .getByTitle("Regulatory - Binders")
            .items
            .top(2000)()
        ]);
        console.log(fetchedBinderData);


        // Sort the fetched Binder Data
        let sortedBinderData = fetchedBinderData.sort((n1, n2) => n1.OrderNumber - n2.OrderNumber);

        // The below code is to store the parent of each item. In other words, parent is the directory/folder that the item is inside.
        let parents = [null];
        for (let i = 0; i < sortedBinderData.length; i++) {
          sortedBinderData[i]["id"] = sortedBinderData[i]["OrderNumber"];
          sortedBinderData[i]["text"] = sortedBinderData[i]["NodeName"];
          if (parents.length == sortedBinderData[i]["LevelNumber"]) {
            parents.push(sortedBinderData[i]["OrderNumber"])
            sortedBinderData[i]["parent"] = parents[sortedBinderData[i]["LevelNumber"] - 1]
          } else {
            sortedBinderData[i]["parent"] = parents[sortedBinderData[i]["LevelNumber"] - 1]
            parents[sortedBinderData[i]["LevelNumber"]] = sortedBinderData[i]["OrderNumber"]
          }

        }
        console.log(sortedBinderData);

        let recursiveArray = flatToHierarchy(sortedBinderData);
        setProducts(recursiveArray);
        console.log(products);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData(); // Call the fetch function
  }, [_sp]); // Dependency array includes _sp to re-run if it changes

  const getItem = async () => {
    try {
      console.log(searchQuery);
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
            searchEnabled={true}
            searchExpr={['Keyword']}
          />
        </div>
      </div>
    </div>
  )
};

export default PhibroZtsSearchCenterApp;