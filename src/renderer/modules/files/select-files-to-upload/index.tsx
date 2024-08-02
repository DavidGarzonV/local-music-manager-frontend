import { useDispatch, useSelector } from 'react-redux';
import {
  DataTable,
  DataTableFilterMeta,
  DataTableSelectionMultipleChangeEvent,
} from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useEffect, useRef, useState } from 'react';
import { FilterMatchMode } from 'primereact/api';
import { Tag } from 'primereact/tag';

import { Button } from 'primereact/button';
import { RootState } from '../../../redux/store';
import { LocalFile } from '../../../common/types';
import { setSelectedLocalFiles } from '../../../redux/slices/files';
import StatusRowFilterTemplate from './components/status-row-template';
import getLabel from '../../../utils/lang';

export default function SelectFilesToUpload() {
  const datatableRef = useRef<DataTable<LocalFile[]> | null>(null);
  const localFiles = useSelector((state: RootState) => state.files.localFiles);
  const selectedLocalFiles = useSelector(
    (state: RootState) => state.files.selectedLocalFiles,
  );

  const [filters, setFilters] = useState<DataTableFilterMeta | undefined>(
    undefined,
  );

  const dispatch = useDispatch();

  const selectFiles = (
    e: DataTableSelectionMultipleChangeEvent<LocalFile[]>,
  ) => {
    dispatch(setSelectedLocalFiles(e.value));
  };

  const initFilters = () => {
    setFilters({
      file_name: { value: null, matchMode: FilterMatchMode.CONTAINS },
      title: { value: null, matchMode: FilterMatchMode.CONTAINS },
      artist: { value: null, matchMode: FilterMatchMode.CONTAINS },
      processed: { value: false, matchMode: FilterMatchMode.EQUALS },
    });
  };

  const rowClass = (data: LocalFile) => {
    return {
      'bg-yellow-50': !!data.processed,
    };
  };

  useEffect(() => {
    initFilters();
  }, []);

  const selectAll = () => {
    const checkboxBox = document.querySelector(
      '.select-files-to-upload-table .p-datatable-thead .p-selection-column .p-checkbox .p-checkbox-box',
    ) as HTMLDivElement | undefined;

    if (checkboxBox) {
      const checked = checkboxBox.getAttribute('aria-checked') === 'true';
      if (!checked) {
        checkboxBox.click();
      }
    }
  };

  const clearFilter = () => {
    initFilters();
  };

  return (
    <DataTable
      value={localFiles}
      paginator
      rows={15}
      rowsPerPageOptions={[15, 20, 50, 100]}
      tableStyle={{ minWidth: '50rem' }}
      selectionMode="checkbox"
      selection={selectedLocalFiles}
      onSelectionChange={selectFiles}
      dataKey="id"
      sortField="file_name"
      filters={filters}
      globalFilterFields={['file_name', 'title', 'artist']}
      emptyMessage={getLabel('localFiles.empty')}
      rowClassName={rowClass}
      filterDisplay="menu"
      ref={datatableRef}
      className="select-files-to-upload-table"
      header={
        <div className="flex justify-content-between">
          <Button
            type="button"
            icon="pi pi-check-square"
            label={getLabel('localFiles.selectAll')}
            severity="info"
            onClick={selectAll}
          />
          <Button
            type="button"
            icon="pi pi-filter-slash"
            className="ml-2"
            label={getLabel('localFiles.clearFilter')}
            outlined
            onClick={clearFilter}
          />
        </div>
      }
    >
      <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
      <Column
        field="file_name"
        header={getLabel('localFiles.fileName')}
        sortable
        filter
      />
      <Column
        field="processed"
        dataType="boolean"
        header={getLabel('localFiles.status')}
        filter
        filterElement={StatusRowFilterTemplate}
        body={(item) =>
          item.processed ? (
            <Tag value={getLabel('localFiles.processed')} severity="success" />
          ) : (
            <Tag value={getLabel('localFiles.unProcessed')} severity="info" />
          )
        }
        style={{ width: '10%' }}
      />
      <Column
        field="title"
        header={getLabel('localFiles.title')}
        sortable
        filter
      />
      <Column
        field="artist"
        header={getLabel('localFiles.artist')}
        sortable
        filter
      />
    </DataTable>
  );
}
