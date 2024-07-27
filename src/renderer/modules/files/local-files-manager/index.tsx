import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect, useCallback, useRef } from 'react';

import { Tag } from 'primereact/tag';
import SelectFilesToUpload from '../select-files-to-upload/index';
import { RootState } from '../../../redux/store';
import Loading from '../../../components/loading';
import { LocalFile, LocalSimpleFile } from '../../../common/types';
import { setLocalFiles } from '../../../redux/slices/files';
import fetchRequest from '../../../utils/fetch';
import {
  decodeBase64,
  getTitleAndArtistFromFileName,
  sendEventToGetLocalJSONFile,
} from '../../../utils';
import { StepByFunction } from '../../../common/constants';
import HelpTemplate from '../../../components/help-template';
import getLabel from '../../../utils/lang';

type LocalFilesResult = {
  Count: number;
  Files: LocalFile[];
  FilesWithoutMetadata: LocalSimpleFile[];
};

export default function LocalFilesManager() {
  const eventDefined = useRef(false);
  const baseLocalFiles = useRef<LocalFile[]>([]);
  const searchedDirectory = useRef('');
  const [isSearching, toggleSearching] = useState(true);

  const folderSelected = useSelector(
    (state: RootState) => state.folderAndFiles.folderSelected,
  );
  const selectedFiles = useSelector(
    (state: RootState) => state.files.selectedLocalFiles,
  );
  const activeIndex = useSelector(
    (state: RootState) => state.steps.activeIndex,
  );

  const dispatch = useDispatch();

  const searchFilesInFolder = useCallback(async () => {
    const directoryHasChanges =
      folderSelected.directory !== searchedDirectory.current ||
      searchedDirectory.current === '';

    if (folderSelected.directory && directoryHasChanges) {
      toggleSearching(true);

      const localFiles = await fetchRequest<LocalFilesResult>('local-files', {
        queryParams: {
          directory: folderSelected.directory,
        },
      });
      searchedDirectory.current = folderSelected.directory;

      if (localFiles) {
        const filesWithoutMetadata = localFiles.FilesWithoutMetadata.map(
          (item) => {
            const { artist, title } = getTitleAndArtistFromFileName(
              item.file_name,
            );

            return {
              ...item,
              title,
              artist,
              album: '',
            };
          },
        );

        baseLocalFiles.current = [...localFiles.Files, ...filesWithoutMetadata];
        sendEventToGetLocalJSONFile('processed');
      }
    }
  }, [folderSelected]);

  useEffect(() => {
    if (activeIndex === StepByFunction.localFiles) {
      searchFilesInFolder();
    }
  }, [activeIndex, searchFilesInFolder]);

  useEffect(() => {
    if (!folderSelected.directory) {
      searchedDirectory.current = '';
    }
  }, [folderSelected]);

  useEffect(() => {
    if (!eventDefined.current) {
      window.electron.ipcRenderer.on('file-obtained', (data: unknown) => {
        const fileData = data as { fileName: string; data: string } | null;
        let processedFiles: string[] = [];

        if (fileData && fileData.fileName === 'processed') {
          try {
            processedFiles = JSON.parse(fileData.data) ?? [];
            if (processedFiles) {
              processedFiles = processedFiles.map((item) => decodeBase64(item));
            }
            // eslint-disable-next-line no-empty
          } catch (error) {}
        }

        const newLocalFiles = baseLocalFiles.current.map((item) => ({
          ...item,
          processed: processedFiles.includes(
            encodeURIComponent(item.complete_path),
          ),
        }));

        dispatch(setLocalFiles(newLocalFiles));

        toggleSearching(false);
      });
      eventDefined.current = true;
    }
  }, [dispatch]);

  return (
    <div className="files-manager">
      <h4 className="text-color-secondary">{getLabel('helps.localFiles')}</h4>

      <HelpTemplate identifier="localfiles">
        <p>
          {getLabel('localFiles.default')}{' '}
          <Tag value={getLabel('localFiles.unProcessed')} severity="info" />,
          {getLabel('localFiles.fileStatus')}{' '}
          <Tag value={getLabel('localFiles.processed')} severity="success" />{' '}
          {getLabel('localFiles.previousSearched')}{' '}
        </p>
        <p className="flex justify-content-center align-content-center">
          {getLabel('localFiles.canFilter')}
          <i className="pi pi-filter pl-2 pr-2" />
          {getLabel('localFiles.canFilterComplement')}
        </p>
      </HelpTemplate>

      {isSearching && (
        <div className="mt-3 flex flex-row align-items-center justify-content-center">
          <Loading />
          <span>{getLabel('localFiles.searching')}</span>
        </div>
      )}

      {!isSearching && (
        <div className="local-files-manager">
          <strong>
            {selectedFiles.length} {getLabel('localFiles.selectedOf')}{' '}
            {baseLocalFiles.current.length}
          </strong>
          <SelectFilesToUpload />
        </div>
      )}
    </div>
  );
}
