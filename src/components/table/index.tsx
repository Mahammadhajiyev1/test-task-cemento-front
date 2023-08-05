import React, { FC, useState, useEffect, useRef } from "react";
import { DataTableProps } from "../interfaces";

const DataTable: FC<DataTableProps> = ({ tableData, mainColumn }) => {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() =>
    tableData.columns.map((column) => column.id)
  );
  const [editedData, setEditedData] = useState<{
    [rowId: string]: { [columnId: string]: any };
  }>({});
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const body = tableContainerRef.current;
    if (body) {
      body.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (body) {
        body.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);
  const handleSaveToSessionStorage = () => {
    const dataToSave = {
      sortKey,
      sortOrder,
      visibleColumns,
      editedData,
      searchQuery,
    };
    sessionStorage.setItem("dataTableState", JSON.stringify(dataToSave));
    alert("Data saved to session storage!");
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const toggleColumnVisibility = (columnId: string) => {
    setVisibleColumns((prevColumns) =>
      prevColumns.includes(columnId)
        ? prevColumns.filter((id) => id !== columnId)
        : [...prevColumns, columnId]
    );
  };

  const handleCellClick = (rowId: string, columnId: string) => {
    setEditedData((prevData) => {
      const updatedData = { ...prevData };
      if (!updatedData[rowId]) {
        updatedData[rowId] = {};
      }
      updatedData[rowId][columnId] = tableData.data.find(
        (row) => row.id === rowId
      )?.[columnId];
      return updatedData;
    });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const [rowId, columnId] = name.split("-");

    setEditedData((prevData) => ({
      ...prevData,
      [rowId]: { ...prevData[rowId], [columnId]: value },
    }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const renderCellContent = (
    rowId: string,
    columnId: string,
    cellData: any
  ) => {
    const column = tableData.columns.find((col) => col.id === columnId);
    if (!column) return null;

    const typeToRenderer: { [key: string]: (data: any) => React.ReactNode } = {
      string: (data) => (
        <input
          type='text'
          value={data}
          onChange={handleInputChange}
          className='p-4 border rounded-md'
        />
      ),
      number: (data) => (
        <input
          type='text'
          value={data}
          onChange={handleInputChange}
          className='p-4 border rounded-md'
        />
      ),
      boolean: (data) => (
        <select>
          <option defaultValue={data}>yes</option>
          <option>no</option>
        </select>
      ),
      selection: (data) => (
        <select>
          data.map(<option defaultValue={data}>{data}</option>)
        </select>
      ),
    };

    const renderer = typeToRenderer[column.type];
    if (!renderer) return null;

    return (
      <div onClick={() => handleCellClick(rowId, columnId)}>
        {renderer(cellData)}
      </div>
    );
  };

  const sortedData = sortKey
    ? [...tableData.data].sort((a, b) => {
        if (a[sortKey] < b[sortKey]) {
          return sortOrder === "asc" ? -1 : 1;
        }
        if (a[sortKey] > b[sortKey]) {
          return sortOrder === "asc" ? 1 : -1;
        }
        return 0;
      })
    : tableData.data;

  const filteredColumns = tableData.columns.filter((column) =>
    visibleColumns.includes(column.id)
  );

  const filteredData = sortedData.filter((row) => {
    const rowValues = Object.values(row).join("").toLowerCase();
    return rowValues.includes(searchQuery.toLowerCase());
  });

  const [visibleRows, setVisibleRows] = useState<number>(20);

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const container = tableContainerRef.current;
    if (container) {
      const isNearEnd =
        container.scrollHeight - container.scrollTop === container.clientHeight;
      if (isNearEnd) {
        setVisibleRows((prevVisibleRows) => prevVisibleRows + 10);
      }
    }
  };

  const visibleData = filteredData.slice(0, visibleRows);

  return (
    <div>
      <div className='mb-4'>
        <input
          type='text'
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder='Search...'
          className='p-2 border rounded-md w-96'
        />
        <button
          onClick={handleSaveToSessionStorage}
          className='px-4 py-2 mt-2 ml-4 bg-blue-500 text-white rounded-md'
        >
          Save Data Table
        </button>
      </div>

      <div className='flex flex-wrap gap-2'>
        {tableData.columns.map((column) => (
          <div
            key={`${column.id}-check`}
            className='p-2 rounded-[10px] border border-[#E0E0E0] flex items-center space-x-1'
          >
            <label
              key={`${column.id}-checkbox`}
              className='flex flex-wrap gap-2'
            >
              <input
                type='checkbox'
                className='p-2 rounded-[10px] border border-[#E0E0E0] flex items-center space-x-1'
                checked={visibleColumns.includes(column.id)}
                onChange={() => toggleColumnVisibility(column.id)}
              />
              {column.title}
            </label>
          </div>
        ))}
      </div>
      <div
        ref={tableContainerRef}
        style={{
          overflowY: "auto",
          overflowX: "auto",
          maxHeight: "500px",
          marginTop: "20px",
          borderWidth: "4px",
          borderRadius: "8px",
          borderColor: "156 163 175",
        }}
      >
        <table className='border-collapse border'>
          <thead>
            <tr className='bg-gray-100 sticky top-0'>
              {filteredColumns.map((column) => (
                <th
                  key={column.id}
                  className='py-2 px-4 border border-gray-300 cursor-pointer'
                  onClick={() => handleSort(column.id)}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleData.map((row) => (
              <tr key={row.id}>
                {filteredColumns.map((column) => (
                  <td
                    key={column.id + row.id}
                    className='py-2 px-4 border border-gray-300 rounded-b-lg overflow-hidden'
                    style={{
                      minWidth: column.width ? column.width : "",
                    }}
                  >
                    {renderCellContent(
                      row.id,
                      column.id,
                      editedData[row.id]?.[column.id] || row[column.id]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
