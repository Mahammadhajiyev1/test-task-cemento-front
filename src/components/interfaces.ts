import { ChangeEvent } from "react";

export interface Column {
  id: string;
  ordinalNo: number;
  title: string;
  type: string;
  width?: number;
}

export interface DataRow {
  id: string;
  [columnId: string]: any;
}

export interface TableData {
  columns: Column[];
  data: DataRow[];
}

export interface DataTableProps {
  tableData: TableData;
  mainColumn: string; // The ID of the main column to group rows
}

export interface SearchInput {
  searchQuery: string;
  handleSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
}
