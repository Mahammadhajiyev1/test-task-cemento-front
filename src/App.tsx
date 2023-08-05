import React from "react";
import DataTable from "./components/table";
import { TableData } from "./components/interfaces";

import tableDataJson from "./table-data.json";

const App: React.FC = () => {
  const initialTableData: TableData = tableDataJson;

  return (
    <div className='container mx-auto my-4'>
      <DataTable tableData={initialTableData} mainColumn='name' />
    </div>
  );
};

export default App;
