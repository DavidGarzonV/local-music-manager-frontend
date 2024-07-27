import React, {
  ForwardedRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { DirectorySelected } from '../../redux/slices/folderAndFiles';
import getLabel from '../../utils/lang';

type SearchPathProps = {
  onSelectedFolder: (directorySelected: DirectorySelected) => void;
};

type DirectoryFromSelection = {
  directory: string;
  files: number;
};

export type SearchPathRef = {
  resetInput: () => void;
  setValue: (value: string) => void;
};

const SearchPath = React.forwardRef(
  (
    { onSelectedFolder }: SearchPathProps,
    componentRef: ForwardedRef<SearchPathRef>,
  ) => {
    const [directory, setDirectory] = useState('');
    const [filesInFolder, setFilesInFolder] = useState(0);
    const eventDefined = useRef(false);

    const selectDirectory = async () => {
      window.electron.ipcRenderer.sendMessage('select-folder', ['select']);
    };

    useImperativeHandle(componentRef, () => ({
      resetInput() {
        setDirectory('');
      },
      setValue(value: string) {
        setDirectory(value);
      },
    }));

    useEffect(() => {
      if (!eventDefined.current) {
        window.electron.ipcRenderer.on('select-folder', (directorySelected) => {
          const newDirectory =
            directorySelected as DirectoryFromSelection | null;
          let folder = '';
          let filesFolder = 0;

          if (newDirectory) {
            folder = newDirectory.directory;
            filesFolder = newDirectory.files;
          }

          setDirectory(folder);
          setFilesInFolder(filesFolder);

          onSelectedFolder({
            directory: folder,
            filesInFolder: filesFolder,
          });
        });
        eventDefined.current = true;
      }
    }, [onSelectedFolder]);

    return (
      <>
        <div className="p-inputgroup">
          <InputText
            placeholder={getLabel('helps.selectFolder')}
            disabled
            value={directory}
          />
          <Button label={getLabel('choose')} onClick={selectDirectory} />
        </div>
        {directory && (
          <small className="p-0 text-color-secondary">
            {getLabel('helps.filesInFolder')}: {filesInFolder}
          </small>
        )}
      </>
    );
  },
);

export default SearchPath;
