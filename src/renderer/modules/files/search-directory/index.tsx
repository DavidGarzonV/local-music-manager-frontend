import { useDispatch, useSelector } from 'react-redux';
import { useRef, useEffect } from 'react';
import SearchPath, { SearchPathRef } from '../../../components/search-path';
import {
  setLocalFiles,
  setSelectedLocalFiles,
} from '../../../redux/slices/files';
import { RootState } from '../../../redux/store';
import HelpTemplate from '../../../components/help-template';
import {
  DirectorySelected,
  setFolderSelected,
} from '../../../redux/slices/folderAndFiles';
import getLabel from '../../../utils/lang';

export default function SearchDirectory() {
  const dispatch = useDispatch();
  const renderedFolder = useRef<string | null>(null);
  const searchPathRef = useRef<SearchPathRef | null>(null);
  const directory = useSelector(
    (state: RootState) => state.folderAndFiles.folderSelected,
  );

  const onSelectedFolder = (directorySelected: DirectorySelected) => {
    if (directorySelected.directory !== renderedFolder.current) {
      dispatch(setLocalFiles([]));
      dispatch(setSelectedLocalFiles([]));
      dispatch(setFolderSelected(directorySelected));
    }
    renderedFolder.current = directorySelected.directory;
  };

  useEffect(() => {
    if (!directory.directory) {
      renderedFolder.current = null;
      searchPathRef.current?.resetInput();
    }
  }, [directory]);

  return (
    <div>
      <HelpTemplate identifier="directory">
        <p>{getLabel('helps.searchDirectory')}</p>
      </HelpTemplate>

      <div className="flex flex-column align-items-center">
        <div className="directory-selection w-3">
          <strong>{getLabel('selectFolder')}:</strong>
          <SearchPath ref={searchPathRef} onSelectedFolder={onSelectedFolder} />
        </div>
      </div>
    </div>
  );
}
