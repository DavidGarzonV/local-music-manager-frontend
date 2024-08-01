import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Divider } from 'primereact/divider';
import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import getLabel from '../../../../utils/lang';

export type PlaylistData = {
  name: string;
  description: string;
  privacyStatus: 'PRIVATE' | 'PUBLIC';
};

type NewPlayListFormProps = {
  onSave(dataForm: PlaylistData): void;
};

const DEFAULT_FORM: PlaylistData = {
  name: '',
  description: '',
  privacyStatus: 'PUBLIC',
};

export default function NewPlayListForm(props: NewPlayListFormProps) {
  const { onSave } = props;
  const [validate, setValidate] = useState(false);
  const [dataForm, setDataForm] = useState<PlaylistData>(DEFAULT_FORM);

  const savePlaylist = async () => {
    setValidate(true);
    if (dataForm.name.trim()) {
      onSave(dataForm);
    }
  };

  useEffect(() => {
    setDataForm(DEFAULT_FORM);
  }, []);

  return (
    <div>
      <div className="flex flex-column gap-2 mb-2">
        <label htmlFor="name" aria-labelledby="name-help">
          {getLabel('form.name')}
        </label>
        <InputText
          id="name"
          placeholder={getLabel('form.name')}
          required
          autoFocus
          invalid={validate && !dataForm.name.trim()}
          onChange={(e) =>
            setDataForm({
              ...dataForm,
              name: e.target.value,
            })
          }
        />
        <small
          id="name-help"
          className="error"
          hidden={!!dataForm.name.trim() || !validate}
        >
          {getLabel('form.nameRequired')}
        </small>
      </div>

      <div className="flex flex-column gap-2 mb-2">
        <label htmlFor="description">{getLabel('form.description')}</label>
        <InputText
          id="description"
          placeholder={getLabel('form.description')}
          onChange={(e) =>
            setDataForm({
              ...dataForm,
              description: e.target.value,
            })
          }
        />
      </div>

      <div className="flex flex-column gap-2 mb-2">
        <label htmlFor="privacy">{getLabel('playlist.privacity')}</label>
        <Dropdown
          id="privacy"
          value={dataForm.privacyStatus}
          onChange={(e) =>
            setDataForm({
              ...dataForm,
              privacyStatus: e.value,
            })
          }
          options={[
            {
              label: getLabel('playlist.public'),
              value: 'PUBLIC',
            },
            {
              label: getLabel('playlist.private'),
              value: 'PRIVATE',
            },
          ]}
          optionLabel="label"
          placeholder={getLabel('playlist.selectPrivacity')}
          className="w-full"
        />
      </div>
      <Divider />
      <div className="text-right">
        <Button
          label={getLabel('save')}
          severity="success"
          icon="pi pi-save"
          onClick={savePlaylist}
        />
      </div>
    </div>
  );
}
